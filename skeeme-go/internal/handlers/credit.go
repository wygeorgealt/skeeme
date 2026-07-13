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

func (h *CreditHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}

func (h *CreditHandler) OutOfCredits(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}
