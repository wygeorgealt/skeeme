package handlers

import (
	"context"
	"net/http/httptest"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func TestOCRRateLimit(t *testing.T) {
	server, err := miniredis.Run()
	if err != nil {
		t.Fatalf("start miniredis: %v", err)
	}
	defer server.Close()

	handler := &FileExtractHandler{Redis: redis.NewClient(&redis.Options{Addr: server.Addr()})}
	defer handler.Redis.Close()

	request := httptest.NewRequestWithContext(context.Background(), "POST", "/files/extract", nil)
	for attempt := 1; attempt <= 10; attempt++ {
		allowed, err := handler.checkOCRRateLimit(request, 42)
		if err != nil {
			t.Fatalf("check rate limit on attempt %d: %v", attempt, err)
		}
		if !allowed {
			t.Fatalf("request %d should be allowed", attempt)
		}
	}

	allowed, err := handler.checkOCRRateLimit(request, 42)
	if err != nil {
		t.Fatalf("check rate limit on attempt 11: %v", err)
	}
	if allowed {
		t.Fatal("11th OCR request should be rate limited")
	}
}
