package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type StreakHandler struct {
	DB *sqlx.DB
}

func (h *StreakHandler) Heatmap(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())

	// Example: returns count of quiz sessions per day
	type HeatmapResult struct {
		Date  string `db:"date" json:"date"`
		Count int    `db:"count" json:"count"`
	}

	var results []HeatmapResult
	query := `
		SELECT DATE(created_at) as date, COUNT(*) as count 
		FROM quiz_sessions 
		WHERE user_id = $1 
		GROUP BY DATE(created_at) 
		ORDER BY date DESC LIMIT 365`

	err := h.DB.SelectContext(r.Context(), &results, query, user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if results == nil {
		results = []HeatmapResult{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *StreakHandler) Freezes(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	type Freeze struct {
		ID        int64  `db:"id" json:"id"`
		Date      string `db:"freeze_date" json:"freeze_date"`
		CreatedAt string `db:"created_at" json:"created_at"`
	}

	var freezes []Freeze
	err := h.DB.SelectContext(r.Context(), &freezes, "SELECT id, freeze_date, created_at FROM streak_freezes WHERE user_id = $1 AND EXTRACT(MONTH FROM freeze_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM freeze_date) = EXTRACT(YEAR FROM CURRENT_DATE)", user.ID)

	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if freezes == nil {
		freezes = []Freeze{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(freezes)
}
