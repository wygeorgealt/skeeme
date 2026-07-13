package models

import (
	"database/sql"
)

type FlashcardDeck struct {
	ID          int64          `db:"id" json:"id"`
	UserID      int64          `db:"user_id" json:"user_id"`
	Title       string         `db:"title" json:"title"`
	Description sql.NullString `db:"description" json:"description"`
	SourceType  string         `db:"source_type" json:"source_type"`
	CreatedAt   sql.NullTime   `db:"created_at" json:"created_at"`
	UpdatedAt   sql.NullTime   `db:"updated_at" json:"updated_at"`
}

type Flashcard struct {
	ID              int64        `db:"id" json:"id"`
	FlashcardDeckID int64        `db:"flashcard_deck_id" json:"flashcard_deck_id"`
	Front           string       `db:"front" json:"front"`
	Back            string       `db:"back" json:"back"`
	OrderColumn     int          `db:"order_column" json:"order_column"`
	CreatedAt       sql.NullTime `db:"created_at" json:"created_at"`
	UpdatedAt       sql.NullTime `db:"updated_at" json:"updated_at"`
}

type FlashcardSession struct {
	ID              int64        `db:"id" json:"id"`
	UserID          int64        `db:"user_id" json:"user_id"`
	FlashcardDeckID int64        `db:"flashcard_deck_id" json:"flashcard_deck_id"`
	CardsCount      int          `db:"cards_count" json:"cards_count"`
	CompletedAt     sql.NullTime `db:"completed_at" json:"completed_at"`
	CreatedAt       sql.NullTime `db:"created_at" json:"created_at"`
	UpdatedAt       sql.NullTime `db:"updated_at" json:"updated_at"`
}
