package ai

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"strings"
	"time"
)

const (
	rapidAPIOCRURL  = "https://best-ocr-api.p.rapidapi.com/parse/image"
	rapidAPIOCRHost = "best-ocr-api.p.rapidapi.com"
)

type RapidAPIOCRClient struct {
	apiKey     string
	httpClient *http.Client
	endpoint   string
	host       string
}

func NewRapidAPIOCRClient(apiKey string) *RapidAPIOCRClient {
	return &RapidAPIOCRClient{
		apiKey:     strings.TrimSpace(apiKey),
		httpClient: &http.Client{Timeout: 60 * time.Second},
		endpoint:   rapidAPIOCRURL,
		host:       rapidAPIOCRHost,
	}
}

func (c *RapidAPIOCRClient) ExtractText(ctx context.Context, imageBase64 string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("RapidAPI key is not configured")
	}

	mediaType, rawBase64 := parseBase64Image(imageBase64)
	imageBytes, err := base64.StdEncoding.DecodeString(strings.TrimSpace(rawBase64))
	if err != nil {
		imageBytes, err = base64.RawStdEncoding.DecodeString(strings.TrimSpace(rawBase64))
	}
	if err != nil {
		return "", fmt.Errorf("invalid base64 image: %w", err)
	}
	if len(imageBytes) == 0 {
		return "", fmt.Errorf("image is empty")
	}

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	partHeader := make(textproto.MIMEHeader)
	partHeader.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="scan%s"`, extensionForMediaType(mediaType)))
	partHeader.Set("Content-Type", mediaType)
	part, err := writer.CreatePart(partHeader)
	if err != nil {
		return "", fmt.Errorf("create RapidAPI OCR file part: %w", err)
	}
	if _, err := part.Write(imageBytes); err != nil {
		return "", fmt.Errorf("write RapidAPI OCR image: %w", err)
	}

	fields := [][2]string{
		{"FileType", ".Auto"},
		{"IsCreateSearchablePDF", "false"},
		{"OCREngine", "5"},
		{"checkboxTemplate", "0"},
		{"detectCheckbox", "false"},
		{"detectOrientation", "false"},
		{"isOverlayRequired", "true"},
		{"isSearchablePdfHideTextLayer", "true"},
		{"isTable", "false"},
		{"language", "eng"},
		{"scale", "true"},
	}
	for _, field := range fields {
		if err := writer.WriteField(field[0], field[1]); err != nil {
			return "", fmt.Errorf("write RapidAPI OCR field %s: %w", field[0], err)
		}
	}
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("finish RapidAPI OCR request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, &body)
	if err != nil {
		return "", fmt.Errorf("create RapidAPI OCR request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-RapidAPI-Key", c.apiKey)
	req.Header.Set("X-RapidAPI-Host", c.host)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("RapidAPI OCR request failed: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return "", fmt.Errorf("read RapidAPI OCR response: %w", err)
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return "", fmt.Errorf("RapidAPI OCR returned status %d", resp.StatusCode)
	}

	text, err := parseRapidAPIOCRResponse(responseBody)
	if err != nil {
		return "", err
	}
	if text == "" {
		return "", fmt.Errorf("RapidAPI OCR did not detect any text")
	}
	return text, nil
}

func parseRapidAPIOCRResponse(body []byte) (string, error) {
	var response any
	if err := json.Unmarshal(body, &response); err != nil {
		text := strings.TrimSpace(string(body))
		if text == "" {
			return "", fmt.Errorf("RapidAPI OCR returned an empty response")
		}
		return text, nil
	}

	text := strings.TrimSpace(findRapidAPIOCRText(response))
	if text == "" {
		return "", fmt.Errorf("RapidAPI OCR response did not contain recognized text")
	}
	return text, nil
}

func findRapidAPIOCRText(value any) string {
	switch typed := value.(type) {
	case string:
		return typed
	case []any:
		var parts []string
		for _, item := range typed {
			if text := strings.TrimSpace(findRapidAPIOCRText(item)); text != "" {
				parts = append(parts, text)
			}
		}
		return strings.Join(parts, "\n")
	case map[string]any:
		for _, key := range []string{"ParsedResults", "ParsedText", "text", "extractedText", "ocrText", "result", "data"} {
			for responseKey, item := range typed {
				if strings.EqualFold(responseKey, key) {
					if text := findRapidAPIOCRText(item); strings.TrimSpace(text) != "" {
						return text
					}
				}
			}
		}
	}
	return ""
}
