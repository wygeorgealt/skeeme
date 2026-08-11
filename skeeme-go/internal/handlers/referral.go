package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type ReferralHandler struct {
	DB *sqlx.DB
}

type ReferralStats struct {
	TotalReferrals int `json:"total_referrals"`
	TotalEarned    int `json:"total_earned"`
	PendingRewards int `json:"pending_rewards"`
}

func (h *ReferralHandler) MyCode(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var code string
	err := h.DB.GetContext(r.Context(), &code, "SELECT referral_code FROM users WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	res := map[string]string{"code": code}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *ReferralHandler) Stats(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	stats := ReferralStats{}
	
	// Example query - schema might differ based on how referrals are tracked
	// We'll mock it for now
	stats.TotalReferrals = 5
	stats.TotalEarned = 500
	stats.PendingRewards = 100

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func (h *ReferralHandler) ClaimRewards(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Mock logic
	reward := 100
	_, err := h.DB.ExecContext(r.Context(), "UPDATE users SET credits = credits + $1 WHERE id = $2", reward, user.ID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Rewards claimed successfully",
		"amount":  reward,
	})
}

func (h *ReferralHandler) PendingRewards(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Mock logic
	hasPending := true

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"has_pending": hasPending})
}

type RedeemRequest struct {
	Code string `json:"code"`
}

func (h *ReferralHandler) Redeem(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req RedeemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Referral code redeemed successfully"})
}
