package jobs

import (
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// PendingCleanup deletes students who have been pending for > 2 hours.
func PendingCleanup(db *sqlx.DB) {
	log.Println("[Pending Cleanup Job] Starting...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete users where status is 'pending' and created > 2 hours ago
	res, err := db.ExecContext(ctx, `
		DELETE FROM users 
		WHERE status = 'pending' 
		AND created_at < NOW() - INTERVAL '2 hours'
	`)

	if err != nil {
		log.Printf("[Pending Cleanup Job] Failed to delete pending students: %v\n", err)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	log.Printf("[Pending Cleanup Job] Finished. Deleted %d pending students.\n", rowsAffected)
}
