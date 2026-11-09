package migrations

import (
	"context"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
)

func TestApplyRunsUnappliedMigrationsAndExcludesReferenceSchema(t *testing.T) {
	rawDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer rawDB.Close()
	database := sqlx.NewDb(rawDB, "postgres")

	mock.ExpectExec(regexp.QuoteMeta("CREATE TABLE IF NOT EXISTS skeeme_schema_migrations")).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("SELECT pg_advisory_xact_lock($1)")).
		WithArgs(migrationLockID).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS (SELECT 1 FROM skeeme_schema_migrations WHERE migration_id = $1)")).
		WithArgs("002_daily_ai_usage.sql").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(false))
	mock.ExpectExec(`(?s)CREATE TABLE IF NOT EXISTS ai_daily_usage`).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec(regexp.QuoteMeta("INSERT INTO skeeme_schema_migrations (migration_id) VALUES ($1)")).
		WithArgs("002_daily_ai_usage.sql").
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	if err := Apply(context.Background(), database); err != nil {
		t.Fatalf("Apply returned error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}

func TestApplySkipsRecordedMigrations(t *testing.T) {
	rawDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer rawDB.Close()
	database := sqlx.NewDb(rawDB, "postgres")

	mock.ExpectExec(regexp.QuoteMeta("CREATE TABLE IF NOT EXISTS skeeme_schema_migrations")).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("SELECT pg_advisory_xact_lock($1)")).
		WithArgs(migrationLockID).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS (SELECT 1 FROM skeeme_schema_migrations WHERE migration_id = $1)")).
		WithArgs("002_daily_ai_usage.sql").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))
	mock.ExpectCommit()

	if err := Apply(context.Background(), database); err != nil {
		t.Fatalf("Apply returned error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}
