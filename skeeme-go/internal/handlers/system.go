package handlers

import (
	"database/sql"
	"net/http"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

type SystemHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

// Pricing GET /api/v1/student/system/pricing
func (h *SystemHandler) Pricing(w http.ResponseWriter, r *http.Request) {
	var valueStr string
	err := h.DB.GetContext(r.Context(), &valueStr, "SELECT value FROM system_settings WHERE key = $1", "pricing")
	
	if err == sql.ErrNoRows {
		// Provide a default if database is not seeded
		valueStr = `{"free": 10, "pro": 100}`
	} else if err != nil {
		http.Error(w, "Pricing configuration error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(valueStr))
}

// AppVersion GET /api/v1/student/system/app-version
func (h *SystemHandler) AppVersion(w http.ResponseWriter, r *http.Request) {
	var valueStr string
	err := h.DB.GetContext(r.Context(), &valueStr, "SELECT value FROM system_settings WHERE key = $1", "app_version")
	
	if err == sql.ErrNoRows {
		// Provide a default if database is not seeded
		valueStr = `{"min_version": "1.0.0", "latest_version": "1.0.0"}`
	} else if err != nil {
		http.Error(w, "App version configuration error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(valueStr))
}
