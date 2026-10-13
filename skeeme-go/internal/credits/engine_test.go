package credits

import (
	"context"
	"database/sql"
	"errors"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/alicebob/miniredis/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func setupTestEnvironment(t *testing.T) (*sqlx.DB, sqlmock.Sqlmock, *redis.Client, *miniredis.Miniredis) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create sqlmock: %v", err)
	}

	sqlxDB := sqlx.NewDb(mockDB, "postgres")

	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("Failed to run miniredis: %v", err)
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: mr.Addr(),
	})

	return sqlxDB, mock, rdb, mr
}

func TestDeduct_Success(t *testing.T) {
	db, mock, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	ctx := context.Background()
	userID := int64(101)
	amount := 25
	reqID := "req_deduct_123"

	mock.ExpectBegin()
	// Idempotency check: no row found
	mock.ExpectQuery(regexp.QuoteMeta("SELECT 1 FROM transactions WHERE request_id = $1")).
		WithArgs(reqID).
		WillReturnError(sql.ErrNoRows)

	// User lock & select credits
	rows := sqlmock.NewRows([]string{"credits", "subscription_tier"}).
		AddRow(100, "free")
	mock.ExpectQuery(regexp.QuoteMeta("SELECT credits, subscription_tier FROM users WHERE id = $1 FOR UPDATE")).
		WithArgs(userID).
		WillReturnRows(rows)

	// Update user balance: 100 - 25 = 75
	mock.ExpectExec(regexp.QuoteMeta("UPDATE users SET credits = $1 WHERE id = $2")).
		WithArgs(75, userID).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Insert transaction
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO transactions")).
		WithArgs(userID, "scan_solve", "anthropic", reqID, -25).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectCommit()

	err := Deduct(ctx, db, rdb, userID, amount, reqID, "scan_solve", "anthropic")
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestDeduct_InsufficientCredits(t *testing.T) {
	db, mock, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	ctx := context.Background()
	userID := int64(102)
	amount := 50
	reqID := "req_insufficient_123"

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta("SELECT 1 FROM transactions WHERE request_id = $1")).
		WithArgs(reqID).
		WillReturnError(sql.ErrNoRows)

	// User only has 20 credits, needs 50
	rows := sqlmock.NewRows([]string{"credits", "subscription_tier"}).
		AddRow(20, "free")
	mock.ExpectQuery(regexp.QuoteMeta("SELECT credits, subscription_tier FROM users WHERE id = $1 FOR UPDATE")).
		WithArgs(userID).
		WillReturnRows(rows)

	mock.ExpectRollback()

	err := Deduct(ctx, db, rdb, userID, amount, reqID, "quiz_generation", "anthropic")
	if !errors.Is(err, ErrInsufficientCredits) {
		t.Fatalf("Expected ErrInsufficientCredits, got: %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestDeduct_DuplicateRequest(t *testing.T) {
	db, mock, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	ctx := context.Background()
	userID := int64(103)
	amount := 25
	reqID := "req_duplicate_123"

	mock.ExpectBegin()
	// Idempotency check: row found (already exists!)
	mock.ExpectQuery(regexp.QuoteMeta("SELECT 1 FROM transactions WHERE request_id = $1")).
		WithArgs(reqID).
		WillReturnRows(sqlmock.NewRows([]string{"1"}).AddRow(1))

	mock.ExpectRollback()

	err := Deduct(ctx, db, rdb, userID, amount, reqID, "scan_solve", "anthropic")
	if !errors.Is(err, ErrDuplicateRequest) {
		t.Fatalf("Expected ErrDuplicateRequest, got: %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestDeduct_NegativeAmount(t *testing.T) {
	db, _, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	err := Deduct(context.Background(), db, rdb, 104, -10, "req_neg", "scan_solve", "anthropic")
	if err == nil {
		t.Fatalf("Expected error for negative deduction amount, got nil")
	}
}

func TestRefund_Success(t *testing.T) {
	db, mock, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	ctx := context.Background()
	userID := int64(105)
	amount := 25
	reqID := "refund_req_123"

	mock.ExpectBegin()
	// Idempotency: not yet refunded
	mock.ExpectQuery(regexp.QuoteMeta("SELECT 1 FROM transactions WHERE request_id = $1")).
		WithArgs(reqID).
		WillReturnError(sql.ErrNoRows)

	// User row lock
	rows := sqlmock.NewRows([]string{"credits"}).AddRow(50)
	mock.ExpectQuery(regexp.QuoteMeta("SELECT credits FROM users WHERE id = $1 FOR UPDATE")).
		WithArgs(userID).
		WillReturnRows(rows)

	// Update user: credits + 25
	mock.ExpectExec(regexp.QuoteMeta("UPDATE users SET credits = credits + $1 WHERE id = $2")).
		WithArgs(amount, userID).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Insert refund transaction
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO transactions")).
		WithArgs(userID, "scan_solve", reqID, amount).
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectCommit()

	err := Refund(ctx, db, rdb, userID, amount, reqID, "scan_solve")
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestRefund_DuplicateRequest(t *testing.T) {
	db, mock, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	ctx := context.Background()
	userID := int64(106)
	amount := 25
	reqID := "refund_duplicate_123"

	mock.ExpectBegin()
	// Row already exists
	mock.ExpectQuery(regexp.QuoteMeta("SELECT 1 FROM transactions WHERE request_id = $1")).
		WithArgs(reqID).
		WillReturnRows(sqlmock.NewRows([]string{"1"}).AddRow(1))

	mock.ExpectRollback()

	err := Refund(ctx, db, rdb, userID, amount, reqID, "scan_solve")
	if !errors.Is(err, ErrDuplicateRequest) {
		t.Fatalf("Expected ErrDuplicateRequest, got: %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestRefund_NegativeAmount(t *testing.T) {
	db, _, rdb, mr := setupTestEnvironment(t)
	defer db.Close()
	defer mr.Close()

	err := Refund(context.Background(), db, rdb, 107, -50, "refund_neg", "scan_solve")
	if err == nil {
		t.Fatalf("Expected error for negative refund, got nil")
	}
}
