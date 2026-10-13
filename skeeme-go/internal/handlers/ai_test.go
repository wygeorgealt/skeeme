package handlers

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/alicebob/miniredis/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/ai"
	"skeeme-go/internal/middleware"
	"skeeme-go/internal/models"
)

func setupHandlerTestEnv(t *testing.T) (*sqlx.DB, sqlmock.Sqlmock, *redis.Client, *miniredis.Miniredis) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create sqlmock: %v", err)
	}

	sqlxDB := sqlx.NewDb(mockDB, "postgres")

	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("Failed to run miniredis: %v", err)
	}

	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	return sqlxDB, mock, rdb, mr
}

func TestAIHandler_InsufficientCredits(t *testing.T) {
	db, mock, rdb, mr := setupHandlerTestEnv(t)
	defer db.Close()
	defer mr.Close()

	user := &models.User{
		ID:    1,
		Email: "test@skeeme.com",
	}

	handler := NewAIHandler(db, rdb)

	// User has 10 credits, but solve costs 25
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta("SELECT 1 FROM transactions WHERE request_id = $1")).
		WillReturnError(sql.ErrNoRows)

	rows := sqlmock.NewRows([]string{"credits", "subscription_tier"}).
		AddRow(10, "free")
	mock.ExpectQuery(regexp.QuoteMeta("SELECT credits, subscription_tier FROM users WHERE id = $1 FOR UPDATE")).
		WithArgs(user.ID).
		WillReturnRows(rows)

	mock.ExpectRollback()

	body := `{"image":"data:image/png;base64,abc123"}`
	req := httptest.NewRequest(http.MethodPost, "/api/scan/solve", bytes.NewReader([]byte(body)))
	req = req.WithContext(middleware.SetUser(req.Context(), user))
	rec := httptest.NewRecorder()

	handler.Solve(rec, req)

	if rec.Code != http.StatusPaymentRequired {
		t.Fatalf("Expected status 402 Payment Required, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]string
	_ = json.Unmarshal(rec.Body.Bytes(), &resp)
	if !strings.Contains(resp["error"], "not have enough credits") {
		t.Errorf("Expected insufficient credits error, got: %s", resp["error"])
	}
}

func TestAIHandler_RateLimit_Exceeded(t *testing.T) {
	db, _, rdb, mr := setupHandlerTestEnv(t)
	defer db.Close()
	defer mr.Close()

	user := &models.User{
		ID:    2,
		Email: "ratelimit@skeeme.com",
	}

	handler := NewAIHandler(db, rdb)

	// Pre-fill 10 requests into rate limit key for user 2
	for i := 0; i < 10; i++ {
		_, _ = ai.CheckRateLimit(context.Background(), rdb, user.ID, 10, time.Minute)
	}

	body := `{"image":"data:image/png;base64,abc123"}`
	req := httptest.NewRequest(http.MethodPost, "/api/scan/solve", bytes.NewReader([]byte(body)))
	req = req.WithContext(middleware.SetUser(req.Context(), user))
	rec := httptest.NewRecorder()

	handler.Solve(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("Expected status 429 Too Many Requests, got %d. Body: %s", rec.Code, rec.Body.String())
	}
}
