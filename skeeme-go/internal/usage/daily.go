package usage

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Feature string

const (
	Chat       Feature = "chat"
	Scan       Feature = "scan"
	Quiz       Feature = "quiz"
	Flashcards Feature = "flashcard"
	Summary    Feature = "summary"
)

var ErrDailyLimitReached = errors.New("daily usage limit reached")

func IsFreeTier(tier string) bool {
	tier = strings.TrimSpace(tier)
	return tier == "" || strings.EqualFold(tier, "free")
}

type Reservation struct {
	UserID          int64
	Date            time.Time
	Feature         Feature
	RequestID       string
	Limit           int
	Used            int
	AlreadyReserved bool
}

func DailyLimit(feature Feature, tier string) (int, error) {
	switch feature {
	case Chat, Scan, Quiz, Flashcards, Summary:
	default:
		return 0, fmt.Errorf("unsupported usage feature %q", feature)
	}

	if IsFreeTier(tier) {
		if feature == Chat {
			return 2, nil
		}
		return 1, nil
	}
	if feature == Chat {
		return 200, nil
	}
	return 30, nil
}

func FeatureForAction(action string) (Feature, error) {
	switch strings.TrimSpace(action) {
	case "scan_chat":
		return Chat, nil
	case "scan_solve":
		return Scan, nil
	case "quiz_generation":
		return Quiz, nil
	case "flashcard_generation":
		return Flashcards, nil
	case "summary_generation":
		return Summary, nil
	default:
		return "", fmt.Errorf("unsupported usage action %q", action)
	}
}

func Reserve(ctx context.Context, db *sqlx.DB, userID int64, requestID string, feature Feature, tier string, now time.Time) (Reservation, error) {
	limit, err := DailyLimit(feature, tier)
	if err != nil {
		return Reservation{}, err
	}
	if db == nil {
		return Reservation{}, errors.New("usage database is unavailable")
	}
	if strings.TrimSpace(requestID) == "" {
		return Reservation{}, errors.New("usage request ID is required")
	}

	date := time.Date(now.UTC().Year(), now.UTC().Month(), now.UTC().Day(), 0, 0, 0, 0, time.UTC)
	reservation := Reservation{
		UserID:    userID,
		Date:      date,
		Feature:   feature,
		RequestID: requestID,
		Limit:     limit,
	}

	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return Reservation{}, fmt.Errorf("begin usage reservation: %w", err)
	}
	defer tx.Rollback()

	result, err := tx.ExecContext(ctx, `
		INSERT INTO ai_daily_usage_requests (user_id, request_id, feature, usage_date, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, 'reserved', NOW(), NOW())
		ON CONFLICT (user_id, request_id) DO NOTHING
	`, userID, requestID, string(feature), date)
	if err != nil {
		return Reservation{}, fmt.Errorf("create usage reservation: %w", err)
	}
	inserted, err := result.RowsAffected()
	if err != nil {
		return Reservation{}, fmt.Errorf("check usage reservation: %w", err)
	}

	if inserted == 0 {
		var existing struct {
			Feature string    `db:"feature"`
			Date    time.Time `db:"usage_date"`
			Status  string    `db:"status"`
			Used    int       `db:"used"`
		}
		err = tx.GetContext(ctx, &existing, `
			SELECT r.feature, r.usage_date, r.status, COALESCE(u.used, 0) AS used
			FROM ai_daily_usage_requests r
			LEFT JOIN ai_daily_usage u
				ON u.user_id = r.user_id AND u.feature = r.feature AND u.usage_date = r.usage_date
			WHERE r.user_id = $1 AND r.request_id = $2
			FOR UPDATE OF r
		`, userID, requestID)
		if err != nil {
			return Reservation{}, fmt.Errorf("load existing usage reservation: %w", err)
		}
		reservation.Feature = Feature(existing.Feature)
		reservation.Date = existing.Date
		reservation.Used = existing.Used
		if existing.Status != "released" {
			reservation.AlreadyReserved = true
			if err := tx.Commit(); err != nil {
				return Reservation{}, fmt.Errorf("commit duplicate usage reservation: %w", err)
			}
			return reservation, nil
		}
		if err := tx.GetContext(ctx, &reservation.Used, `
			INSERT INTO ai_daily_usage (user_id, feature, usage_date, used, updated_at)
			VALUES ($1, $2, $3, 1, NOW())
			ON CONFLICT (user_id, feature, usage_date)
			DO UPDATE SET used = ai_daily_usage.used + 1, updated_at = NOW()
			WHERE ai_daily_usage.used < $4
			RETURNING used
		`, userID, string(feature), date, limit); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return reservation, ErrDailyLimitReached
			}
			return Reservation{}, fmt.Errorf("reserve daily usage: %w", err)
		}
		_, err = tx.ExecContext(ctx, `
			UPDATE ai_daily_usage_requests
			SET feature = $1, usage_date = $2, status = 'reserved', updated_at = NOW()
			WHERE user_id = $3 AND request_id = $4
		`, string(feature), date, userID, requestID)
		if err != nil {
			return Reservation{}, fmt.Errorf("reopen usage reservation: %w", err)
		}
	} else {
		err = tx.GetContext(ctx, &reservation.Used, `
			INSERT INTO ai_daily_usage (user_id, feature, usage_date, used, updated_at)
			VALUES ($1, $2, $3, 1, NOW())
			ON CONFLICT (user_id, feature, usage_date)
			DO UPDATE SET used = ai_daily_usage.used + 1, updated_at = NOW()
			WHERE ai_daily_usage.used < $4
			RETURNING used
		`, userID, string(feature), date, limit)
		if errors.Is(err, sql.ErrNoRows) {
			return reservation, ErrDailyLimitReached
		}
		if err != nil {
			return Reservation{}, fmt.Errorf("reserve daily usage: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return Reservation{}, fmt.Errorf("commit usage reservation: %w", err)
	}
	return reservation, nil
}

func Complete(ctx context.Context, db *sqlx.DB, reservation Reservation) error {
	if db == nil {
		return errors.New("usage database is unavailable")
	}
	_, err := db.ExecContext(ctx, `
		UPDATE ai_daily_usage_requests
		SET status = 'completed', updated_at = NOW()
		WHERE user_id = $1 AND request_id = $2 AND status = 'reserved'
	`, reservation.UserID, reservation.RequestID)
	if err != nil {
		return fmt.Errorf("complete daily usage reservation: %w", err)
	}
	return nil
}

func Release(ctx context.Context, db *sqlx.DB, reservation Reservation) error {
	if db == nil {
		return errors.New("usage database is unavailable")
	}
	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin usage release: %w", err)
	}
	defer tx.Rollback()

	var released struct {
		Feature string    `db:"feature"`
		Date    time.Time `db:"usage_date"`
	}
	err = tx.GetContext(ctx, &released, `
		UPDATE ai_daily_usage_requests
		SET status = 'released', updated_at = NOW()
		WHERE user_id = $1 AND request_id = $2 AND status = 'reserved'
		RETURNING feature, usage_date
	`, reservation.UserID, reservation.RequestID)
	if errors.Is(err, sql.ErrNoRows) {
		return tx.Commit()
	}
	if err != nil {
		return fmt.Errorf("mark usage reservation released: %w", err)
	}
	_, err = tx.ExecContext(ctx, `
		UPDATE ai_daily_usage
		SET used = GREATEST(used - 1, 0), updated_at = NOW()
		WHERE user_id = $1 AND feature = $2 AND usage_date = $3
	`, reservation.UserID, released.Feature, released.Date)
	if err != nil {
		return fmt.Errorf("release daily usage: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit usage release: %w", err)
	}
	return nil
}

func NextResetUTC(now time.Time) time.Time {
	now = now.UTC()
	return time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, time.UTC)
}
