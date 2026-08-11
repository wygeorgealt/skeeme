package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ledongthuc/pdf"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/middleware"
)

type FileExtractHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
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

	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
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
		if err != nil {
			http.Error(w, "Failed to extract text from PDF", http.StatusUnprocessableEntity)
			return
		}
		extractedText = text
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
