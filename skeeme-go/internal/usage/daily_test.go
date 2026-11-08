package usage

import (
	"context"
	"database/sql"
	"errors"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
)

func TestDailyLimit(t *testing.T) {
	tests := []struct {
		name    string
		feature Feature
		tier    string
		want    int
	}{
		{"free chat", Chat, "free", 2},
		{"paid chat", Chat, "pro", 200},
		{"free scan", Scan, "free", 1},
		{"paid scan", Scan, "standard", 30},
		{"free quiz", Quiz, "free", 1},
		{"paid flashcards", Flashcards, "elite", 30},
		{"free summary", Summary, "free", 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := DailyLimit(tt.feature, tt.tier)
			if err != nil {
				t.Fatalf("DailyLimit() error = %v", err)
			}
			if got != tt.want {
				t.Fatalf("DailyLimit() = %d, want %d", got, tt.want)
			}
		})
	}

	if _, err := DailyLimit("unknown", "free"); err == nil {
		t.Fatal("DailyLimit() expected unsupported feature error")
	}
}

func TestReserve(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	now := time.Date(2026, 3, 2, 23, 30, 0, 0, time.FixedZone("local", -5*60*60))
	expectedDate := time.Date(2026, 3, 3, 0, 0, 0, 0, time.UTC)
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO ai_daily_usage_requests")).
		WithArgs(int64(7), "chat-request", "chat", expectedDate).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectQuery(regexp.QuoteMeta("INSERT INTO ai_daily_usage")).
		WithArgs(int64(7), "chat", expectedDate, 2).
		WillReturnRows(sqlmock.NewRows([]string{"used"}).AddRow(2))
	mock.ExpectCommit()

	reservation, err := Reserve(context.Background(), sqlxDB, 7, "chat-request", Chat, "free", now)
	if err != nil {
		t.Fatalf("Reserve() error = %v", err)
	}
	if reservation.Used != 2 || reservation.Limit != 2 || !reservation.Date.Equal(expectedDate) {
		t.Fatalf("unexpected reservation: %+v", reservation)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestReserveLimitReached(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO ai_daily_usage_requests")).
		WithArgs(int64(8), "scan-request", "scan", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectQuery(regexp.QuoteMeta("INSERT INTO ai_daily_usage")).
		WithArgs(int64(8), "scan", sqlmock.AnyArg(), 1).
		WillReturnError(sql.ErrNoRows)
	mock.ExpectRollback()

	_, err = Reserve(context.Background(), sqlxDB, 8, "scan-request", Scan, "free", time.Now())
	if !errors.Is(err, ErrDailyLimitReached) {
		t.Fatalf("Reserve() error = %v, want ErrDailyLimitReached", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestRelease(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	date := time.Date(2026, 3, 3, 0, 0, 0, 0, time.UTC)
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta("UPDATE ai_daily_usage_requests")).
		WithArgs(int64(7), "quiz-request").
		WillReturnRows(sqlmock.NewRows([]string{"feature", "usage_date"}).AddRow("quiz", date))
	mock.ExpectExec(regexp.QuoteMeta("UPDATE ai_daily_usage")).
		WithArgs(int64(7), "quiz", date).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	err = Release(context.Background(), sqlxDB, Reservation{UserID: 7, RequestID: "quiz-request"})
	if err != nil {
		t.Fatalf("Release() error = %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestReserveDuplicateRequestDoesNotIncrementUsage(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	date := time.Date(2026, 3, 3, 0, 0, 0, 0, time.UTC)
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO ai_daily_usage_requests")).
		WithArgs(int64(9), "same-request", "quiz", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery(regexp.QuoteMeta("SELECT r.feature, r.usage_date, r.status")).
		WithArgs(int64(9), "same-request").
		WillReturnRows(sqlmock.NewRows([]string{"feature", "usage_date", "status", "used"}).
			AddRow("quiz", date, "completed", 1))
	mock.ExpectCommit()

	reservation, err := Reserve(context.Background(), sqlxDB, 9, "same-request", Quiz, "free", date)
	if err != nil {
		t.Fatalf("Reserve() error = %v", err)
	}
	if !reservation.AlreadyReserved || reservation.Used != 1 {
		t.Fatalf("unexpected duplicate reservation: %+v", reservation)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestNextResetUTC(t *testing.T) {
	now := time.Date(2026, 3, 3, 23, 59, 0, 0, time.FixedZone("local", -5*60*60))
	want := time.Date(2026, 3, 5, 0, 0, 0, 0, time.UTC)
	if got := NextResetUTC(now); !got.Equal(want) {
		t.Fatalf("NextResetUTC() = %v, want %v", got, want)
	}
}
