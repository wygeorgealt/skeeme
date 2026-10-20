package middleware

import (
	"fmt"
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

func (rw *responseWriter) Flush() {
	if flusher, ok := rw.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

func (rw *responseWriter) Unwrap() http.ResponseWriter {
	return rw.ResponseWriter
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

		uri := r.URL.RequestURI()
		if uri == "" {
			uri = r.URL.Path
		}

		msg := fmt.Sprintf("%s %s [%d] in %v (%d bytes)", r.Method, uri, rw.status, duration.Round(time.Millisecond), rw.written)

		logger.Send(level, msg, map[string]any{
			"method":   r.Method,
			"uri":      uri,
			"status":   rw.status,
			"duration": duration.String(),
			"ip":       r.RemoteAddr,
			"bytes":    rw.written,
		})
	})
}
