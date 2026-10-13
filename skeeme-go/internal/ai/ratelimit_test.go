package ai

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func TestCheckRateLimit(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("Failed to run miniredis: %v", err)
	}
	defer mr.Close()

	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	defer rdb.Close()

	ctx := context.Background()
	userID := int64(999)
	limit := 3
	window := 1 * time.Minute

	// First 3 requests must be allowed
	for i := 1; i <= limit; i++ {
		allowed, err := CheckRateLimit(ctx, rdb, userID, limit, window)
		if err != nil {
			t.Fatalf("Unexpected error on request %d: %v", i, err)
		}
		if !allowed {
			t.Fatalf("Expected request %d to be allowed", i)
		}
	}

	// 4th request must be rejected (limit exceeded)
	allowed, err := CheckRateLimit(ctx, rdb, userID, limit, window)
	if err != nil {
		t.Fatalf("Unexpected error on 4th request: %v", err)
	}
	if allowed {
		t.Fatalf("Expected 4th request to be blocked by rate limiter")
	}

	// Advance time past the window
	mr.FastForward(61 * time.Second)

	// Now should be allowed again
	allowed, err = CheckRateLimit(ctx, rdb, userID, limit, window)
	if err != nil {
		t.Fatalf("Unexpected error after window reset: %v", err)
	}
	if !allowed {
		t.Fatalf("Expected request to be allowed after window reset")
	}
}
