package ai

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// CheckRateLimit checks if a user has exceeded their request limit using an atomic Redis counter.
// Default limit: 10 requests per 1-minute window.
func CheckRateLimit(ctx context.Context, rdb *redis.Client, userID int64, limit int, window time.Duration) (bool, error) {
	if rdb == nil {
		// If Redis is not available, fail open
		return true, nil
	}

	key := fmt.Sprintf("ratelimit:ai:%d", userID)

	pipe := rdb.Pipeline()
	incrCmd := pipe.Incr(ctx, key)
	_ = pipe.Expire(ctx, key, window)

	_, err := pipe.Exec(ctx)
	if err != nil {
		return true, err
	}

	count := incrCmd.Val()
	if count > int64(limit) {
		return false, nil
	}

	return true, nil
}
