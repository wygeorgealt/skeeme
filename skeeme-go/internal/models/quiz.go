package models

import (
	"database/sql"
)

type QuizSession struct {
	ID               int64          `db:"id" json:"id"`
	UserID           int64          `db:"user_id" json:"user_id"`
	Topic            string         `db:"topic" json:"topic"`
	Difficulty       string         `db:"difficulty" json:"difficulty"`
	TotalQuestions   int            `db:"total_questions" json:"total_questions"`
	CorrectAnswers   int            `db:"correct_answers" json:"correct_answers"`
	ScorePercentage  float64        `db:"score_percentage" json:"score_percentage"`
	TimeSpentSeconds sql.NullInt64  `db:"time_spent_seconds" json:"time_spent_seconds"`
	CreatedAt        sql.NullTime   `db:"created_at" json:"created_at"`
	UpdatedAt        sql.NullTime   `db:"updated_at" json:"updated_at"`
}
