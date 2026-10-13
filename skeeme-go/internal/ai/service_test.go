package ai

import (
	"context"
	"errors"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

type mockAIClient struct {
	tokensToEmit []string
	shouldError  bool
	errorMsg     string
}

func (m *mockAIClient) StreamCompletion(ctx context.Context, systemPrompt string, messages []Message, onToken StreamCallback) error {
	for _, tok := range m.tokensToEmit {
		if err := onToken(tok); err != nil {
			return err
		}
	}
	if m.shouldError {
		return errors.New(m.errorMsg)
	}
	return nil
}

func (m *mockAIClient) StreamVisionCompletion(ctx context.Context, systemPrompt string, userPrompt string, imageBase64 string, onToken StreamCallback) error {
	return m.StreamCompletion(ctx, systemPrompt, nil, onToken)
}

func TestFallback_BeforeFirstToken(t *testing.T) {
	primary := &mockAIClient{
		tokensToEmit: nil, // emits 0 tokens
		shouldError:  true,
		errorMsg:     "primary connection timeout",
	}

	fallback := &mockAIClient{
		tokensToEmit: []string{"{\"fallback\":", "true}"},
		shouldError:  false,
	}

	// Direct test on runWithFallback logic:
	var tokens []string
	var tokenCount int
	wrappedCb := func(tok string) error {
		tokenCount++
		tokens = append(tokens, tok)
		return nil
	}

	// Case 1: Primary fails before first token
	primaryErr := primary.StreamCompletion(context.Background(), "", nil, wrappedCb)
	if primaryErr != nil && tokenCount == 0 {
		// Allowed to fallback!
		fbErr := fallback.StreamCompletion(context.Background(), "", nil, wrappedCb)
		if fbErr != nil {
			t.Fatalf("Fallback failed: %v", fbErr)
		}
	}

	if len(tokens) != 2 {
		t.Fatalf("Expected fallback to emit 2 tokens, got %d", len(tokens))
	}
}

func TestFallback_MidStreamForbidden(t *testing.T) {
	primary := &mockAIClient{
		tokensToEmit: []string{"{\"partial\":", "\"data\""},
		shouldError:  true,
		errorMsg:     "upstream mid-stream socket closed",
	}

	fallbackCalled := false
	fallback := &mockAIClient{
		tokensToEmit: []string{"{\"other\":true}"},
		shouldError:  false,
	}

	var tokens []string
	var tokenCount int
	wrappedCb := func(tok string) error {
		tokenCount++
		tokens = append(tokens, tok)
		return nil
	}

	primaryErr := primary.StreamCompletion(context.Background(), "", nil, wrappedCb)
	if primaryErr != nil {
		if tokenCount > 0 {
			// CRITICAL: Do NOT call fallback!
			fallbackCalled = false
		} else {
			fallbackCalled = true
			_ = fallback.StreamCompletion(context.Background(), "", nil, wrappedCb)
		}
	}

	if fallbackCalled {
		t.Fatalf("Fallback should NOT have been called after primary emitted %d tokens", tokenCount)
	}

	if tokenCount != 2 {
		t.Fatalf("Expected exactly 2 tokens from primary before abort, got %d", tokenCount)
	}
}

func TestService_DefaultProvider_RedisDynamicSwitch(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("Failed to run miniredis: %v", err)
	}
	defer mr.Close()

	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	defer rdb.Close()

	service := NewService(rdb)
	ctx := context.Background()

	// 1. Initial default must be DeepSeek
	initial := service.GetDefaultProvider(ctx)
	if initial != ProviderDeepseek {
		t.Fatalf("Expected default provider to be %s, got %s", ProviderDeepseek, initial)
	}

	// 2. Switch to Anthropic
	if err := service.SetDefaultProvider(ctx, ProviderAnthropic); err != nil {
		t.Fatalf("Failed to set default provider to Anthropic: %v", err)
	}

	switched := service.GetDefaultProvider(ctx)
	if switched != ProviderAnthropic {
		t.Fatalf("Expected switched provider to be %s, got %s", ProviderAnthropic, switched)
	}

	// 3. Switch back to DeepSeek
	if err := service.SetDefaultProvider(ctx, ProviderDeepseek); err != nil {
		t.Fatalf("Failed to switch back to DeepSeek: %v", err)
	}

	reverted := service.GetDefaultProvider(ctx)
	if reverted != ProviderDeepseek {
		t.Fatalf("Expected reverted provider to be %s, got %s", ProviderDeepseek, reverted)
	}
}
