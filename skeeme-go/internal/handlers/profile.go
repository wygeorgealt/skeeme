package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
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

	body, err := io.ReadAll(r.Body)
	if err != nil || len(bytes.TrimSpace(body)) == 0 {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Accept both { "ai_preferences": {...} } and a flat preferences object.
	var req UpdatePreferencesRequest
	_ = json.Unmarshal(body, &req)
	prefs := bytes.TrimSpace(req.AIPreferences)
	if len(prefs) == 0 || string(prefs) == "null" {
		prefs = bytes.TrimSpace(body)
	}

	// Merge onto existing preferences so partial updates don't wipe other keys.
	incoming := map[string]any{}
	if err := json.Unmarshal(prefs, &incoming); err != nil {
		http.Error(w, "Invalid preferences payload", http.StatusBadRequest)
		return
	}
	merged := map[string]any{}
	if len(user.AIPreferences) > 0 {
		_ = json.Unmarshal(user.AIPreferences, &merged)
	}
	for k, v := range incoming {
		merged[k] = v
	}
	mergedJSON, err := json.Marshal(merged)
	if err != nil {
		http.Error(w, "Invalid preferences payload", http.StatusBadRequest)
		return
	}
	req.AIPreferences = mergedJSON

	// Update ai_preferences in DB (pass as string so pq doesn't send bytea)
	_, err = h.DB.ExecContext(r.Context(), "UPDATE users SET ai_preferences = $1::jsonb WHERE id = $2", string(mergedJSON), user.ID)
	if err != nil {
		log.Printf("Failed to update preferences for user %d: %v", user.ID, err)
		http.Error(w, "Failed to update preferences", http.StatusInternalServerError)
		return
	}

	// Refresh user from DB to return
	err = h.DB.GetContext(r.Context(), user, "SELECT * FROM users WHERE id = $1", user.ID)
	if err != nil {
		log.Printf("Error fetching updated profile for user %d: %v", user.ID, err)
		http.Error(w, "Error fetching updated profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "success",
		"ai_preferences": req.AIPreferences,
	})
}

func (h *ProfileHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Soft delete or hard delete. Let's hard delete for simplicity, or delete tokens
	// Here we will just delete the user record (cascading deletes will handle the rest if set up, or we should manually delete depending on schema)
	_, err := h.DB.ExecContext(r.Context(), "DELETE FROM users WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "Failed to delete account", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Account deleted successfully"}`))
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (h *ProfileHandler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Verify current password
	var currentHash string
	err := h.DB.GetContext(r.Context(), &currentHash, "SELECT password FROM users WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.CurrentPassword)); err != nil {
		http.Error(w, "Incorrect current password", http.StatusUnauthorized)
		return
	}

	newHash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)

	_, err = h.DB.ExecContext(r.Context(), "UPDATE users SET password = $1 WHERE id = $2", newHash, user.ID)
	if err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Password updated successfully"}`))
}

