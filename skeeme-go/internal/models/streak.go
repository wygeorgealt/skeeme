package models

import (
	"database/sql"
)

type StudyStreak struct {
	ID              int64        `db:"id" json:"id"`
	UserID          int64        `db:"user_id" json:"user_id"`
	CurrentStreak   int          `db:"current_streak" json:"current_streak"`
	LongestStreak   int          `db:"longest_streak" json:"longest_streak"`
	UnclaimedReward int          `db:"unclaimed_reward" json:"unclaimed_reward"`
	LastStudyDate   sql.NullTime `db:"last_study_date" json:"last_study_date"`
	CreatedAt       sql.NullTime `db:"created_at" json:"created_at"`
	UpdatedAt       sql.NullTime `db:"updated_at" json:"updated_at"`
}
