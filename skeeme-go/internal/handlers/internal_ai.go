package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/middleware"
	dailyusage "skeeme-go/internal/usage"
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

	feature, err := dailyusage.FeatureForAction(req.ActionType)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	reservation, err := dailyusage.Reserve(r.Context(), h.DB, user.ID, req.RequestID, feature, user.SubscriptionTier, time.Now())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if err == dailyusage.ErrDailyLimitReached {
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]any{
				"success":  false,
				"error":    "daily_limit_reached",
				"code":     "daily_limit_reached",
				"feature":  string(feature),
				"limit":    reservation.Limit,
				"used":     reservation.Limit,
				"reset_at": dailyusage.NextResetUTC(time.Now()).Format(time.RFC3339),
			})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Daily usage authorization failed: " + err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	maxItems := 30
	if dailyusage.IsFreeTier(user.SubscriptionTier) &&
		(feature == dailyusage.Quiz || feature == dailyusage.Flashcards) {
		maxItems = 10
	}
	json.NewEncoder(w).Encode(map[string]any{
		"success":   true,
		"status":    "authorized",
		"user_id":   user.ID,
		"feature":   string(feature),
		"limit":     reservation.Limit,
		"used":      reservation.Used,
		"max_items": maxItems,
		"message":   "Daily usage authorized",
	})
}

type AICompleteRequest struct {
	RequestID string `json:"request_id"`
}

func (h *InternalAIHandler) Complete(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req AICompleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.RequestID == "" {
		http.Error(w, "Invalid completion request", http.StatusBadRequest)
		return
	}

	var reservation dailyusage.Reservation
	reservation.UserID = user.ID
	reservation.RequestID = req.RequestID
	if err := dailyusage.Complete(r.Context(), h.DB, reservation); err != nil {
		http.Error(w, "Failed to complete usage reservation", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
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

	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if req.UserID != 0 && req.UserID != user.ID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	err := dailyusage.Release(r.Context(), h.DB, dailyusage.Reservation{UserID: user.ID, RequestID: req.RequestID})
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Daily usage release failed: " + err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"status":  "released",
		"message": "Daily usage reservation released",
	})
}
