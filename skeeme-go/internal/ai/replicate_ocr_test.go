package ai

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestReplicateOCRExtractText(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != replicatePredictionPath {
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer test-token" {
			t.Fatalf("unexpected authorization header %q", got)
		}
		if got := r.Header.Get("Prefer"); got != "wait=60" {
			t.Fatalf("unexpected Prefer header %q", got)
		}

		var payload replicatePredictionRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		if payload.Version != replicateModelVersion {
			t.Errorf("unexpected model version %q", payload.Version)
		}
		if payload.Input.Image != "data:image/png;base64,aGVsbG8=" {
			t.Errorf("unexpected image input %q", payload.Input.Image)
		}
		if payload.Input.TaskType != "Free OCR" {
			t.Errorf("unexpected OCR task %q", payload.Input.TaskType)
		}
		if payload.Input.ResolutionSize != "Gundam (Recommended)" {
			t.Errorf("unexpected resolution %q", payload.Input.ResolutionSize)
		}

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":"prediction-id","status":"successful","output":"Recognized words"}`))
	}))
	defer server.Close()

	client := NewReplicateOCRClient("test-token")
	client.baseURL = server.URL
	client.httpClient = server.Client()

	image := "data:image/png;base64," + base64.StdEncoding.EncodeToString([]byte("hello"))
	got, err := client.ExtractText(context.Background(), image)
	if err != nil {
		t.Fatalf("ExtractText returned error: %v", err)
	}
	if got != "Recognized words" {
		t.Fatalf("got %q, want recognized OCR text", got)
	}
}

func TestReplicateOCRPollsRunningPrediction(t *testing.T) {
	requests := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.Header().Set("Content-Type", "application/json")
		if requests == 1 {
			_, _ = w.Write([]byte(`{"id":"prediction-id","status":"starting"}`))
			return
		}
		if r.Method != http.MethodGet || r.URL.Path != "/v1/predictions/prediction-id" {
			t.Fatalf("unexpected polling request: %s %s", r.Method, r.URL.Path)
		}
		_, _ = w.Write([]byte(`{"id":"prediction-id","status":"succeeded","output":"Polled OCR text"}`))
	}))
	defer server.Close()

	client := NewReplicateOCRClient("test-token")
	client.baseURL = server.URL
	client.httpClient = server.Client()

	got, err := client.ExtractText(context.Background(), base64.StdEncoding.EncodeToString([]byte("image")))
	if err != nil {
		t.Fatalf("ExtractText returned error: %v", err)
	}
	if got != "Polled OCR text" {
		t.Fatalf("got %q, want polled OCR text", got)
	}
	if requests != 2 {
		t.Fatalf("got %d requests, want create and one poll", requests)
	}
}

func TestNewOCRClientPrefersReplicate(t *testing.T) {
	client := NewOCRClient("replicate-token", "google-key")
	if _, ok := client.(*ReplicateOCRClient); !ok {
		t.Fatalf("expected Replicate OCR client, got %T", client)
	}
	if client := NewOCRClient("", "google-key"); client == nil {
		t.Fatal("expected Google Vision fallback client")
	}
	if client := NewOCRClient("", ""); client != nil {
		t.Fatalf("expected nil OCR client without credentials, got %T", client)
	}
}

func TestReplicateOCRRejectsInvalidImage(t *testing.T) {
	client := NewReplicateOCRClient("test-token")
	_, err := client.ExtractText(context.Background(), "not base64")
	if err == nil || !strings.Contains(err.Error(), "invalid base64 image") {
		t.Fatalf("expected invalid base64 error, got %v", err)
	}
}

func TestReplicateOCRUploadsLargeInputFile(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/v1/files" {
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer test-token" {
			t.Fatalf("unexpected authorization header %q", got)
		}
		if err := r.ParseMultipartForm(1 << 20); err != nil {
			t.Fatalf("parse multipart file: %v", err)
		}
		file, header, err := r.FormFile("content")
		if err != nil {
			t.Fatalf("read uploaded file: %v", err)
		}
		defer file.Close()
		if header.Filename != "scan.png" {
			t.Errorf("got filename %q, want scan.png", header.Filename)
		}
		if got := r.FormValue("type"); got != "image/png" {
			t.Errorf("got media type %q, want image/png", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"urls":{"get":"https://replicate.delivery/test.png"}}`))
	}))
	defer server.Close()

	client := NewReplicateOCRClient("test-token")
	client.baseURL = server.URL
	client.httpClient = server.Client()
	got, err := client.uploadInputFile(context.Background(), "image/png", []byte("image bytes"))
	if err != nil {
		t.Fatalf("uploadInputFile returned error: %v", err)
	}
	if got != "https://replicate.delivery/test.png" {
		t.Fatalf("got URL %q", got)
	}
}
