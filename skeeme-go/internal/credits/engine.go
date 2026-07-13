package credits

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

var (
	ErrInsufficientCredits = errors.New("insufficient credits")
	ErrDuplicateRequest    = errors.New("duplicate request")
)

// Deduct processes an AI authorization, deducting credits safely with complex subscription logic.
func Deduct(ctx context.Context, db *sqlx.DB, rdb *redis.Client, userID int64, amount int, reqID, actionType, modelUsed string) error {
	if amount < 0 {
		return errors.New("amount must be positive")
	}

	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Idempotency check
	if reqID != "" {
		var exists int
		err := tx.GetContext(ctx, &exists, "SELECT 1 FROM transactions WHERE request_id = $1", reqID)
		if err == nil {
			return ErrDuplicateRequest
		}
		if err != sql.ErrNoRows {
			return err
		}
	}

	// 2. Lock user row
	var user struct {
		Credits          int    `db:"credits"`
		SubscriptionTier string `db:"subscription_tier"`
	}
	err = tx.GetContext(ctx, &user, "SELECT credits, subscription_tier FROM users WHERE id = $1 FOR UPDATE", userID)
	if err != nil {
		return fmt.Errorf("could not lock user: %w", err)
	}

	// 3. Process Subscription Refills before deduction
	now := time.Now().UTC()
	currentCredits := user.Credits

	if user.SubscriptionTier == "pro" && currentCredits <= 0 {
		// Pro Plan: Daily allowance of 500 credits
		todayStr := now.Format("2006-01-02")
		allowanceKey := fmt.Sprintf("daily_allowance_date:%d", userID)
		
		lastAllowanceDate, _ := rdb.Get(ctx, allowanceKey).Result()
		if lastAllowanceDate != todayStr {
			currentCredits = 500
			
			// Hard set credits
			_, err = tx.ExecContext(ctx, "UPDATE users SET credits = $1 WHERE id = $2", currentCredits, userID)
			if err != nil {
				return fmt.Errorf("could not refill pro credits: %w", err)
			}
			rdb.Set(ctx, allowanceKey, todayStr, 48*time.Hour)
			
			// Write audit log
			_, _ = tx.ExecContext(ctx, `INSERT INTO transactions (user_id, type, amount, description, created_at, updated_at) 
				VALUES ($1, 'credit_refill', $2, 'Pro plan daily refill', NOW(), NOW())`, userID, 500)
		}
	} else if user.SubscriptionTier == "free" {
		// Free Plan: 14-day refill check
		emptiedKey := fmt.Sprintf("credits_emptied_at:%d", userID)
		emptiedAtStr, err := rdb.Get(ctx, emptiedKey).Result()
		if err == nil && emptiedAtStr != "" {
			emptiedAt, parseErr := time.Parse(time.RFC3339, emptiedAtStr)
			if parseErr == nil {
				// We wait 14 days from depletion time
				refillTime := emptiedAt.AddDate(0, 0, 14)
				if now.After(refillTime) || now.Equal(refillTime) {
					currentCredits = 100
					
					_, err = tx.ExecContext(ctx, "UPDATE users SET credits = $1, last_credit_refill_at = NOW() WHERE id = $2", currentCredits, userID)
					if err != nil {
						return fmt.Errorf("could not refill free credits: %w", err)
					}
					rdb.Del(ctx, emptiedKey)
					
					_, _ = tx.ExecContext(ctx, `INSERT INTO transactions (user_id, type, amount, description, created_at, updated_at) 
						VALUES ($1, 'credit_refill', $2, 'Free plan 14-day refill (100 credits)', NOW(), NOW())`, userID, 100)
				}
			}
		}
	}

	// 4. Check sufficient balance
	if currentCredits < amount {
		return ErrInsufficientCredits
	}

	// 5. Deduct safely capping at 0
	actualDeduction := amount
	if currentCredits < amount {
		actualDeduction = currentCredits
	}
	
	newCredits := currentCredits - actualDeduction

	// 6. Update user
	_, err = tx.ExecContext(ctx, "UPDATE users SET credits = $1 WHERE id = $2", newCredits, userID)
	if err != nil {
		return fmt.Errorf("could not deduct credits: %w", err)
	}

	// 7. Check if a free user just hit 0
	if currentCredits > 0 && newCredits <= 0 && user.SubscriptionTier == "free" {
		emptiedKey := fmt.Sprintf("credits_emptied_at:%d", userID)
		rdb.Set(ctx, emptiedKey, now.Format(time.RFC3339), 30*24*time.Hour)
		// Note: The Laravel queue job (NotifyFreeUserCreditRefilled) is still dispatched by the admin panel or will be handled independently.
	}

	// 8. Write usage transaction log
	_, err = tx.ExecContext(ctx, `
		INSERT INTO transactions 
		(user_id, type, action_type, model_used, request_id, amount, description, created_at, updated_at) 
		VALUES ($1, 'usage', $2, $3, $4, $5, 'AI Generation', NOW(), NOW())`,
		userID, actionType, modelUsed, reqID, -actualDeduction)
	if err != nil {
		return fmt.Errorf("could not insert transaction: %w", err)
	}

	return tx.Commit()
}

// Refund processes a credit refund.
func Refund(ctx context.Context, db *sqlx.DB, rdb *redis.Client, userID int64, amount int, reqID, actionType string) error {
	if amount < 0 {
		return errors.New("amount must be positive")
	}

	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Idempotency
	if reqID != "" {
		var exists int
		err := tx.GetContext(ctx, &exists, "SELECT 1 FROM transactions WHERE request_id = $1", reqID)
		if err == nil {
			return ErrDuplicateRequest
		}
		if err != sql.ErrNoRows {
			return err
		}
	}

	// Lock user row
	var currentCredits int
	err = tx.GetContext(ctx, &currentCredits, "SELECT credits FROM users WHERE id = $1 FOR UPDATE", userID)
	if err != nil {
		return err
	}

	// Refund user
	_, err = tx.ExecContext(ctx, "UPDATE users SET credits = credits + $1 WHERE id = $2", amount, userID)
	if err != nil {
		return fmt.Errorf("could not refund credits: %w", err)
	}

	// Write transaction log
	_, err = tx.ExecContext(ctx, `
		INSERT INTO transactions 
		(user_id, type, action_type, request_id, amount, description, created_at, updated_at) 
		VALUES ($1, 'refund', $2, $3, $4, 'Refunded AI credits', NOW(), NOW())`,
		userID, actionType, reqID, amount)
	if err != nil {
		return fmt.Errorf("could not insert refund transaction: %w", err)
	}

	return tx.Commit()
}
