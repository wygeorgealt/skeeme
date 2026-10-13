package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type VisionClient struct {
	apiKey     string
	httpClient *http.Client
}

func NewVisionClient(apiKey string) *VisionClient {
	return &VisionClient{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type visionRequest struct {
	Requests []visionAnnotateRequest `json:"requests"`
}

type visionAnnotateRequest struct {
	Image    visionImage     `json:"image"`
	Features []visionFeature `json:"features"`
}

type visionImage struct {
	Content string `json:"content"`
}

type visionFeature struct {
	Type string `json:"type"`
}

type visionResponse struct {
	Responses []struct {
		FullTextAnnotation struct {
			Text string `json:"text"`
		} `json:"fullTextAnnotation"`
		Error *struct {
			Message string `json:"message"`
			Code    int    `json:"code"`
		} `json:"error"`
	} `json:"responses"`
}

// ExtractText extracts text from a base64 encoded image using Google Cloud Vision OCR
func (v *VisionClient) ExtractText(ctx context.Context, imageBase64 string) (string, error) {
	if v.apiKey == "" {
		return "", fmt.Errorf("Google Cloud Vision API key is missing")
	}

	_, rawData := parseBase64Image(imageBase64)
	rawData = strings.TrimSpace(rawData)

	reqPayload := visionRequest{
		Requests: []visionAnnotateRequest{
			{
				Image: visionImage{
					Content: rawData,
				},
				Features: []visionFeature{
					{
						Type: "DOCUMENT_TEXT_DETECTION",
					},
				},
			},
		},
	}

	jsonData, err := json.Marshal(reqPayload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal vision request: %w", err)
	}

	url := fmt.Sprintf("https://vision.googleapis.com/v1/images:annotate?key=%s", v.apiKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create vision request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := v.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("vision request failed: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read vision response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("vision API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var vResp visionResponse
	if err := json.Unmarshal(bodyBytes, &vResp); err != nil {
		return "", fmt.Errorf("failed to parse vision response: %w", err)
	}

	if len(vResp.Responses) == 0 {
		return "", fmt.Errorf("no response from vision API")
	}

	if vResp.Responses[0].Error != nil {
		return "", fmt.Errorf("vision OCR error: %s", vResp.Responses[0].Error.Message)
	}

	text := strings.TrimSpace(vResp.Responses[0].FullTextAnnotation.Text)
	if text == "" {
		return "", fmt.Errorf("could not detect any text in the image")
	}

	return text, nil
}
