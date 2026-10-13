package ai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type AnthropicClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewAnthropicClient(apiKey string) *AnthropicClient {
	model := os.Getenv("ANTHROPIC_MODEL")
	if model == "" {
		model = "claude-3-5-sonnet-20240620"
	}
	return &AnthropicClient{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

type anthropicRequest struct {
	Model     string         `json:"model"`
	MaxTokens int            `json:"max_tokens"`
	System    string         `json:"system,omitempty"`
	Messages  []anthropicMsg `json:"messages"`
	Stream    bool           `json:"stream"`
}

type anthropicMsg struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

type anthropicContentPart struct {
	Type   string                `json:"type"`
	Text   string                `json:"text,omitempty"`
	Source *anthropicImageSource `json:"source,omitempty"`
}

type anthropicImageSource struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}

type anthropicStreamEvent struct {
	Type  string `json:"type"`
	Delta struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"delta"`
	Error struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error"`
}

func (c *AnthropicClient) StreamCompletion(ctx context.Context, systemPrompt string, messages []Message, onToken StreamCallback) error {
	var aMsgs []anthropicMsg
	for _, m := range messages {
		aMsgs = append(aMsgs, anthropicMsg{
			Role:    m.Role,
			Content: m.Content,
		})
	}

	reqBody := anthropicRequest{
		Model:     c.model,
		MaxTokens: 4096,
		System:    systemPrompt,
		Messages:  aMsgs,
		Stream:    true,
	}

	return c.executeStream(ctx, reqBody, onToken)
}

func (c *AnthropicClient) StreamVisionCompletion(ctx context.Context, systemPrompt string, userPrompt string, imageBase64 string, onToken StreamCallback) error {
	mediaType, rawBase64 := parseBase64Image(imageBase64)

	contentParts := []anthropicContentPart{
		{
			Type: "text",
			Text: userPrompt,
		},
		{
			Type: "image",
			Source: &anthropicImageSource{
				Type:      "base64",
				MediaType: mediaType,
				Data:      rawBase64,
			},
		},
	}

	reqBody := anthropicRequest{
		Model:     c.model,
		MaxTokens: 4096,
		System:    systemPrompt,
		Messages: []anthropicMsg{
			{
				Role:    "user",
				Content: contentParts,
			},
		},
		Stream: true,
	}

	return c.executeStream(ctx, reqBody, onToken)
}

func (c *AnthropicClient) executeStream(ctx context.Context, reqBody anthropicRequest, onToken StreamCallback) error {
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal anthropic request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.anthropic.com/v1/messages", bytes.NewReader(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("anthropic request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("anthropic API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		line := scanner.Text()
		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			break
		}

		var event anthropicStreamEvent
		if err := json.Unmarshal([]byte(data), &event); err != nil {
			continue
		}

		if event.Error.Message != "" {
			return fmt.Errorf("anthropic stream error: %s (%s)", event.Error.Message, event.Error.Type)
		}

		if event.Delta.Text != "" {
			if err := onToken(event.Delta.Text); err != nil {
				return err
			}
		}
	}

	return scanner.Err()
}

func parseBase64Image(data string) (mediaType, rawData string) {
	if strings.HasPrefix(data, "data:") {
		parts := strings.SplitN(data, ";base64,", 2)
		if len(parts) == 2 {
			mediaType = strings.TrimPrefix(parts[0], "data:")
			rawData = parts[1]
			return mediaType, rawData
		}
	}
	return "image/jpeg", data
}
