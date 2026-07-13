package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	status := "ok"
	dbStatus := "ok"
	redisStatus := "ok"

	// Check DB
	if err := h.DB.PingContext(ctx); err != nil {
		dbStatus = "error: " + err.Error()
		status = "degraded"
	}

	// Check Redis
	if err := h.Redis.Ping(ctx).Err(); err != nil {
		redisStatus = "error: " + err.Error()
		status = "degraded"
	}

	response := map[string]string{
		"status": status,
		"db":     dbStatus,
		"redis":  redisStatus,
		"time":   time.Now().UTC().Format(time.RFC3339),
	}

	if status != "ok" {
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
