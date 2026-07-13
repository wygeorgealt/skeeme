package models

import (
	"database/sql"
)

type Transaction struct {
	ID          int64          `db:"id" json:"id"`
	UserID      int64          `db:"user_id" json:"user_id"`
	Type        string         `db:"type" json:"type"` // e.g. "deduction", "refund", "purchase"
	ActionType  sql.NullString `db:"action_type" json:"action_type"`
	ModelUsed   sql.NullString `db:"model_used" json:"model_used"`
	RequestID   sql.NullString `db:"request_id" json:"request_id"`
	Amount      int            `db:"amount" json:"amount"` // Positive = credit, Negative = debit
	Description sql.NullString `db:"description" json:"description"`
	Metadata    []byte         `db:"metadata" json:"metadata"` // JSONB
	CreatedAt   sql.NullTime   `db:"created_at" json:"created_at"`
	UpdatedAt   sql.NullTime   `db:"updated_at" json:"updated_at"`
}
