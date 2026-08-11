package handlers

import (
	"encoding/json"
	"net/http"
	"skeeme-go/internal/middleware"
)

type GradeHandler struct{}

type GradeRequest struct {
	Question      string `json:"question"`
	Answer        string `json:"answer"`
	CorrectAnswer string `json:"correct_answer"`
}

type GradeResponse struct {
	Score    int    `json:"score"`
	Feedback string `json:"feedback"`
}

func (h *GradeHandler) GradeTheory(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req GradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// TODO: Proxy this to the AI service or implement actual semantic grading via LLM API.
	// For now, we return a mock response to unblock the frontend.

	// Mock logic: if answer is long enough, give 80
	score := 50
	feedback := "This is a basic answer. Try to be more specific."
	
	if len(req.Answer) > 20 {
		score = 80
		feedback = "Good point! You captured the main idea."
	}
	if len(req.Answer) > 50 {
		score = 95
		feedback = "Excellent answer, very comprehensive!"
	}

	res := GradeResponse{
		Score:    score,
		Feedback: feedback,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
