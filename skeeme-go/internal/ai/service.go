package ai

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/redis/go-redis/v9"
)

type Service struct {
	anthropic *AnthropicClient
	deepseek  *DeepseekClient
	vision    *VisionClient
	redis     *redis.Client
}

func NewService(rdb *redis.Client) *Service {
	anthropicKey := os.Getenv("ANTHROPIC_API_KEY")
	deepseekKey := os.Getenv("DEEPSEEK_API_KEY")
	visionKey := os.Getenv("GOOGLE_CLOUD_VISION_API_KEY")

	var vision *VisionClient
	if visionKey != "" {
		vision = NewVisionClient(visionKey)
	}

	var anthropic *AnthropicClient
	if anthropicKey != "" {
		anthropic = NewAnthropicClient(anthropicKey)
	}

	var deepseek *DeepseekClient
	if deepseekKey != "" {
		deepseek = NewDeepseekClient(deepseekKey, vision)
	}

	return &Service{
		anthropic: anthropic,
		deepseek:  deepseek,
		vision:    vision,
		redis:     rdb,
	}
}

// GetDefaultProvider returns the active default AI provider (checks Redis, then env, defaults to DeepSeek).
func (s *Service) GetDefaultProvider(ctx context.Context) Provider {
	if s.redis != nil {
		val, err := s.redis.Get(ctx, "system:ai_default_provider").Result()
		if err == nil {
			val = strings.ToLower(strings.TrimSpace(val))
			if val == string(ProviderAnthropic) || val == "claude" {
				return ProviderAnthropic
			}
			if val == string(ProviderDeepseek) {
				return ProviderDeepseek
			}
		}
	}

	envDefault := strings.ToLower(strings.TrimSpace(os.Getenv("DEFAULT_AI_PROVIDER")))
	if envDefault == string(ProviderAnthropic) || envDefault == "claude" {
		return ProviderAnthropic
	}

	return ProviderDeepseek
}

// SetDefaultProvider dynamically updates the active default AI provider in Redis.
func (s *Service) SetDefaultProvider(ctx context.Context, p Provider) error {
	if s.redis == nil {
		return fmt.Errorf("redis client is not available")
	}
	clean := strings.ToLower(strings.TrimSpace(string(p)))
	if clean == "claude" {
		clean = string(ProviderAnthropic)
	}
	if clean != string(ProviderAnthropic) && clean != string(ProviderDeepseek) {
		return fmt.Errorf("invalid provider '%s': must be 'deepseek' or 'anthropic'", clean)
	}
	return s.redis.Set(ctx, "system:ai_default_provider", clean, 0).Err()
}

// GetProviderStatus reports the configuration readiness of AI providers.
func (s *Service) GetProviderStatus() map[string]bool {
	return map[string]bool{
		"anthropic_configured": s.anthropic != nil,
		"deepseek_configured":  s.deepseek != nil,
		"vision_configured":    s.vision != nil,
	}
}

// resolveProviders returns the primary client and an optional fallback client.
func (s *Service) resolveProviders(ctx context.Context, preferred Provider) (Client, Client, error) {
	var primary, fallback Client

	target := preferred
	if target == "" {
		target = s.GetDefaultProvider(ctx)
	} else if strings.ToLower(string(target)) == "claude" {
		target = ProviderAnthropic
	}

	if target == ProviderAnthropic {
		if s.anthropic != nil {
			primary = s.anthropic
			if s.deepseek != nil {
				fallback = s.deepseek
			}
		} else if s.deepseek != nil {
			log.Printf("[aiService] Anthropic requested but not configured, using Deepseek")
			primary = s.deepseek
		}
	} else {
		// Default to DeepSeek
		if s.deepseek != nil {
			primary = s.deepseek
			if s.anthropic != nil {
				fallback = s.anthropic
			}
		} else if s.anthropic != nil {
			log.Printf("[aiService] Deepseek requested but not configured, using Anthropic")
			primary = s.anthropic
		}
	}

	if primary == nil {
		return nil, nil, fmt.Errorf("no AI provider configured (missing DEEPSEEK_API_KEY and ANTHROPIC_API_KEY)")
	}

	return primary, fallback, nil
}

// runWithFallback executes an operation with fallback ONLY before the first token.
func (s *Service) runWithFallback(
	ctx context.Context,
	preferred Provider,
	onToken StreamCallback,
	execute func(client Client, cb StreamCallback) error,
) error {
	primary, fallback, err := s.resolveProviders(ctx, preferred)
	if err != nil {
		return err
	}

	var tokenCount int
	wrappedCallback := func(token string) error {
		tokenCount++
		return onToken(token)
	}

	// Attempt primary provider
	primaryErr := execute(primary, wrappedCallback)
	if primaryErr == nil {
		return nil
	}

	// CRITICAL SAFETY RULE: Fallback ONLY before the first token.
	if tokenCount > 0 {
		log.Printf("[aiService] Primary provider failed mid-stream after %d tokens. Aborting without fallback: %v", tokenCount, primaryErr)
		return primaryErr
	}

	if fallback == nil {
		log.Printf("[aiService] Primary provider failed and no fallback is available: %v", primaryErr)
		return primaryErr
	}

	log.Printf("[aiService] Primary provider failed before emitting any tokens (%v). Attempting fallback provider...", primaryErr)
	return execute(fallback, onToken)
}

func (s *Service) StreamSolve(ctx context.Context, req SolveRequest, onToken StreamCallback) error {
	userPrompt := "Solve the problem presented in this image."
	return s.runWithFallback(ctx, req.Provider, onToken, func(c Client, cb StreamCallback) error {
		return c.StreamVisionCompletion(ctx, ScanSolveSystemPrompt, userPrompt, req.ImageBase64, cb)
	})
}

func (s *Service) StreamChat(ctx context.Context, req ChatRequest, onToken StreamCallback) error {
	systemPrompt := ScanChatSystemPrompt(req.Context)
	return s.runWithFallback(ctx, req.Provider, onToken, func(c Client, cb StreamCallback) error {
		return c.StreamCompletion(ctx, systemPrompt, req.Messages, cb)
	})
}

func (s *Service) StreamQuiz(ctx context.Context, req QuizRequest, content string, onToken StreamCallback) error {
	systemPrompt := QuizGenerationSystemPrompt(req.QuestionCount, req.Difficulty)
	userPrompt := fmt.Sprintf("Topic / Source Material:\n%s", content)
	messages := []Message{
		{
			Role:    "user",
			Content: userPrompt,
		},
	}

	return s.runWithFallback(ctx, req.Provider, onToken, func(c Client, cb StreamCallback) error {
		return c.StreamCompletion(ctx, systemPrompt, messages, cb)
	})
}

func (s *Service) StreamSummary(ctx context.Context, req SummaryRequest, content string, onToken StreamCallback) error {
	userPrompt := fmt.Sprintf("Topic: %s\n\nSource material (use this if present, otherwise rely on the topic):\n%s", req.Topic, content)
	messages := []Message{{Role: "user", Content: userPrompt}}

	return s.runWithFallback(ctx, req.Provider, onToken, func(c Client, cb StreamCallback) error {
		return c.StreamCompletion(ctx, SummaryGenerationSystemPrompt, messages, cb)
	})
}

func (s *Service) StreamFlashcards(ctx context.Context, req FlashcardRequest, content string, onToken StreamCallback) error {
	systemPrompt := FlashcardGenerationSystemPrompt(req.CardCount, req.Difficulty)
	userPrompt := fmt.Sprintf("Topic / Source Material:\n%s", content)
	messages := []Message{
		{
			Role:    "user",
			Content: userPrompt,
		},
	}

	return s.runWithFallback(ctx, req.Provider, onToken, func(c Client, cb StreamCallback) error {
		return c.StreamCompletion(ctx, systemPrompt, messages, cb)
	})
}
