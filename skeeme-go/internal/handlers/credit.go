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
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var credits int
	err := h.DB.GetContext(r.Context(), &credits, "SELECT credits FROM users WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "Error fetching credits", http.StatusInternalServerError)
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
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// In a real app, call Paystack API here
	// For now, we mock the response
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
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req OutOfCreditsRequest
	json.NewDecoder(r.Body).Decode(&req)
	
	if req.Source == "" {
		req.Source = "unknown"
	}

	_, err := h.DB.ExecContext(r.Context(), "INSERT INTO out_of_credit_events (user_id, source, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())", user.ID, req.Source)
	if err != nil {
		http.Error(w, "Failed to log event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Event logged"}`))
}
