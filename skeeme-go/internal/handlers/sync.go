package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
	"skeeme-go/internal/models"
)

type SyncHandler struct {
	DB *sqlx.DB
}

type SyncResponse struct {
	User           *models.User           `json:"user"`
	StudyStreak    *models.StudyStreak    `json:"study_streak"`
	QuizSessions   []models.QuizSession   `json:"quiz_sessions"`
	FlashcardDecks []models.FlashcardDeck `json:"flashcard_decks"`
}

func (h *SyncHandler) Sync(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	res := SyncResponse{
		User:           user,
		QuizSessions:   []models.QuizSession{},
		FlashcardDecks: []models.FlashcardDeck{},
	}

	// 1. Get Study Streak
	var streak models.StudyStreak
	err := h.DB.GetContext(r.Context(), &streak, "SELECT * FROM study_streaks WHERE user_id = $1 LIMIT 1", user.ID)
	if err == nil {
		res.StudyStreak = &streak
	}

	// 2. Get Quiz Sessions (e.g. recent 50)
	err = h.DB.SelectContext(r.Context(), &res.QuizSessions, 
		"SELECT * FROM quiz_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", user.ID)
	if err != nil {
		http.Error(w, "Error fetching quizzes", http.StatusInternalServerError)
		return
	}

	// 3. Get Flashcard Decks
	err = h.DB.SelectContext(r.Context(), &res.FlashcardDecks, 
		"SELECT * FROM flashcard_decks WHERE user_id = $1 ORDER BY created_at DESC", user.ID)
	if err != nil {
		http.Error(w, "Error fetching decks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
