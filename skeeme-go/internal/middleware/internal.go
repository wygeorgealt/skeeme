package middleware

import (
	"net/http"
)

// InternalAuthMiddleware is a passthrough for internal routes (e.g., from the AI service).
// These routes are only accessible within the private network, so no secret is required.
func InternalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}
