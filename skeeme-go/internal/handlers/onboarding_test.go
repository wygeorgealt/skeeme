package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/middleware"
	"skeeme-go/internal/models"
)

func TestCompleteOnboardingStoresSelectedAnswersInProfile(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	user := &models.User{ID: 42}
	answers := OnboardingAnswers{
		LearningGoals:         []string{"understand_difficult_topics", "clear_study_notes"},
		ExplanationPreference: "step_by_step",
		StudyChallenges:       []string{"staying_focused"},
		DailyGoal:             "15",
		ReminderChoice:        "morning",
		ReminderEnabled:       true,
		ReminderTime:          "08:00",
	}
	body, err := json.Marshal(OnboardingRequest{
		LearningStyle:  answers.ExplanationPreference,
		OnboardingData: &answers,
	})
	if err != nil {
		t.Fatal(err)
	}

	mock.ExpectExec("UPDATE users SET ai_preferences").
		WithArgs(sqlmock.AnyArg(), user.ID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("INSERT INTO user_ai_profiles").
		WithArgs(user.ID, "", answers.ExplanationPreference).
		WillReturnResult(sqlmock.NewResult(0, 1))

	req := httptest.NewRequest(http.MethodPost, "/me/onboarding", bytes.NewReader(body))
	req = req.WithContext(middleware.SetUser(req.Context(), user))
	rec := httptest.NewRecorder()

	(&OnboardingHandler{DB: sqlxDB}).CompleteOnboarding(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d: %s", http.StatusOK, rec.Code, rec.Body.String())
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}
