package cache

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() (*redis.Client, error) {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		log.Println("WARNING: REDIS_URL not set, Redis features will be unavailable")
		// Return a client pointing to nowhere - calls will fail gracefully
		return redis.NewClient(&redis.Options{Addr: "localhost:6379"}), nil
	}
	
	opts, err := redis.ParseURL(url)
	if err != nil {
		log.Printf("WARNING: Could not parse REDIS_URL: %v - continuing without Redis", err)
		return redis.NewClient(&redis.Options{Addr: "localhost:6379"}), nil
	}

	client := redis.NewClient(opts)
	
	// Test connection but don't fail if it doesn't work
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("WARNING: Redis ping failed: %v - continuing without Redis", err)
	} else {
		log.Println("Redis connected successfully")
	}

	return client, nil
}
