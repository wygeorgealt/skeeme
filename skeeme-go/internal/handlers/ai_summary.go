package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"skeeme-go/internal/ai"
	"skeeme-go/internal/credits"
	"skeeme-go/internal/middleware"
)

// stripJSONFences removes optional ```json fences some models wrap around output.
func stripJSONFences(s string) string {
	s = strings.TrimSpace(s)
	s = strings.TrimPrefix(s, "```json")
	s = strings.TrimPrefix(s, "```")
	s = strings.TrimSuffix(s, "```")
	return strings.TrimSpace(s)
}

// GenerateSummary handles POST /api/summaries/generate.
// Streams a topic-specific study summary (notes + mind map) as JSON over SSE.
func (h *AIHandler) GenerateSummary(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, `{"error":"Authentication required. Please log in to generate summaries."}`, http.StatusUnauthorized)
		return
	}

	if !h.checkRateLimit(r.Context(), user.ID) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Too many requests. Please wait a moment before generating another summary.",
		})
		return
	}

	var req ai.SummaryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	content := ""
	if extracted := h.getExtractedText(r.Context(), user.ID, req.ExtractionID); extracted != "" {
		// Cap prompt size; the extractor stores up to 50k chars.
		if len(extracted) > 12000 {
			extracted = extracted[:12000]
		}
		content = extracted
	}
	if strings.TrimSpace(req.Topic) == "" && content == "" {
		http.Error(w, `{"error":"Please provide a topic or upload notes to summarise."}`, http.StatusBadRequest)
		return
	}

	idempotencyKey := h.getIdempotencyKey(r)
	cost := credits.SummaryCost
	actionType := "summary_generation"
	modelUsed := h.resolveModelUsed(r.Context(), req.Provider)

	err := credits.Deduct(r.Context(), h.DB, h.Redis, user.ID, cost, idempotencyKey, actionType, modelUsed)
	if err != nil {
		if err == credits.ErrInsufficientCredits {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPaymentRequired) // 402
			json.NewEncoder(w).Encode(map[string]string{
				"error": "You do not have enough credits to generate this summary.",
			})
			return
		}
		if err != credits.ErrDuplicateRequest {
			http.Error(w, `{"error":"Credit authorization failed: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
	}

	rc, stopHeartbeat, err := h.setupSSE(w)
	if err != nil {
		http.Error(w, `{"error":"Streaming unsupported"}`, http.StatusInternalServerError)
		return
	}
	defer stopHeartbeat()

	refund := func() {
		refundCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = credits.Refund(refundCtx, h.DB, h.Redis, user.ID, cost, "refund_"+idempotencyKey, actionType)
	}

	var accumulatedText strings.Builder
	var streamMutex sync.Mutex

	streamErr := h.AIService.StreamSummary(r.Context(), req, content, func(token string) error {
		streamMutex.Lock()
		defer streamMutex.Unlock()

		accumulatedText.WriteString(token)
		chunkJSON, _ := json.Marshal(map[string]string{"text": token})
		if _, writeErr := fmt.Fprintf(w, "data: %s\n\n", string(chunkJSON)); writeErr != nil {
			return writeErr
		}
		return rc.Flush()
	})

	if streamErr != nil {
		log.Printf("[aiHandler] Summary stream error for user %d: %v", user.ID, streamErr)
		refund()
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"stream_interrupted\"}\n\n")
		_ = rc.Flush()
		return
	}

	finalOutput := stripJSONFences(accumulatedText.String())
	var parsed struct {
		Error     string   `json:"error"`
		Title     string   `json:"title"`
		KeyPoints []string `json:"keyPoints"`
	}
	if !json.Valid([]byte(finalOutput)) || json.Unmarshal([]byte(finalOutput), &parsed) != nil {
		log.Printf("[aiHandler] Summary produced invalid JSON for user %d. Refunding.", user.ID)
		refund()
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"incomplete_response\"}\n\n")
		_ = rc.Flush()
		return
	}
	if parsed.Error == "non_educational" {
		refund()
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"non_educational\"}\n\n")
		_ = rc.Flush()
		return
	}
	if parsed.Title == "" || len(parsed.KeyPoints) == 0 {
		log.Printf("[aiHandler] Summary missing required fields for user %d. Refunding.", user.ID)
		refund()
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"incomplete_response\"}\n\n")
		_ = rc.Flush()
		return
	}

	fmt.Fprintf(w, "data: [DONE]\n\n")
	_ = rc.Flush()
}
