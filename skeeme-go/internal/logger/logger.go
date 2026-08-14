package logger

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type LogEntry struct {
	Service   string `json:"service"`
	Level     string `json:"level"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
	Data      any    `json:"data,omitempty"`
}

var ingestURL = "http://localhost:4000/ingest"

// Send is a non-blocking logger that sends logs to the central dashboard
func Send(level, message string, data any) {
	// Log to local console first
	if level == "error" {
		log.Printf("[ERROR] %s | %v\n", message, data)
	} else {
		log.Printf("[%s] %s\n", level, message)
	}

	entry := LogEntry{
		Service:   "skeeme-go",
		Level:     level,
		Message:   message,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Data:      data,
	}

	payload, err := json.Marshal(entry)
	if err != nil {
		return
	}

	// Fire and forget
	go func() {
		client := http.Client{Timeout: 2 * time.Second}
		resp, err := client.Post(ingestURL, "application/json", bytes.NewBuffer(payload))
		if err == nil {
			resp.Body.Close()
		}
	}()
}

func Info(message string, data any) {
	Send("info", message, data)
}

func Warn(message string, data any) {
	Send("warn", message, data)
}

func Error(message string, data any) {
	Send("error", message, data)
}

func Success(message string, data any) {
	Send("success", message, data)
}
