package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/credits"
	"skeeme-go/internal/middleware"
)

type InternalAIHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

type AIAuthorizeRequest struct {
	UserID     int64  `json:"user_id"`
	Amount     int    `json:"amount"`
	RequestID  string `json:"request_id"`
	ActionType string `json:"action_type"`
	ModelUsed  string `json:"model_used"`
}

func (h *InternalAIHandler) Authorize(w http.ResponseWriter, r *http.Request) {
	var req AIAuthorizeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Invalid authorization payload",
		})
		return
	}

	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	err := credits.Deduct(r.Context(), h.DB, h.Redis, user.ID, req.Amount, req.RequestID, req.ActionType, req.ModelUsed)
	if err != nil {
		if err == credits.ErrInsufficientCredits {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPaymentRequired) // 402
			json.NewEncoder(w).Encode(map[string]any{
				"success": false,
				"message": "You do not have enough credits for this generation.",
			})
			return
		}
		if err == credits.ErrDuplicateRequest {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]any{
				"success": true,
				"status":  "ok",
				"message": "Transaction already processed",
			})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Internal credit deduction error: " + err.Error(),
		})
		return
	}

	// Fetch remaining balance to return
	var remainingCredits int
	_ = h.DB.GetContext(r.Context(), &remainingCredits, "SELECT credits FROM users WHERE id = $1", user.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success":           true,
		"status":            "authorized",
		"user_id":           user.ID,
		"credits_remaining": remainingCredits,
		"message":           "Credits deducted successfully",
	})
}

type AIRefundRequest struct {
	UserID     int64  `json:"user_id"`
	Amount     int    `json:"amount"`
	RequestID  string `json:"request_id"` // E.g. "refund_{orig_req_id}"
	ActionType string `json:"action_type"`
}

func (h *InternalAIHandler) Refund(w http.ResponseWriter, r *http.Request) {
	var req AIRefundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Invalid refund request payload",
		})
		return
	}

	err := credits.Refund(r.Context(), h.DB, h.Redis, req.UserID, req.Amount, req.RequestID, req.ActionType)
	if err != nil {
		if err == credits.ErrDuplicateRequest {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]any{
				"success": true,
				"status":  "ok",
				"message": "Refund already processed",
			})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Internal credit refund error: " + err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"status":  "refunded",
		"message": "Credits refunded successfully",
	})
}
