package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type SupportHandler struct {
	DB *sqlx.DB
}

func (h *SupportHandler) Contact(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	message := r.FormValue("message")
	if message == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	subject := "Support Request"
	if len(message) > 50 {
		subject = message[:47] + "..."
	} else if len(message) > 0 {
		subject = message
	}

	// Just log it for now
	_, err = h.DB.ExecContext(r.Context(), "INSERT INTO support_tickets (user_id, subject, message, status, created_at, updated_at) VALUES ($1, $2, $3, 'open', NOW(), NOW())", user.ID, subject, message)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Support ticket created successfully"})
}
