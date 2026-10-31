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
	"net/url"
	"strings"
	"time"
)

const (
	replicateModelPath = "/v1/models/lucataco/deepseek-ocr/predictions"
	replicateFileLimit = 1 << 20
)

type OCRClient interface {
	ExtractText(ctx context.Context, imageBase64 string) (string, error)
}

type ReplicateOCRClient struct {
	apiToken   string
	httpClient *http.Client
	baseURL    string
}

func NewReplicateOCRClient(apiToken string) *ReplicateOCRClient {
	return &ReplicateOCRClient{
		apiToken:   strings.TrimSpace(apiToken),
		httpClient: &http.Client{Timeout: 3 * time.Minute},
		baseURL:    "https://api.replicate.com",
	}
}

func NewOCRClient(replicateToken, googleVisionKey string) OCRClient {
	if strings.TrimSpace(replicateToken) != "" {
		return NewReplicateOCRClient(replicateToken)
	}
	if strings.TrimSpace(googleVisionKey) != "" {
		return NewVisionClient(googleVisionKey)
	}
	return nil
}

type replicatePredictionRequest struct {
	Input replicateOCRInput `json:"input"`
}

type replicateOCRInput struct {
	Image          string `json:"image"`
	TaskType       string `json:"task_type"`
	ReferenceText  string `json:"reference_text"`
	ResolutionSize string `json:"resolution_size"`
}

type replicatePrediction struct {
	ID     string          `json:"id"`
	Status string          `json:"status"`
	Output json.RawMessage `json:"output"`
	Error  string          `json:"error"`
}

type replicateUploadedFile struct {
	URLs struct {
		Get string `json:"get"`
	} `json:"urls"`
}

func (c *ReplicateOCRClient) ExtractText(ctx context.Context, imageBase64 string) (string, error) {
	if strings.TrimSpace(c.apiToken) == "" {
		return "", fmt.Errorf("Replicate API token is not configured")
	}
	ctx, cancel := context.WithTimeout(ctx, 3*time.Minute)
	defer cancel()

	mediaType, rawBase64 := parseBase64Image(imageBase64)
	rawBase64 = strings.TrimSpace(rawBase64)
	imageBytes, err := base64.StdEncoding.DecodeString(rawBase64)
	if err != nil {
		imageBytes, err = base64.RawStdEncoding.DecodeString(rawBase64)
	}
	if err != nil {
		return "", fmt.Errorf("invalid base64 image: %w", err)
	}
	if len(imageBytes) == 0 {
		return "", fmt.Errorf("image is empty")
	}

	imageInput := "data:" + mediaType + ";base64," + base64.StdEncoding.EncodeToString(imageBytes)
	if len(imageBytes) > replicateFileLimit {
		imageInput, err = c.uploadInputFile(ctx, mediaType, imageBytes)
		if err != nil {
			return "", fmt.Errorf("failed to upload image to Replicate: %w", err)
		}
	}

	prediction, err := c.createPrediction(ctx, imageInput)
	if err != nil {
		return "", err
	}
	if !isSuccessfulPrediction(prediction.Status) {
		prediction, err = c.waitForPrediction(ctx, prediction)
		if err != nil {
			if ctx.Err() != nil && prediction.ID != "" {
				c.cancelPrediction(prediction.ID)
			}
			return "", err
		}
	}

	var text string
	if err := json.Unmarshal(prediction.Output, &text); err != nil {
		return "", fmt.Errorf("Replicate OCR returned an unexpected output format")
	}
	text = strings.TrimSpace(text)
	if text == "" {
		return "", fmt.Errorf("Replicate OCR did not detect any text")
	}
	return text, nil
}

func (c *ReplicateOCRClient) uploadInputFile(ctx context.Context, mediaType string, content []byte) (string, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("content", "scan"+extensionForMediaType(mediaType))
	if err != nil {
		return "", fmt.Errorf("create upload form: %w", err)
	}
	if _, err := part.Write(content); err != nil {
		return "", fmt.Errorf("write upload form: %w", err)
	}
	if err := writer.WriteField("type", mediaType); err != nil {
		return "", fmt.Errorf("write upload media type: %w", err)
	}
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("finish upload form: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/v1/files", &body)
	if err != nil {
		return "", fmt.Errorf("create upload request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	var uploaded replicateUploadedFile
	if err := c.doJSON(req, &uploaded); err != nil {
		return "", fmt.Errorf("upload input file: %w", err)
	}
	parsedURL, err := url.Parse(uploaded.URLs.Get)
	if err != nil || parsedURL.Scheme != "https" || parsedURL.Host == "" {
		return "", fmt.Errorf("Replicate returned an invalid uploaded-file URL")
	}
	return uploaded.URLs.Get, nil
}

func (c *ReplicateOCRClient) createPrediction(ctx context.Context, image string) (replicatePrediction, error) {
	payload := replicatePredictionRequest{
		Input: replicateOCRInput{
			Image:          image,
			TaskType:       "Free OCR",
			ReferenceText:  "",
			ResolutionSize: "Gundam (Recommended)",
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return replicatePrediction{}, fmt.Errorf("encode Replicate OCR request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+replicateModelPath, bytes.NewReader(body))
	if err != nil {
		return replicatePrediction{}, fmt.Errorf("create Replicate OCR request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "wait=60")

	var prediction replicatePrediction
	if err := c.doJSON(req, &prediction); err != nil {
		return replicatePrediction{}, fmt.Errorf("create Replicate OCR prediction: %w", err)
	}
	if prediction.Status == "failed" || prediction.Status == "canceled" {
		return prediction, predictionError(prediction)
	}
	if isSuccessfulPrediction(prediction.Status) && len(prediction.Output) == 0 {
		return prediction, fmt.Errorf("Replicate OCR completed without output")
	}
	if prediction.ID == "" && !isSuccessfulPrediction(prediction.Status) {
		return prediction, fmt.Errorf("Replicate OCR returned no prediction ID")
	}
	return prediction, nil
}

func (c *ReplicateOCRClient) waitForPrediction(ctx context.Context, prediction replicatePrediction) (replicatePrediction, error) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return prediction, ctx.Err()
		case <-ticker.C:
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/v1/predictions/"+url.PathEscape(prediction.ID), nil)
		if err != nil {
			return prediction, fmt.Errorf("create Replicate prediction status request: %w", err)
		}
		req.Header.Set("Authorization", "Bearer "+c.apiToken)
		if err := c.doJSON(req, &prediction); err != nil {
			return prediction, fmt.Errorf("check Replicate OCR prediction: %w", err)
		}
		switch prediction.Status {
		case "succeeded", "successful":
			if len(prediction.Output) == 0 {
				return prediction, fmt.Errorf("Replicate OCR completed without output")
			}
			return prediction, nil
		case "failed", "canceled":
			return prediction, predictionError(prediction)
		}
	}
}

func (c *ReplicateOCRClient) cancelPrediction(id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/v1/predictions/"+url.PathEscape(id)+"/cancel", nil)
	if err != nil {
		return
	}
	req.Header.Set("Authorization", "Bearer "+c.apiToken)
	resp, err := c.httpClient.Do(req)
	if err == nil {
		_ = resp.Body.Close()
	}
}

func (c *ReplicateOCRClient) doJSON(req *http.Request, target any) error {
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		message, _ := io.ReadAll(io.LimitReader(resp.Body, 32<<10))
		return fmt.Errorf("Replicate returned status %d: %s", resp.StatusCode, strings.TrimSpace(string(message)))
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 2<<20)).Decode(target); err != nil {
		return fmt.Errorf("decode Replicate response: %w", err)
	}
	return nil
}

func isSuccessfulPrediction(status string) bool {
	return status == "succeeded" || status == "successful"
}

func predictionError(prediction replicatePrediction) error {
	if prediction.Error != "" {
		return fmt.Errorf("Replicate OCR %s: %s", prediction.Status, prediction.Error)
	}
	return fmt.Errorf("Replicate OCR %s", prediction.Status)
}

func extensionForMediaType(mediaType string) string {
	switch mediaType {
	case "application/pdf":
		return ".pdf"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	case "image/heic":
		return ".heic"
	default:
		return ".jpg"
	}
}
