package handlers

import (
	"encoding/json"
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
