package credits

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

var (
	ErrInsufficientCredits = errors.New("insufficient credits")
	ErrDuplicateRequest    = errors.New("duplicate request")
)

// Deduct processes an AI authorization, deducting credits safely.
func Deduct(ctx context.Context, db *sqlx.DB, userID int64, amount int, reqID, actionType, modelUsed string) error {
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
	var currentCredits int
	err = tx.GetContext(ctx, &currentCredits, "SELECT credits FROM users WHERE id = $1 FOR UPDATE", userID)
	if err != nil {
		return fmt.Errorf("could not lock user: %w", err)
	}

	// 3. Check sufficient balance
	if currentCredits < amount {
		return ErrInsufficientCredits
	}

	// 4. Update user
	_, err = tx.ExecContext(ctx, "UPDATE users SET credits = credits - $1 WHERE id = $2", amount, userID)
	if err != nil {
		return fmt.Errorf("could not deduct credits: %w", err)
	}

	// 5. Write transaction log
	_, err = tx.ExecContext(ctx, `
		INSERT INTO transactions 
		(user_id, type, action_type, model_used, request_id, amount, description, created_at, updated_at) 
		VALUES ($1, 'deduction', $2, $3, $4, $5, 'AI Generation', NOW(), NOW())`,
		userID, actionType, modelUsed, reqID, -amount)
	if err != nil {
		return fmt.Errorf("could not insert transaction: %w", err)
	}

	return tx.Commit()
}

// Refund processes a credit refund.
func Refund(ctx context.Context, db *sqlx.DB, userID int64, amount int, reqID, actionType string) error {
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

	// Update user
	_, err = tx.ExecContext(ctx, "UPDATE users SET credits = credits + $1 WHERE id = $2", amount, userID)
	if err != nil {
		return err
	}

	// Write transaction log
	_, err = tx.ExecContext(ctx, `
		INSERT INTO transactions 
		(user_id, type, action_type, request_id, amount, description, created_at, updated_at) 
		VALUES ($1, 'refund', $2, $3, $4, 'Refund', NOW(), NOW())`,
		userID, actionType, reqID, amount)
	if err != nil {
		return err
	}

	return tx.Commit()
}
