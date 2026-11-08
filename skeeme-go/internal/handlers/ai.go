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

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/ai"
	"skeeme-go/internal/middleware"
	dailyusage "skeeme-go/internal/usage"
)

type AIHandler struct {
	DB        *sqlx.DB
	Redis     *redis.Client
	AIService *ai.Service
}

func NewAIHandler(db *sqlx.DB, redisClient *redis.Client) *AIHandler {
	return &AIHandler{
		DB:        db,
		Redis:     redisClient,
		AIService: ai.NewService(redisClient),
	}
}

func (h *AIHandler) getExtractedText(ctx context.Context, userID int64, extractionID string) string {
	if extractionID == "" || h.Redis == nil {
		return ""
	}
	// Exact Redis key format maintained across PHP/Node/Go: extraction:<userId>:<id>
	redisKey := fmt.Sprintf("extraction:%d:%s", userID, extractionID)
	val, err := h.Redis.Get(ctx, redisKey).Result()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(val)
}

// setupSSE configures SSE response headers, disables response write deadlines,
// and starts a background heartbeat ticker (every 15s) to keep Cloudflare/proxies alive.
func (h *AIHandler) setupSSE(w http.ResponseWriter) (rc *http.ResponseController, stopHeartbeat func(), err error) {
	rc = http.NewResponseController(w)
	// Disable write deadline so long SSE streams aren't cut mid-response
	_ = rc.SetWriteDeadline(time.Time{})

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	if flushErr := rc.Flush(); flushErr != nil {
		if flusher, ok := w.(http.Flusher); ok {
			flusher.Flush()
		} else {
			log.Printf("[aiHandler] Warning: initial SSE flush returned: %v", flushErr)
		}
	}

	stopChan := make(chan struct{})
	var once sync.Once
	stopHeartbeat = func() {
		once.Do(func() {
			close(stopChan)
		})
	}

	// Cloudflare / proxy heartbeat ticker every 15 seconds
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-stopChan:
				return
			case <-ticker.C:
				_, writeErr := fmt.Fprintf(w, ": ping\n\n")
				if writeErr != nil {
					return
				}
				_ = rc.Flush()
			}
		}
	}()

	return rc, stopHeartbeat, nil
}

// checkRateLimit enforces per-user rate limits (10 req/min) on AI endpoints.
func (h *AIHandler) checkRateLimit(ctx context.Context, userID int64) bool {
	allowed, err := ai.CheckRateLimit(ctx, h.Redis, userID, 10, time.Minute)
	if err != nil {
		log.Printf("[aiHandler] Rate limit check error: %v", err)
	}
	return allowed
}

func (h *AIHandler) getIdempotencyKey(r *http.Request) string {
	key := r.Header.Get("Idempotency-Key")
	if key == "" {
		key = uuid.NewString()
	}
	return key
}

func (h *AIHandler) reserveDailyUsage(w http.ResponseWriter, r *http.Request, userID int64, tier, requestID string, feature dailyusage.Feature) (dailyusage.Reservation, bool) {
	reservation, err := dailyusage.Reserve(r.Context(), h.DB, userID, requestID, feature, tier, time.Now())
	if err == nil {
		return reservation, true
	}

	w.Header().Set("Content-Type", "application/json")
	if err == dailyusage.ErrDailyLimitReached {
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]any{
			"error":    "daily_limit_reached",
			"code":     "daily_limit_reached",
			"feature":  string(feature),
			"limit":    reservation.Limit,
			"used":     reservation.Limit,
			"reset_at": dailyusage.NextResetUTC(time.Now()).Format(time.RFC3339),
		})
		return dailyusage.Reservation{}, false
	}

	log.Printf("[aiHandler] Daily usage authorization failed for user %d feature %s: %v", userID, feature, err)
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]string{"error": "usage_authorization_failed"})
	return dailyusage.Reservation{}, false
}

func (h *AIHandler) releaseDailyUsage(reservation dailyusage.Reservation) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := dailyusage.Release(ctx, h.DB, reservation); err != nil {
		log.Printf("[aiHandler] Failed to release daily usage reservation for user %d feature %s: %v", reservation.UserID, reservation.Feature, err)
	}
}

func (h *AIHandler) completeDailyUsage(reservation dailyusage.Reservation) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := dailyusage.Complete(ctx, h.DB, reservation); err != nil {
		log.Printf("[aiHandler] Failed to complete daily usage reservation for user %d feature %s: %v", reservation.UserID, reservation.Feature, err)
	}
}

// Solve handles POST /api/scan/solve
func (h *AIHandler) Solve(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, `{"error":"Authentication required. Please log in to solve problems."}`, http.StatusUnauthorized)
		return
	}

	if !h.checkRateLimit(r.Context(), user.ID) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Too many requests. Please wait a moment before solving another problem.",
		})
		return
	}

	var req ai.SolveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.ImageBase64) == "" {
		http.Error(w, `{"error":"Image is required. Please capture or upload a clear photo of the problem."}`, http.StatusBadRequest)
		return
	}

	reservation, ok := h.reserveDailyUsage(w, r, user.ID, user.SubscriptionTier, h.getIdempotencyKey(r), dailyusage.Scan)
	if !ok {
		return
	}
	usageSucceeded := false
	defer func() {
		if !usageSucceeded {
			h.releaseDailyUsage(reservation)
		}
	}()

	rc, stopHeartbeat, err := h.setupSSE(w)
	if err != nil {
		http.Error(w, `{"error":"Streaming unsupported"}`, http.StatusInternalServerError)
		return
	}
	defer stopHeartbeat()

	var accumulatedText strings.Builder
	var streamMutex sync.Mutex

	streamErr := h.AIService.StreamSolve(r.Context(), req, func(token string) error {
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
		log.Printf("[aiHandler] Solve stream error for user %d: %v", user.ID, streamErr)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"stream_interrupted\"}\n\n")
		_ = rc.Flush()
		return
	}

	// Validate JSON integrity to protect against max_tokens truncation edge cases
	finalOutput := strings.TrimSpace(accumulatedText.String())
	if !json.Valid([]byte(finalOutput)) {
		log.Printf("[aiHandler] Solve stream returned truncated/invalid JSON for user %d.", user.ID)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"incomplete_response\"}\n\n")
		_ = rc.Flush()
		return
	}

	h.completeDailyUsage(reservation)
	usageSucceeded = true
	fmt.Fprintf(w, "data: [DONE]\n\n")
	_ = rc.Flush()
}

// Chat handles POST /api/scan/chat
func (h *AIHandler) Chat(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	if !h.checkRateLimit(r.Context(), user.ID) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Too many requests. Please wait a moment.",
		})
		return
	}

	var req ai.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if len(req.Messages) == 0 {
		http.Error(w, `{"error":"Messages array is required"}`, http.StatusBadRequest)
		return
	}

	reservation, ok := h.reserveDailyUsage(w, r, user.ID, user.SubscriptionTier, h.getIdempotencyKey(r), dailyusage.Chat)
	if !ok {
		return
	}
	usageSucceeded := false
	defer func() {
		if !usageSucceeded {
			h.releaseDailyUsage(reservation)
		}
	}()

	rc, stopHeartbeat, err := h.setupSSE(w)
	if err != nil {
		http.Error(w, `{"error":"Streaming unsupported"}`, http.StatusInternalServerError)
		return
	}
	defer stopHeartbeat()

	var streamMutex sync.Mutex
	streamErr := h.AIService.StreamChat(r.Context(), req, func(token string) error {
		streamMutex.Lock()
		defer streamMutex.Unlock()

		chunkJSON, _ := json.Marshal(map[string]string{"text": token})
		if _, writeErr := fmt.Fprintf(w, "data: %s\n\n", string(chunkJSON)); writeErr != nil {
			return writeErr
		}
		return rc.Flush()
	})

	if streamErr != nil {
		log.Printf("[aiHandler] Chat stream error for user %d: %v", user.ID, streamErr)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"stream_interrupted\"}\n\n")
		_ = rc.Flush()
		return
	}

	h.completeDailyUsage(reservation)
	usageSucceeded = true
	fmt.Fprintf(w, "data: [DONE]\n\n")
	_ = rc.Flush()
}

// GenerateQuiz handles POST /api/quizzes/generate
func (h *AIHandler) GenerateQuiz(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, `{"error":"Authentication required. Please log in to generate quizzes."}`, http.StatusUnauthorized)
		return
	}

	if !h.checkRateLimit(r.Context(), user.ID) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Too many requests. Please wait a moment before generating another quiz.",
		})
		return
	}

	var req ai.QuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if req.QuestionCount <= 0 {
		req.QuestionCount = 5
	}
	if req.QuestionCount > 30 {
		req.QuestionCount = 30
	}
	if dailyusage.IsFreeTier(user.SubscriptionTier) {
		if req.QuestionCount > 10 {
			req.QuestionCount = 10
		}
	}

	extractedText := h.getExtractedText(r.Context(), user.ID, req.ExtractionID)
	content := req.Topic
	if extractedText != "" {
		content = extractedText
	}

	if strings.TrimSpace(content) == "" {
		http.Error(w, `{"error":"Please provide a topic or document to generate a quiz."}`, http.StatusBadRequest)
		return
	}

	reservation, ok := h.reserveDailyUsage(w, r, user.ID, user.SubscriptionTier, h.getIdempotencyKey(r), dailyusage.Quiz)
	if !ok {
		return
	}
	usageSucceeded := false
	defer func() {
		if !usageSucceeded {
			h.releaseDailyUsage(reservation)
		}
	}()

	rc, stopHeartbeat, err := h.setupSSE(w)
	if err != nil {
		http.Error(w, `{"error":"Streaming unsupported"}`, http.StatusInternalServerError)
		return
	}
	defer stopHeartbeat()

	var accumulatedText strings.Builder
	var streamMutex sync.Mutex

	streamErr := h.AIService.StreamQuiz(r.Context(), req, content, func(token string) error {
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
		log.Printf("[aiHandler] Quiz stream error for user %d: %v", user.ID, streamErr)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"stream_interrupted\"}\n\n")
		_ = rc.Flush()
		return
	}

	// Validate JSON integrity to prevent partial array corruption
	finalOutput := strings.TrimSpace(accumulatedText.String())
	if !json.Valid([]byte(finalOutput)) {
		log.Printf("[aiHandler] Quiz generation produced truncated/invalid JSON for user %d.", user.ID)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"incomplete_response\"}\n\n")
		_ = rc.Flush()
		return
	}

	h.completeDailyUsage(reservation)
	usageSucceeded = true
	fmt.Fprintf(w, "data: [DONE]\n\n")
	_ = rc.Flush()
}

// GenerateFlashcards handles POST /api/flashcards/generate
func (h *AIHandler) GenerateFlashcards(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, `{"error":"Authentication required. Please log in to generate flashcards."}`, http.StatusUnauthorized)
		return
	}

	if !h.checkRateLimit(r.Context(), user.ID) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Too many requests. Please wait a moment before generating more flashcards.",
		})
		return
	}

	var req ai.FlashcardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if req.CardCount <= 0 {
		req.CardCount = 10
	}
	if req.CardCount > 30 {
		req.CardCount = 30
	}
	if dailyusage.IsFreeTier(user.SubscriptionTier) {
		if req.CardCount > 10 {
			req.CardCount = 10
		}
	}

	extractedText := h.getExtractedText(r.Context(), user.ID, req.ExtractionID)
	content := req.Topic
	if extractedText != "" {
		content = extractedText
	}

	if strings.TrimSpace(content) == "" {
		http.Error(w, `{"error":"Please provide a topic or upload a document to generate flashcards."}`, http.StatusBadRequest)
		return
	}

	reservation, ok := h.reserveDailyUsage(w, r, user.ID, user.SubscriptionTier, h.getIdempotencyKey(r), dailyusage.Flashcards)
	if !ok {
		return
	}
	usageSucceeded := false
	defer func() {
		if !usageSucceeded {
			h.releaseDailyUsage(reservation)
		}
	}()

	rc, stopHeartbeat, err := h.setupSSE(w)
	if err != nil {
		http.Error(w, `{"error":"Streaming unsupported"}`, http.StatusInternalServerError)
		return
	}
	defer stopHeartbeat()

	var accumulatedText strings.Builder
	var streamMutex sync.Mutex

	streamErr := h.AIService.StreamFlashcards(r.Context(), req, content, func(token string) error {
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
		log.Printf("[aiHandler] Flashcards stream error for user %d: %v", user.ID, streamErr)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"stream_interrupted\"}\n\n")
		_ = rc.Flush()
		return
	}

	// Validate JSON integrity to prevent partial array corruption
	finalOutput := strings.TrimSpace(accumulatedText.String())
	if !json.Valid([]byte(finalOutput)) {
		log.Printf("[aiHandler] Flashcard generation produced truncated/invalid JSON for user %d.", user.ID)
		fmt.Fprintf(w, "event: error\ndata: {\"error\":\"incomplete_response\"}\n\n")
		_ = rc.Flush()
		return
	}

	h.completeDailyUsage(reservation)
	usageSucceeded = true
	fmt.Fprintf(w, "data: [DONE]\n\n")
	_ = rc.Flush()
}
