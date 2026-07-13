package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type ProfileHandler struct {
	DB *sqlx.DB
}

type UpdateProfileRequest struct {
	Name        string `json:"name"`
	PhoneNumber string `json:"phone_number"`
}

func (h *ProfileHandler) Update(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update user in DB
	_, err := h.DB.ExecContext(r.Context(), "UPDATE users SET name = $1, phone_number = $2 WHERE id = $3", req.Name, req.PhoneNumber, user.ID)
	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	// Refresh user from DB to return
	err = h.DB.GetContext(r.Context(), user, "SELECT * FROM users WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "Error fetching updated profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

type UpdatePreferencesRequest struct {
	AIPreferences json.RawMessage `json:"ai_preferences"`
}

func (h *ProfileHandler) Preferences(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdatePreferencesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update ai_preferences in DB
	_, err := h.DB.ExecContext(r.Context(), "UPDATE users SET ai_preferences = $1 WHERE id = $2", req.AIPreferences, user.ID)
	if err != nil {
		http.Error(w, "Failed to update preferences", http.StatusInternalServerError)
		return
	}

	// Refresh user from DB to return
	err = h.DB.GetContext(r.Context(), user, "SELECT * FROM users WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "Error fetching updated profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "success",
		"ai_preferences": req.AIPreferences,
	})
}
