package ai

import (
	"context"
	"fmt"
	"log"
	"os"
)

type Service struct {
	anthropic *AnthropicClient
	deepseek  *DeepseekClient
	vision    *VisionClient
}

func NewService() *Service {
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
	}
}

// resolveProviders returns the primary client and an optional fallback client.
func (s *Service) resolveProviders(preferred Provider) (Client, Client, error) {
	var primary, fallback Client

	if preferred == ProviderDeepseek {
		if s.deepseek != nil {
			primary = s.deepseek
			if s.anthropic != nil {
				fallback = s.anthropic
			}
		} else if s.anthropic != nil {
			log.Printf("[aiService] Deepseek requested but not configured, using Anthropic")
			primary = s.anthropic
		}
	} else {
		// Default to Anthropic
		if s.anthropic != nil {
			primary = s.anthropic
			if s.deepseek != nil {
				fallback = s.deepseek
			}
		} else if s.deepseek != nil {
			log.Printf("[aiService] Anthropic requested but not configured, using Deepseek")
			primary = s.deepseek
		}
	}

	if primary == nil {
		return nil, nil, fmt.Errorf("no AI provider configured (missing ANTHROPIC_API_KEY and DEEPSEEK_API_KEY)")
	}

	return primary, fallback, nil
}

// runWithFallback executes an operation with fallback ONLY before the first token.
// Switching providers mid-stream would produce corrupted JSON.
func (s *Service) runWithFallback(
	ctx context.Context,
	preferred Provider,
	onToken StreamCallback,
	execute func(client Client, cb StreamCallback) error,
) error {
	primary, fallback, err := s.resolveProviders(preferred)
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
	// If any tokens have already been emitted, falling back mid-stream produces garbage JSON.
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
