package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

type PublicSupportHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

// Contact accepts anonymous contact messages from the public site.
// Rate limited per IP using Redis: max 5 messages per hour.
func (h *PublicSupportHandler) Contact(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Basic parsing
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")
	email := r.FormValue("email")
	message := r.FormValue("message")

	if message == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	// Rate limit by remote IP
	ip := r.RemoteAddr
	if ipHeader := r.Header.Get("X-Forwarded-For"); ipHeader != "" {
		ip = ipHeader
	}

	if h.Redis != nil {
		key := "public_contact:" + ip
		cnt, err := h.Redis.Incr(ctx, key).Result()
		if err == nil {
			if cnt == 1 {
				// set expiry 1 hour
				h.Redis.Expire(ctx, key, time.Hour)
			}
			if cnt > 5 {
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}
		}
	}

	subject := "Website contact"
	if name != "" {
		subject = "Website contact from " + name
	}

	fullMessage := message
	if email != "" {
		fullMessage = fmt.Sprintf("From: %s (%s)\n\n%s", name, email, message)
	} else if name != "" {
		fullMessage = fmt.Sprintf("From: %s\n\n%s", name, message)
	}

	// Store in support_tickets (user_id NULL if supported)
	_, err := h.DB.ExecContext(ctx, "INSERT INTO support_tickets (user_id, subject, message, status, created_at, updated_at) VALUES ($1, $2, $3, 'open', NOW(), NOW())", nil, subject, fullMessage)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Thanks — we received your message"})
}
