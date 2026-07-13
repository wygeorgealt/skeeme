package models

import (
	"database/sql"
)

type PersonalAccessToken struct {
	ID            int64          `db:"id"`
	TokenableType string         `db:"tokenable_type"`
	TokenableID   int64          `db:"tokenable_id"`
	Name          string         `db:"name"`
	Token         string         `db:"token"`
	Abilities     sql.NullString `db:"abilities"`
	LastUsedAt    sql.NullTime   `db:"last_used_at"`
	ExpiresAt     sql.NullTime   `db:"expires_at"`
	CreatedAt     sql.NullTime   `db:"created_at"`
	UpdatedAt     sql.NullTime   `db:"updated_at"`
}
