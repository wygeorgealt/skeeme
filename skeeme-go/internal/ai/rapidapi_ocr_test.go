package ai

import (
	"context"
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRapidAPIOCRExtractText(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/parse/image" {
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.Path)
		}
		if got := r.Header.Get("X-RapidAPI-Key"); got != "test-key" {
			t.Fatalf("unexpected RapidAPI key header %q", got)
		}
		if got := r.Header.Get("X-RapidAPI-Host"); got != rapidAPIOCRHost {
			t.Fatalf("unexpected RapidAPI host header %q", got)
		}
		if err := r.ParseMultipartForm(1 << 20); err != nil {
			t.Fatalf("parse multipart form: %v", err)
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			t.Fatalf("read uploaded file: %v", err)
		}
		defer file.Close()
		if header.Filename != "scan.png" {
			t.Errorf("got filename %q, want scan.png", header.Filename)
		}
		if got := r.FormValue("OCREngine"); got != "5" {
			t.Errorf("got OCREngine %q, want 5", got)
		}
		if got := r.FormValue("language"); got != "eng" {
			t.Errorf("got language %q, want eng", got)
		}

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ParsedResults":[{"ParsedText":"recognized OCR text"}],"IsErroredOnProcessing":false}`))
	}))
	defer server.Close()

	client := NewRapidAPIOCRClient("test-key")
	client.endpoint = server.URL + "/parse/image"
	client.httpClient = server.Client()

	image := "data:image/png;base64," + base64.StdEncoding.EncodeToString([]byte("image"))
	got, err := client.ExtractText(context.Background(), image)
	if err != nil {
		t.Fatalf("ExtractText returned error: %v", err)
	}
	if got != "recognized OCR text" {
		t.Fatalf("got %q, want recognized OCR text", got)
	}
}

func TestParseRapidAPIOCRResponse(t *testing.T) {
	tests := []struct {
		name string
		body string
		want string
	}{
		{
			name: "parsed results",
			body: `{"ParsedResults":[{"ParsedText":"first"},{"ParsedText":"second"}]}`,
			want: "first\nsecond",
		},
		{name: "nested data text", body: `{"data":{"text":"recognized"}}`, want: "recognized"},
		{name: "plain text", body: ` recognized text `, want: "recognized text"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := parseRapidAPIOCRResponse([]byte(test.body))
			if err != nil {
				t.Fatalf("parseRapidAPIOCRResponse returned error: %v", err)
			}
			if got != test.want {
				t.Fatalf("got %q, want %q", got, test.want)
			}
		})
	}

	if _, err := parseRapidAPIOCRResponse([]byte(`{}`)); err == nil || !strings.Contains(err.Error(), "did not contain recognized text") {
		t.Fatalf("expected missing recognized text error, got %v", err)
	}
}

func TestRapidAPIOCRRejectsInvalidImage(t *testing.T) {
	client := NewRapidAPIOCRClient("test-key")
	_, err := client.ExtractText(context.Background(), "not base64")
	if err == nil || !strings.Contains(err.Error(), "invalid base64 image") {
		t.Fatalf("expected invalid base64 error, got %v", err)
	}
}
