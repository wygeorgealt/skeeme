package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type BillingHandler struct {
	DB *sqlx.DB
}

type Transaction struct {
	ID          int64     `db:"id" json:"id"`
	Type        string    `db:"type" json:"type"`
	Amount      int       `db:"amount" json:"amount"`
	Description string    `db:"description" json:"description"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}

func (h *BillingHandler) History(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"message": "Unauthorized access"})
		return
	}

	var transactions []Transaction
	query := `
		SELECT id, type, amount, description, created_at 
		FROM transactions 
		WHERE user_id = $1 
		ORDER BY created_at DESC 
		LIMIT 50
	`
	err := h.DB.SelectContext(r.Context(), &transactions, query, user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"message": "Failed to load billing history"})
		return
	}

	if transactions == nil {
		transactions = []Transaction{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}
