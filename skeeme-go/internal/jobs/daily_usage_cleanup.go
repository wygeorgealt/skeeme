package jobs

import (
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

func CleanupDailyUsageRequests(db *sqlx.DB) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.ExecContext(ctx, `
		DELETE FROM ai_daily_usage_requests
		WHERE usage_date < (NOW() AT TIME ZONE 'UTC')::date - 30
	`)
	if err != nil {
		log.Printf("[Daily Usage Cleanup] Failed to delete old request records: %v", err)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("[Daily Usage Cleanup] Deleted old request records, but could not read row count: %v", err)
		return
	}
	log.Printf("[Daily Usage Cleanup] Deleted %d request records older than 30 days.", rowsAffected)
}
