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

type QuizHandler struct {
	DB *sqlx.DB
}

func (h *QuizHandler) History(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	
	var sessions []models.QuizSession
	err := h.DB.SelectContext(r.Context(), &sessions, 
		"SELECT * FROM quiz_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100", user.ID)
	if err != nil {
		log.Printf("[quiz] History DB error for user %d: %v", user.ID, err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if sessions == nil {
		sessions = []models.QuizSession{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

func (h *QuizHandler) GetSession(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	id := chi.URLParam(r, "id")

	var session models.QuizSession
	err := h.DB.GetContext(r.Context(), &session, "SELECT * FROM quiz_sessions WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}

func (h *QuizHandler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	id := chi.URLParam(r, "id")

	_, err := h.DB.ExecContext(r.Context(), "DELETE FROM quiz_sessions WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type QuizSessionStoreRequest struct {
	Topic            string  `json:"topic"`
	Difficulty       string  `json:"difficulty"`
	TotalQuestions   int     `json:"total_questions"`
	CorrectAnswers   int     `json:"correct_answers"`
	ScorePercentage  float64 `json:"score_percentage"`
	TimeSpentSeconds int64   `json:"time_spent_seconds"`
}

func (h *QuizHandler) StoreSession(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	
	var req QuizSessionStoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var newID int64
	err := h.DB.QueryRowContext(r.Context(), `
		INSERT INTO quiz_sessions 
		(user_id, topic, difficulty, total_questions, correct_answers, score_percentage, time_spent_seconds, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id
	`, user.ID, req.Topic, req.Difficulty, req.TotalQuestions, req.CorrectAnswers, req.ScorePercentage, req.TimeSpentSeconds).Scan(&newID)

	if err != nil {
		http.Error(w, "Failed to save quiz session", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Quiz session saved",
		"id":      newID,
	})
}
