package handlers

import (
	"encoding/json"
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
