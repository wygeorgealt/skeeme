package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type UserExamHandler struct {
	DB *sqlx.DB
}

type UserExam struct {
	ID        int64     `db:"id" json:"id"`
	UserID    int64     `db:"user_id" json:"user_id"`
	Title     string    `db:"title" json:"title"`
	ExamDate  time.Time `db:"exam_date" json:"exam_date"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type CreateExamRequest struct {
	Title    string `json:"title"`
	ExamDate string `json:"exam_date"`
}

func (h *UserExamHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var exams []UserExam
	err := h.DB.SelectContext(r.Context(), &exams, "SELECT * FROM user_exams WHERE user_id = $1 ORDER BY exam_date ASC", user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if exams == nil {
		exams = []UserExam{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exams) // Frontend expects res.data, wait, api.ts extracts data if it exists, otherwise root. Let's return the slice.
}

func (h *UserExamHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateExamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	examDate, err := time.Parse(time.RFC3339, req.ExamDate)
	if err != nil {
		// Try another format if RFC3339 fails
		examDate, err = time.Parse("2006-01-02T15:04:05Z", req.ExamDate)
		if err != nil {
			http.Error(w, "Invalid date format", http.StatusBadRequest)
			return
		}
	}

	var exam UserExam
	query := `
		INSERT INTO user_exams (user_id, title, exam_date, created_at, updated_at) 
		VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *
	`
	err = h.DB.QueryRowxContext(r.Context(), query, user.ID, req.Title, examDate).StructScan(&exam)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(exam)
}

func (h *UserExamHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Missing exam ID", http.StatusBadRequest)
		return
	}

	_, err := h.DB.ExecContext(r.Context(), "DELETE FROM user_exams WHERE id = $1 AND user_id = $2", id, user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Exam deleted"}`))
}
