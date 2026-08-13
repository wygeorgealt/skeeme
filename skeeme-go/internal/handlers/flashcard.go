package handlers

import (
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

func (h *FlashcardHandler) ListDecks(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	
	var decks []models.FlashcardDeck
	err := h.DB.SelectContext(r.Context(), &decks, 
		"SELECT * FROM flashcard_decks WHERE user_id = $1 ORDER BY created_at DESC", user.ID)
	if err != nil {
		log.Printf("[flashcard] ListDecks DB error for user %d: %v", user.ID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to fetch flashcard decks from database"})
		return
	}
	
	if decks == nil {
		decks = []models.FlashcardDeck{}
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

	response := map[string]interface{}{
		"deck":  deck,
		"cards": cards,
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

	var newID int64
	err := h.DB.QueryRowContext(r.Context(), `
		INSERT INTO flashcard_sessions (user_id, flashcard_deck_id, cards_count, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW(), NOW()) RETURNING id
	`, user.ID, req.FlashcardDeckID, req.CardsCount).Scan(&newID)

	if err != nil {
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
	})
}
