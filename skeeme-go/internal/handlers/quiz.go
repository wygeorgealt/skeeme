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
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	
	var sessions []models.QuizSession
	err := h.DB.SelectContext(r.Context(), &sessions, 
		"SELECT * FROM quiz_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100", user.ID)
	if err != nil {
		log.Printf("[quiz] History DB error for user %d: %v", user.ID, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to load quiz history"})
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
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	id := chi.URLParam(r, "id")

	var session models.QuizSession
	err := h.DB.GetContext(r.Context(), &session, "SELECT * FROM quiz_sessions WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"message": "Quiz session not found"})
		return
	}

	questions := []QuizQuestionOut{}
	if err := h.DB.SelectContext(r.Context(), &questions, `
		SELECT id, question_text AS question, question_type AS type, options::text AS options,
		       correct_answer, user_answer, is_correct, explanation
		FROM quiz_questions WHERE quiz_session_id = $1 ORDER BY id ASC
	`, session.ID); err != nil {
		log.Printf("[quiz] questions load error for session %d: %v", session.ID, err)
		questions = []QuizQuestionOut{}
	}

	var timeSpent any
	if session.TimeSpentSeconds.Valid {
		timeSpent = session.TimeSpentSeconds.Int64
	}
	var createdAt any
	if session.CreatedAt.Valid {
		createdAt = session.CreatedAt.Time
	}
	detail := map[string]any{
		"id":                 session.ID,
		"topic":              session.Topic,
		"difficulty":         session.Difficulty,
		"total_questions":    session.TotalQuestions,
		"correct_answers":    session.CorrectAnswers,
		"score_percentage":   session.ScorePercentage,
		"time_spent_seconds": timeSpent,
		"created_at":         createdAt,
		"questions":          questions,
	}
	resp := map[string]any{"data": detail}
	for k, v := range detail {
		resp[k] = v
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// QuizQuestionOut is the per-question shape returned to the client.
type QuizQuestionOut struct {
	ID            int64   `db:"id" json:"id"`
	Question      string  `db:"question" json:"question"`
	Type          string  `db:"type" json:"type"`
	Options       *string `db:"options" json:"options"`
	CorrectAnswer string  `db:"correct_answer" json:"correct_answer"`
	UserAnswer    *string `db:"user_answer" json:"user_answer"`
	IsCorrect     bool    `db:"is_correct" json:"is_correct"`
	Explanation   *string `db:"explanation" json:"explanation"`
}

func (h *QuizHandler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	id := chi.URLParam(r, "id")

	result, err := h.DB.ExecContext(r.Context(), "DELETE FROM quiz_sessions WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to delete quiz session"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"message": "Quiz session not found or already deleted"})
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
	TimeSpentSeconds *int64  `json:"time_spent_seconds"`
	Questions        []struct {
		Question      string          `json:"question"`
		Type          string          `json:"type"`
		Options       json.RawMessage `json:"options"`
		CorrectAnswer string          `json:"correct_answer"`
		UserAnswer    *string         `json:"user_answer"`
		IsCorrect     bool            `json:"is_correct"`
		Explanation   *string         `json:"explanation"`
	} `json:"questions"`
}

func (h *QuizHandler) StoreSession(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}
	
	var req QuizSessionStoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"message": "Invalid quiz session data payload"})
		return
	}

	// Guard column limits / defaults
	topic := []rune(req.Topic)
	if len(topic) > 250 {
		topic = topic[:250]
	}
	if len(topic) == 0 {
		topic = []rune("Quiz")
	}
	if req.Difficulty == "" {
		req.Difficulty = "medium"
	}

	fail := func(msg string, err error) {
		log.Printf("[quiz] StoreSession user %d: %s: %v", user.ID, msg, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to save quiz session to database"})
	}

	tx, err := h.DB.BeginTxx(r.Context(), nil)
	if err != nil {
		fail("begin tx", err)
		return
	}
	defer tx.Rollback()

	var newID int64
	err = tx.QueryRowContext(r.Context(), `
		INSERT INTO quiz_sessions 
		(user_id, topic, difficulty, total_questions, correct_answers, score_percentage, time_spent_seconds, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id
	`, user.ID, string(topic), req.Difficulty, req.TotalQuestions, req.CorrectAnswers, req.ScorePercentage, req.TimeSpentSeconds).Scan(&newID)
	if err != nil {
		fail("insert session", err)
		return
	}

	for _, q := range req.Questions {
		var opts any // nil → SQL NULL
		if trimmed := string(q.Options); trimmed != "" && trimmed != "null" && json.Valid(q.Options) {
			opts = trimmed // pass as string so pq doesn't send bytea
		}
		qType := q.Type
		if qType == "" {
			qType = "mcq"
		}
		if _, err := tx.ExecContext(r.Context(), `
			INSERT INTO quiz_questions
			(quiz_session_id, question_text, question_type, options, correct_answer, user_answer, is_correct, explanation, created_at, updated_at)
			VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, NOW(), NOW())
		`, newID, q.Question, qType, opts, q.CorrectAnswer, q.UserAnswer, q.IsCorrect, q.Explanation); err != nil {
			fail("insert question", err)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		fail("commit", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Quiz session saved successfully",
		"id":      newID,
		"data":    map[string]any{"id": newID},
	})
}
