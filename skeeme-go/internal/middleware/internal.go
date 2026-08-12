package middleware

import (
	"net/http"
	"os"
)

// InternalAuthMiddleware protects internal routes (e.g., from Node.js)
func InternalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secret := os.Getenv("INTERNAL_SECRET")
		if secret == "" {
			http.Error(w, "Internal API secret not configured", http.StatusInternalServerError)
			return
		}

		authHeader := r.Header.Get("X-Internal-Secret")
		if authHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if authHeader != secret {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
