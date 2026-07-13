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
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *StreakHandler) ClaimReward(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}
