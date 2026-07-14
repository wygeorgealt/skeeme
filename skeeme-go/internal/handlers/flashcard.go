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
	
	var decks []models.FlashcardDeck
	err := h.DB.SelectContext(r.Context(), &decks, 
		"SELECT * FROM flashcard_decks WHERE user_id = $1 ORDER BY created_at DESC", user.ID)
	if err != nil {
		log.Printf("[flashcard] ListDecks DB error for user %d: %v", user.ID, err)
		http.Error(w, "Database error", http.StatusInternalServerError)
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
	id := chi.URLParam(r, "id")

	var deck models.FlashcardDeck
	err := h.DB.GetContext(r.Context(), &deck, "SELECT * FROM flashcard_decks WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	// Also fetch cards
	var cards []models.Flashcard
	err = h.DB.SelectContext(r.Context(), &cards, "SELECT * FROM flashcards WHERE flashcard_deck_id = $1 ORDER BY order_column ASC", deck.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
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
	id := chi.URLParam(r, "id")

	_, err := h.DB.ExecContext(r.Context(), "DELETE FROM flashcard_decks WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
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
		http.Error(w, "Failed to create deck", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Deck created",
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
	deckID := chi.URLParam(r, "id")

	var req SaveCardsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Verify deck ownership
	var count int
	h.DB.Get(&count, "SELECT count(*) FROM flashcard_decks WHERE id = $1 AND user_id = $2", deckID, user.ID)
	if count == 0 {
		http.Error(w, "Unauthorized or deck not found", http.StatusForbidden)
		return
	}

	tx, err := h.DB.Beginx()
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
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
			http.Error(w, "Failed to save cards", http.StatusInternalServerError)
			return
		}
	}

	tx.Commit()
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Cards saved"}`))
}

func (h *FlashcardHandler) History(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	
	var sessions []models.FlashcardSession
	err := h.DB.SelectContext(r.Context(), &sessions, 
		"SELECT * FROM flashcard_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100", user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
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
	
	var req StoreSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var newID int64
	err := h.DB.QueryRowContext(r.Context(), `
		INSERT INTO flashcard_sessions (user_id, flashcard_deck_id, cards_count, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW(), NOW()) RETURNING id
	`, user.ID, req.FlashcardDeckID, req.CardsCount).Scan(&newID)

	if err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Session saved",
		"id":      newID,
	})
}
