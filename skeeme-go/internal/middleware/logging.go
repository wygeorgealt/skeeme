package middleware

import (
	"net/http"
	"time"
	"skeeme-go/internal/logger"
)

type responseWriter struct {
	http.ResponseWriter
	status      int
	written     int64
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	n, err := rw.ResponseWriter.Write(b)
	rw.written += int64(n)
	return n, err
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		rw := &responseWriter{
			ResponseWriter: w,
			status:         200,
		}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)
		
		level := "info"
		if rw.status >= 500 {
			level = "error"
		} else if rw.status >= 400 {
			level = "warn"
		} else if rw.status >= 200 && rw.status < 300 {
			level = "success"
		}

		logger.Send(level, r.Method+" "+r.URL.Path, map[string]any{
			"status":   rw.status,
			"duration": duration.String(),
			"ip":       r.RemoteAddr,
			"bytes":    rw.written,
		})
	})
}
