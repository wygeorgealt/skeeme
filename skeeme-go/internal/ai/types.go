package ai

import "context"

type Provider string

const (
	ProviderAnthropic Provider = "anthropic"
	ProviderDeepseek  Provider = "deepseek"
)

// Message represents a text chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// StreamCallback is called whenever a new token/text chunk is received
type StreamCallback func(token string) error

// SolveRequest holds parameters for solving an image
type SolveRequest struct {
	ImageBase64 string   `json:"image"`
	Provider    Provider `json:"provider"`
}

// ChatRequest holds parameters for tutor follow-up chat
type ChatRequest struct {
	Messages []Message `json:"messages"`
	Context  string    `json:"context"`
	Provider Provider  `json:"provider"`
}

// QuizRequest holds parameters for generating a quiz
type QuizRequest struct {
	Topic         string   `json:"topic"`
	Difficulty    string   `json:"difficulty"`
	QuestionCount int      `json:"question_count"`
	QuestionTypes []string `json:"question_types"`
	ExtractionID  string   `json:"extraction_id"`
	Provider      Provider `json:"provider"`
}

// FlashcardRequest holds parameters for generating flashcards
type FlashcardRequest struct {
	Topic        string   `json:"topic"`
	Difficulty   string   `json:"difficulty"`
	CardCount    int      `json:"card_count"`
	DeckID       string   `json:"deck_id"`
	ExtractionID string   `json:"extraction_id"`
	Provider     Provider `json:"provider"`
}

// SummaryRequest holds parameters for generating a study summary
type SummaryRequest struct {
	Topic        string   `json:"topic"`
	ExtractionID string   `json:"extraction_id"`
	Provider     Provider `json:"provider"`
}

// Client defines the interface for an AI model provider
type Client interface {
	StreamCompletion(ctx context.Context, systemPrompt string, messages []Message, onToken StreamCallback) error
	StreamVisionCompletion(ctx context.Context, systemPrompt string, userPrompt string, imageBase64 string, onToken StreamCallback) error
}
