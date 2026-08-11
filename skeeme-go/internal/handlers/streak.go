package handlers

import (
	"encoding/json"
	"fmt"
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

func (h *StreakHandler) ClaimReward(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tx, err := h.DB.BeginTxx(r.Context(), nil)
	if err != nil {
		http.Error(w, "Transaction error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	var reward int
	err = tx.GetContext(r.Context(), &reward, "SELECT unclaimed_reward FROM study_streaks WHERE user_id = $1 FOR UPDATE", user.ID)
	if err != nil || reward <= 0 {
		http.Error(w, "No rewards to claim", http.StatusBadRequest)
		return
	}

	// Update user credits
	_, err = tx.ExecContext(r.Context(), "UPDATE users SET credits = credits + $1 WHERE id = $2", reward, user.ID)
	if err != nil {
		http.Error(w, "Failed to update credits", http.StatusInternalServerError)
		return
	}

	// Clear unclaimed reward
	_, err = tx.ExecContext(r.Context(), "UPDATE study_streaks SET unclaimed_reward = 0 WHERE user_id = $1", user.ID)
	if err != nil {
		http.Error(w, "Failed to clear reward", http.StatusInternalServerError)
		return
	}

	// Log transaction
	_, err = tx.ExecContext(r.Context(), `
		INSERT INTO transactions (user_id, type, amount, description, metadata, created_at, updated_at) 
		VALUES ($1, 'reward', $2, 'Streak reward claimed', '{"source":"streak"}', NOW(), NOW())
	`, user.ID, reward)
	if err != nil {
		http.Error(w, "Failed to log transaction", http.StatusInternalServerError)
		return
	}

	tx.Commit()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"message": "Reward claimed successfully", "reward": %d}`, reward)))
}
