package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
	"skeeme-go/internal/models"
)

type FlashcardHandler struct {
	DB *sqlx.DB
}

type flashcardDeckListItem struct {
	ID              int64          `db:"id" json:"id"`
	UserID          int64          `db:"user_id" json:"user_id"`
	Title           string         `db:"title" json:"title"`
	Description     sql.NullString `db:"description" json:"description"`
	SourceType      string         `db:"source_type" json:"source_type"`
	CreatedAt       sql.NullTime   `db:"created_at" json:"created_at"`
	UpdatedAt       sql.NullTime   `db:"updated_at" json:"updated_at"`
	FlashcardsCount int            `db:"flashcards_count" json:"flashcards_count"`
}

func (h *FlashcardHandler) ListDecks(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var decks []flashcardDeckListItem
	err := h.DB.SelectContext(r.Context(), &decks, `
		SELECT d.id, d.user_id, d.title, d.description, d.source_type, d.created_at, d.updated_at,
			COUNT(f.id) AS flashcards_count
		FROM flashcard_decks d
		LEFT JOIN flashcards f ON f.flashcard_deck_id = d.id
		WHERE d.user_id = $1
		GROUP BY d.id
		ORDER BY d.created_at DESC
	`, user.ID)
	if err != nil {
		log.Printf("[flashcard] ListDecks DB error for user %d: %v", user.ID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to fetch flashcard decks from database"})
		return
	}

	if decks == nil {
		decks = []flashcardDeckListItem{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(decks)
}

func (h *FlashcardHandler) GetDeck(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	id := chi.URLParam(r, "id")

	var deck models.FlashcardDeck
	err := h.DB.GetContext(r.Context(), &deck, "SELECT * FROM flashcard_decks WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"message": "Flashcard deck not found"})
		return
	}

	// Also fetch cards
	var cards []models.Flashcard
	err = h.DB.SelectContext(r.Context(), &cards, "SELECT * FROM flashcards WHERE flashcard_deck_id = $1 ORDER BY order_column ASC", deck.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to load cards for this deck"})
		return
	}

	if cards == nil {
		cards = []models.Flashcard{}
	}

	deckResponse := map[string]interface{}{
		"id":          deck.ID,
		"user_id":     deck.UserID,
		"title":       deck.Title,
		"description": deck.Description,
		"source_type": deck.SourceType,
		"created_at":  deck.CreatedAt,
		"updated_at":  deck.UpdatedAt,
		"flashcards":  cards,
		"cards":       cards,
	}

	response := map[string]interface{}{
		"data":        deckResponse,
		"deck":        deckResponse,
		"cards":       cards,
		"flashcards":  cards,
		"id":          deck.ID,
		"title":       deck.Title,
		"source_type": deck.SourceType,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *FlashcardHandler) DeleteDeck(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	id := chi.URLParam(r, "id")

	result, err := h.DB.ExecContext(r.Context(), "DELETE FROM flashcard_decks WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to delete flashcard deck"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"message": "Flashcard deck not found or already deleted"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type CreateDeckRequest struct {
	Topic        string `json:"topic"`
	ExtractionID string `json:"extraction_id"`
}

func (h *FlashcardHandler) CreateDeck(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var req CreateDeckRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Ignore decode errors since form-data might be sent, just default title
	}

	title := "New Flashcard Set"
	sourceType := "topic"
	if req.Topic != "" {
		title = req.Topic
	} else if req.ExtractionID != "" {
		title = "Extracted Document"
		sourceType = "file"
	} else if r.Header.Get("Content-Type") != "" { // form-data fallback
		sourceType = "file"
	}

	var newID int64
	err := h.DB.QueryRowContext(r.Context(), `
		INSERT INTO flashcard_decks (user_id, title, source_type, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id
	`, user.ID, title, sourceType).Scan(&newID)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to create flashcard deck in database"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Deck created successfully",
		"id":      newID,
		"data": map[string]interface{}{
			"id":          newID,
			"title":       title,
			"source_type": sourceType,
		},
	})
}

type SaveCardsRequest struct {
	Cards []struct {
		Front string `json:"front"`
		Back  string `json:"back"`
	} `json:"cards"`
}

func (h *FlashcardHandler) SaveCards(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	deckID := chi.URLParam(r, "id")

	var req SaveCardsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"message": "Invalid cards payload"})
		return
	}

	// Verify deck ownership
	var count int
	h.DB.Get(&count, "SELECT count(*) FROM flashcard_decks WHERE id = $1 AND user_id = $2", deckID, user.ID)
	if count == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]any{"message": "Deck not found or you do not have permission to edit it"})
		return
	}

	tx, err := h.DB.Beginx()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Database transaction error"})
		return
	}

	// Delete old cards
	tx.Exec("DELETE FROM flashcards WHERE flashcard_deck_id = $1", deckID)

	// Insert new cards
	for i, card := range req.Cards {
		_, err = tx.Exec(`
			INSERT INTO flashcards (flashcard_deck_id, front, back, order_column, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
		`, deckID, card.Front, card.Back, i)
		if err != nil {
			tx.Rollback()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"message": "Failed to save flashcards into deck"})
			return
		}
	}

	tx.Commit()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"message": "Cards saved successfully"})
}

func (h *FlashcardHandler) History(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var sessions []models.FlashcardSession
	err := h.DB.SelectContext(r.Context(), &sessions,
		"SELECT * FROM flashcard_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100", user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to load study history"})
		return
	}

	if sessions == nil {
		sessions = []models.FlashcardSession{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

type StoreSessionRequest struct {
	FlashcardDeckID int64 `json:"flashcard_deck_id"`
	CardsCount      int   `json:"cards_count"`
}

func (h *FlashcardHandler) StoreSession(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var req StoreSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"message": "Invalid session request payload"})
		return
	}

	tx, err := h.DB.BeginTxx(r.Context(), nil)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Database transaction error"})
		return
	}
	defer tx.Rollback()

	var newID int64
	err = tx.QueryRowContext(r.Context(), `
		INSERT INTO flashcard_sessions (user_id, flashcard_deck_id, cards_count, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW(), NOW()) RETURNING id
	`, user.ID, req.FlashcardDeckID, req.CardsCount).Scan(&newID)
	if err != nil {
		log.Printf("[flashcard] StoreSession insert error for user %d: %v", user.ID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to record study session"})
		return
	}

	var streak struct {
		CurrentStreak   int          `db:"current_streak" json:"current_streak"`
		LongestStreak   int          `db:"longest_streak" json:"longest_streak"`
		UnclaimedReward int          `db:"unclaimed_reward" json:"unclaimed_reward"`
		LastStudyDate   sql.NullTime `db:"last_study_date" json:"-"`
	}
	err = tx.GetContext(r.Context(), &streak, `
		INSERT INTO study_streaks
			(user_id, current_streak, longest_streak, last_study_date, created_at, updated_at)
		VALUES ($1, 1, 1, CURRENT_DATE, NOW(), NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			current_streak = CASE
				WHEN study_streaks.last_study_date::date = CURRENT_DATE THEN study_streaks.current_streak
				WHEN study_streaks.last_study_date::date = CURRENT_DATE - 1 THEN study_streaks.current_streak + 1
				ELSE 1
			END,
			longest_streak = GREATEST(
				study_streaks.longest_streak,
				CASE
					WHEN study_streaks.last_study_date::date = CURRENT_DATE THEN study_streaks.current_streak
					WHEN study_streaks.last_study_date::date = CURRENT_DATE - 1 THEN study_streaks.current_streak + 1
					ELSE 1
				END
			),
			last_study_date = CASE
				WHEN study_streaks.last_study_date::date = CURRENT_DATE THEN study_streaks.last_study_date
				ELSE CURRENT_DATE
			END,
			updated_at = NOW()
		RETURNING current_streak, longest_streak, unclaimed_reward, last_study_date
	`, user.ID)
	if err != nil {
		log.Printf("[flashcard] StoreSession streak update error for user %d: %v", user.ID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to update study streak"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("[flashcard] StoreSession commit error for user %d: %v", user.ID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to record study session"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Study session recorded successfully",
		"id":      newID,
		"streak": map[string]interface{}{
			"current_streak":   streak.CurrentStreak,
			"longest_streak":   streak.LongestStreak,
			"unclaimed_reward": streak.UnclaimedReward,
			"last_study_date":  streak.LastStudyDate.Time,
		},
	})
}
