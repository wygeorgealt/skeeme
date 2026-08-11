package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
)

type OnboardingHandler struct {
	DB *sqlx.DB
}

type OnboardingRequest struct {
	EducationLevel string `json:"education_level"`
	FieldOfStudy   string `json:"field_of_study"`
	LearningStyle  string `json:"learning_style"`
}

func (h *OnboardingHandler) CompleteOnboarding(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req OnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Update ai_preferences
	aiPrefs := map[string]string{
		"education_level": req.EducationLevel,
		"field_of_study":  req.FieldOfStudy,
		"learning_style":  req.LearningStyle,
		"tone":            "encouraging",
		"language":        "english",
	}
	aiPrefsJSON, _ := json.Marshal(aiPrefs)

	_, err := h.DB.ExecContext(r.Context(), "UPDATE users SET ai_preferences = $1 WHERE id = $2", aiPrefsJSON, user.ID)
	if err != nil {
		http.Error(w, "Failed to update preferences", http.StatusInternalServerError)
		return
	}

	// Upsert into user_ai_profiles
	upsertQuery := `
		INSERT INTO user_ai_profiles (user_id, academic_level, learning_style, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (user_id) DO UPDATE SET 
			academic_level = EXCLUDED.academic_level,
			learning_style = EXCLUDED.learning_style,
			updated_at = NOW()
	`
	_, err = h.DB.ExecContext(r.Context(), upsertQuery, user.ID, req.EducationLevel, req.LearningStyle)
	if err != nil {
		http.Error(w, "Failed to update AI profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Onboarding completed successfully"}`))
}
