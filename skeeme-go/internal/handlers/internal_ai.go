package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/credits"
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
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	err := credits.Deduct(r.Context(), h.DB, h.Redis, req.UserID, req.Amount, req.RequestID, req.ActionType, req.ModelUsed)
	if err != nil {
		if err == credits.ErrInsufficientCredits {
			http.Error(w, "Insufficient credits", http.StatusPaymentRequired) // 402
			return
		}
		if err == credits.ErrDuplicateRequest {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"ok", "message":"already processed"}`))
			return
		}
		http.Error(w, "Internal error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"authorized"}`))
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
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	err := credits.Refund(r.Context(), h.DB, h.Redis, req.UserID, req.Amount, req.RequestID, req.ActionType)
	if err != nil {
		if err == credits.ErrDuplicateRequest {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"ok", "message":"already processed"}`))
			return
		}
		http.Error(w, "Internal error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"refunded"}`))
}
