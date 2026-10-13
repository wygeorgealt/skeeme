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

type DeepseekClient struct {
	apiKey       string
	model        string
	httpClient   *http.Client
	visionClient *VisionClient
}

func NewDeepseekClient(apiKey string, visionClient *VisionClient) *DeepseekClient {
	model := os.Getenv("DEEPSEEK_MODEL")
	if model == "" {
		model = "deepseek-chat"
	}
	return &DeepseekClient{
		apiKey:       apiKey,
		model:        model,
		httpClient:   &http.Client{Timeout: 120 * time.Second},
		visionClient: visionClient,
	}
}

type deepseekRequest struct {
	Model    string            `json:"model"`
	Messages []deepseekMessage `json:"messages"`
	Stream   bool              `json:"stream"`
}

type deepseekMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type deepseekStreamChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error"`
}

func (c *DeepseekClient) StreamCompletion(ctx context.Context, systemPrompt string, messages []Message, onToken StreamCallback) error {
	var dsMsgs []deepseekMessage
	if systemPrompt != "" {
		dsMsgs = append(dsMsgs, deepseekMessage{
			Role:    "system",
			Content: systemPrompt,
		})
	}

	for _, m := range messages {
		dsMsgs = append(dsMsgs, deepseekMessage{
			Role:    m.Role,
			Content: m.Content,
		})
	}

	reqBody := deepseekRequest{
		Model:    c.model,
		Messages: dsMsgs,
		Stream:   true,
	}

	return c.executeStream(ctx, reqBody, onToken)
}

func (c *DeepseekClient) StreamVisionCompletion(ctx context.Context, systemPrompt string, userPrompt string, imageBase64 string, onToken StreamCallback) error {
	if c.visionClient == nil {
		return fmt.Errorf("Google Cloud Vision client is not configured for Deepseek OCR fallback")
	}

	extractedText, err := c.visionClient.ExtractText(ctx, imageBase64)
	if err != nil {
		return fmt.Errorf("failed to extract text from image for Deepseek: %w", err)
	}

	fullUserPrompt := fmt.Sprintf("%s\n\nExtracted text from image:\n%s", userPrompt, extractedText)

	messages := []Message{
		{
			Role:    "user",
			Content: fullUserPrompt,
		},
	}

	return c.StreamCompletion(ctx, systemPrompt, messages, onToken)
}

func (c *DeepseekClient) executeStream(ctx context.Context, reqBody deepseekRequest, onToken StreamCallback) error {
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal deepseek request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.deepseek.com/chat/completions", bytes.NewReader(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create deepseek request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("deepseek request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("deepseek API returned status %d: %s", resp.StatusCode, string(bodyBytes))
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

		var chunk deepseekStreamChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		if chunk.Error != nil {
			return fmt.Errorf("deepseek stream error: %s", chunk.Error.Message)
		}

		for _, choice := range chunk.Choices {
			if choice.Delta.Content != "" {
				if err := onToken(choice.Delta.Content); err != nil {
					return err
				}
			}
		}
	}

	return scanner.Err()
}
