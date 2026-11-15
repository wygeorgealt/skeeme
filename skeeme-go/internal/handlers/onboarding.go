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
	EducationLevel string             `json:"education_level"`
	FieldOfStudy   string             `json:"field_of_study"`
	LearningStyle  string             `json:"learning_style"`
	OnboardingData *OnboardingAnswers `json:"onboarding_data"`
}

type OnboardingAnswers struct {
	LearningGoals         []string `json:"learning_goals"`
	ExplanationPreference string   `json:"explanation_preference"`
	StudyChallenges       []string `json:"study_challenges"`
	DailyGoal             string   `json:"daily_goal"`
	ReminderChoice        string   `json:"reminder_choice"`
	ReminderEnabled       bool     `json:"reminder_enabled"`
	ReminderTime          string   `json:"reminder_time"`
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

	aiPrefs := map[string]any{}
	if req.EducationLevel != "" {
		aiPrefs["education_level"] = req.EducationLevel
	}
	if req.FieldOfStudy != "" {
		aiPrefs["field_of_study"] = req.FieldOfStudy
	}
	learningStyle := req.LearningStyle
	if req.OnboardingData != nil {
		aiPrefs["onboarding_answers"] = req.OnboardingData
		if req.OnboardingData.ExplanationPreference != "" {
			learningStyle = req.OnboardingData.ExplanationPreference
		}
	}
	if learningStyle != "" {
		aiPrefs["learning_style"] = learningStyle
	}

	if len(aiPrefs) > 0 {
		aiPrefsJSON, err := json.Marshal(aiPrefs)
		if err != nil {
			http.Error(w, "Failed to encode preferences", http.StatusInternalServerError)
			return
		}

		_, err = h.DB.ExecContext(
			r.Context(),
			"UPDATE users SET ai_preferences = COALESCE(ai_preferences, '{}'::jsonb) || $1::jsonb WHERE id = $2",
			string(aiPrefsJSON),
			user.ID,
		)
		if err != nil {
			http.Error(w, "Failed to update preferences", http.StatusInternalServerError)
			return
		}
	}

	// Upsert into user_ai_profiles
	upsertQuery := `
		INSERT INTO user_ai_profiles (user_id, academic_level, learning_style, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (user_id) DO UPDATE SET 
			academic_level = COALESCE(NULLIF(EXCLUDED.academic_level, ''), user_ai_profiles.academic_level),
			learning_style = COALESCE(NULLIF(EXCLUDED.learning_style, ''), user_ai_profiles.learning_style),
			updated_at = NOW()
	`
	_, err := h.DB.ExecContext(r.Context(), upsertQuery, user.ID, req.EducationLevel, learningStyle)
	if err != nil {
		http.Error(w, "Failed to update AI profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Onboarding completed successfully"}`))
}
