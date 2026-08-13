package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type CreditHandler struct {
	DB *sqlx.DB
}

type CreditSummary struct {
	Credits int `json:"credits"`
}

func (h *CreditHandler) Summary(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var credits int
	err := h.DB.GetContext(r.Context(), &credits, "SELECT credits FROM users WHERE id = $1", user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to fetch user credits from database"})
		return
	}

	res := CreditSummary{Credits: credits}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

type CheckoutRequest struct {
	Amount int `json:"amount"` // e.g., 500 for $5.00 or NGN 500
}

func (h *CreditHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"message": "Invalid payment checkout request payload"})
		return
	}

	// In a real app, call Paystack API here
	authUrl := "https://checkout.paystack.com/mock_transaction"
	reference := "mock_ref_" + string(rune(user.ID)) + "12345"

	res := map[string]string{
		"authorization_url": authUrl,
		"reference":         reference,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

type OutOfCreditsRequest struct {
	Source string `json:"source"`
}

func (h *CreditHandler) OutOfCredits(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var req OutOfCreditsRequest
	json.NewDecoder(r.Body).Decode(&req)
	
	if req.Source == "" {
		req.Source = "unknown"
	}

	_, err := h.DB.ExecContext(r.Context(), "INSERT INTO out_of_credit_events (user_id, source, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())", user.ID, req.Source)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to record out of credits event"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"message": "Event recorded successfully"})
}
