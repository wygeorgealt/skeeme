package migrations

import (
	"context"
	"embed"
	"fmt"
	"log"
	"path"
	"sort"
	"strconv"
	"strings"

	"github.com/jmoiron/sqlx"
)

//go:embed *.sql
var migrationFiles embed.FS

const migrationLockID int64 = 728194602

func Apply(ctx context.Context, db *sqlx.DB) error {
	if db == nil {
		return fmt.Errorf("database is unavailable")
	}
	if _, err := db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS skeeme_schema_migrations (
			migration_id VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		return fmt.Errorf("create migration tracking table: %w", err)
	}

	files, err := migrationFiles.ReadDir(".")
	if err != nil {
		return fmt.Errorf("read embedded migrations: %w", err)
	}
	sort.Slice(files, func(i, j int) bool { return files[i].Name() < files[j].Name() })

	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin migration transaction: %w", err)
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock($1)`, migrationLockID); err != nil {
		return fmt.Errorf("acquire migration lock: %w", err)
	}

	for _, file := range files {
		name := file.Name()
		if file.IsDir() || !isForwardMigration(name) {
			continue
		}

		contents, err := migrationFiles.ReadFile(name)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}
		if len(contents) == 0 {
			return fmt.Errorf("migration %s is empty", name)
		}

		var applied bool
		if err := tx.GetContext(ctx, &applied,
			`SELECT EXISTS (SELECT 1 FROM skeeme_schema_migrations WHERE migration_id = $1)`,
			name,
		); err != nil {
			return fmt.Errorf("check migration %s: %w", name, err)
		}
		if applied {
			continue
		}

		if _, err := tx.ExecContext(ctx, string(contents)); err != nil {
			return fmt.Errorf("apply migration %s: %w", name, err)
		}
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO skeeme_schema_migrations (migration_id) VALUES ($1)`,
			name,
		); err != nil {
			return fmt.Errorf("record migration %s: %w", name, err)
		}
		log.Printf("[Migrations] Applied %s", name)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit migrations: %w", err)
	}
	return nil
}

func isForwardMigration(name string) bool {
	if path.Ext(name) != ".sql" {
		return false
	}
	prefix, _, ok := strings.Cut(name, "_")
	if !ok {
		return false
	}
	version, err := strconv.Atoi(prefix)
	return err == nil && version > 1
}
