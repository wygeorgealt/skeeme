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

func TestAIHandler_DailyLimitReached(t *testing.T) {
	db, mock, rdb, mr := setupHandlerTestEnv(t)
	defer db.Close()
	defer mr.Close()

	user := &models.User{ID: 1, Email: "test@skeeme.com", SubscriptionTier: "free"}

	handler := NewAIHandler(db, rdb)

	requestID := "limit-test"
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO ai_daily_usage_requests")).
		WithArgs(user.ID, requestID, "scan", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectQuery(regexp.QuoteMeta("INSERT INTO ai_daily_usage")).
		WithArgs(user.ID, "scan", sqlmock.AnyArg(), 1).
		WillReturnError(sql.ErrNoRows)
	mock.ExpectRollback()

	body := `{"image":"data:image/png;base64,abc123"}`
	req := httptest.NewRequest(http.MethodPost, "/api/scan/solve", bytes.NewReader([]byte(body)))
	req.Header.Set("Idempotency-Key", requestID)
	req = req.WithContext(middleware.SetUser(req.Context(), user))
	rec := httptest.NewRecorder()

	handler.Solve(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("Expected status 429 Too Many Requests, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	if resp["code"] != "daily_limit_reached" || resp["feature"] != "scan" || resp["limit"] != float64(1) {
		t.Fatalf("Unexpected daily limit response: %v", resp)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
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

func TestAIHandler_AdminSwitch_VerifyAndSet(t *testing.T) {
	db, _, rdb, mr := setupHandlerTestEnv(t)
	defer db.Close()
	defer mr.Close()

	handler := NewAIHandler(db, rdb)

	// 1. Password verification with wrong password -> 401
	badVerifyReq := httptest.NewRequest(http.MethodPost, "/api/admin/ai/verify", strings.NewReader(`{"password":"wrong-password"}`))
	badVerifyRec := httptest.NewRecorder()
	handler.VerifyAdminPassword(badVerifyRec, badVerifyReq)
	if badVerifyRec.Code != http.StatusUnauthorized {
		t.Fatalf("Expected 401 for wrong password, got %d", badVerifyRec.Code)
	}

	// 2. Password verification with valid password -> 200
	goodVerifyReq := httptest.NewRequest(http.MethodPost, "/api/admin/ai/verify", strings.NewReader(`{"password":"skeeme-admin-2026"}`))
	goodVerifyRec := httptest.NewRecorder()
	handler.VerifyAdminPassword(goodVerifyRec, goodVerifyReq)
	if goodVerifyRec.Code != http.StatusOK {
		t.Fatalf("Expected 200 for valid password, got %d", goodVerifyRec.Code)
	}

	// 3. Switch default provider to Anthropic
	switchReq := httptest.NewRequest(http.MethodPost, "/api/admin/ai/provider", strings.NewReader(`{"password":"skeeme-admin-2026","provider":"anthropic"}`))
	switchRec := httptest.NewRecorder()
	handler.SetAdminProvider(switchRec, switchReq)
	if switchRec.Code != http.StatusOK {
		t.Fatalf("Expected 200 for setting provider, got %d. Body: %s", switchRec.Code, switchRec.Body.String())
	}

	var switchResp map[string]any
	_ = json.Unmarshal(switchRec.Body.Bytes(), &switchResp)
	if switchResp["active_provider"] != "anthropic" {
		t.Fatalf("Expected active provider 'anthropic', got %v", switchResp["active_provider"])
	}

	// 4. Get active provider
	getReq := httptest.NewRequest(http.MethodGet, "/api/admin/ai/provider", nil)
	getRec := httptest.NewRecorder()
	handler.GetAdminProvider(getRec, getReq)
	var getResp map[string]any
	_ = json.Unmarshal(getRec.Body.Bytes(), &getResp)
	if getResp["active_provider"] != "anthropic" {
		t.Fatalf("Expected active provider to be 'anthropic', got %v", getResp["active_provider"])
	}

	// 5. Switch back to DeepSeek
	switchBackReq := httptest.NewRequest(http.MethodPost, "/api/admin/ai/provider", strings.NewReader(`{"password":"skeeme-admin-2026","provider":"deepseek"}`))
	switchBackRec := httptest.NewRecorder()
	handler.SetAdminProvider(switchBackRec, switchBackReq)
	if switchBackRec.Code != http.StatusOK {
		t.Fatalf("Expected 200 for setting provider back, got %d", switchBackRec.Code)
	}

	activeNow := handler.AIService.GetDefaultProvider(context.Background())
	if activeNow != ai.ProviderDeepseek {
		t.Fatalf("Expected active provider to be deepseek, got %v", activeNow)
	}
}
