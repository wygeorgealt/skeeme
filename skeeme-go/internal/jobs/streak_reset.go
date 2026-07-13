package jobs

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
)

// ResetStreaks runs daily at midnight to reset streaks if a user didn't study yesterday.
func ResetStreaks(db *sqlx.DB) error {
	ctx := context.Background()
	
	// Reset streaks for users who haven't studied since before yesterday
	query := `
		UPDATE study_streaks 
		SET current_streak = 0 
		WHERE last_study_date < CURRENT_DATE - INTERVAL '1 day' 
		OR last_study_date IS NULL
	`

	res, err := db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to reset streaks: %w", err)
	}

	rows, _ := res.RowsAffected()
	fmt.Printf("Reset %d streaks successfully.\n", rows)
	
	// TODO: Trigger push notifications for users whose streaks were reset
	return nil
}
