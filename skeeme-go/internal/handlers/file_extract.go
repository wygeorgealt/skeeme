package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ledongthuc/pdf"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/ai"
	"skeeme-go/internal/middleware"
)

type FileExtractHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
	OCR   ai.OCRClient
}

type FileExtractResponse struct {
	ExtractionID string `json:"extraction_id"`
}

func (h *FileExtractHandler) Extract(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "File too large or invalid format", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "No file uploaded", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	var extractedText string
	filename := strings.ToLower(header.Filename)

	if strings.HasSuffix(filename, ".pdf") {
		text, err := extractPdfText(content, int64(len(content)))
		if err == nil {
			extractedText = text
		}
		if strings.TrimSpace(extractedText) == "" && h.OCR != nil {
			allowed, limitErr := h.checkOCRRateLimit(r, user.ID)
			if limitErr != nil {
				log.Printf("[fileExtract] OCR rate limit check failed: %v", limitErr)
				http.Error(w, "OCR is temporarily unavailable", http.StatusServiceUnavailable)
				return
			}
			if !allowed {
				http.Error(w, "Too many OCR requests. Please wait a moment and try again.", http.StatusTooManyRequests)
				return
			}
			mediaType := http.DetectContentType(content)
			extractedText, err = h.OCR.ExtractText(r.Context(), encodeImageData(mediaType, content))
			if err != nil {
				http.Error(w, "Failed to extract text from PDF", http.StatusUnprocessableEntity)
				return
			}
		} else if err != nil {
			http.Error(w, "Failed to extract text from PDF", http.StatusUnprocessableEntity)
			return
		}
	} else if mediaType := http.DetectContentType(content); strings.HasPrefix(mediaType, "image/") {
		if h.OCR == nil {
			http.Error(w, "Image OCR is not configured", http.StatusServiceUnavailable)
			return
		}
		allowed, limitErr := h.checkOCRRateLimit(r, user.ID)
		if limitErr != nil {
			log.Printf("[fileExtract] OCR rate limit check failed: %v", limitErr)
			http.Error(w, "OCR is temporarily unavailable", http.StatusServiceUnavailable)
			return
		}
		if !allowed {
			http.Error(w, "Too many OCR requests. Please wait a moment and try again.", http.StatusTooManyRequests)
			return
		}
		extractedText, err = h.OCR.ExtractText(r.Context(), encodeImageData(mediaType, content))
		if err != nil {
			http.Error(w, "Failed to extract text from image", http.StatusUnprocessableEntity)
			return
		}
	} else {
		// Fallback for TXT or other text formats
		extractedText = string(content)
	}

	// Basic cleanup
	extractedText = strings.TrimSpace(extractedText)
	if len(extractedText) == 0 {
		http.Error(w, "No extractable text found in document", http.StatusUnprocessableEntity)
		return
	}

	// Limit to max characters if needed (e.g., 50000)
	if len(extractedText) > 50000 {
		extractedText = extractedText[:50000]
	}

	extractionID := uuid.New().String()

	// Store in Redis with 1 hour expiration
	redisKey := fmt.Sprintf("extraction:%d:%s", user.ID, extractionID)
	err = h.Redis.Set(r.Context(), redisKey, extractedText, 1*time.Hour).Err()
	if err != nil {
		http.Error(w, "Failed to cache extracted text", http.StatusInternalServerError)
		return
	}

	res := FileExtractResponse{
		ExtractionID: extractionID,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *FileExtractHandler) checkOCRRateLimit(r *http.Request, userID int64) (bool, error) {
	if h.Redis == nil {
		return false, fmt.Errorf("Redis is not configured")
	}

	key := fmt.Sprintf("ratelimit:ocr:%d", userID)
	count, err := h.Redis.Incr(r.Context(), key).Result()
	if err != nil {
		return false, err
	}
	if count == 1 {
		if err := h.Redis.Expire(r.Context(), key, time.Minute).Err(); err != nil {
			return false, err
		}
	}
	return count <= 10, nil
}

func encodeImageData(mediaType string, content []byte) string {
	return "data:" + mediaType + ";base64," + base64.StdEncoding.EncodeToString(content)
}

// Helper to extract text using ledongthuc/pdf
func extractPdfText(content []byte, size int64) (string, error) {
	reader, err := pdf.NewReader(bytes.NewReader(content), size)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	b, err := reader.GetPlainText()
	if err != nil {
		return "", err
	}
	buf.ReadFrom(b)
	return buf.String(), nil
}
