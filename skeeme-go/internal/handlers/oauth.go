package handlers

import (
	"net/http"

	"github.com/jmoiron/sqlx"
)

type OAuthHandler struct {
	DB *sqlx.DB
}

func (h *OAuthHandler) HandleProvider(w http.ResponseWriter, r *http.Request) {
	// provider := chi.URLParam(r, "provider")
	// Verify token from Google/Apple
	w.WriteHeader(http.StatusNotImplemented)
}
