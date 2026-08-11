package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type EmailService struct {
	APIKey string
}

func NewEmailService() *EmailService {
	return &EmailService{
		APIKey: os.Getenv("RESEND_API_KEY"),
	}
}

type ResendPayload struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	Html    string `json:"html"`
}

func (s *EmailService) SendOTP(email, code, otpType string) error {
	subject := "Your Skeeme Verification Code"
	if otpType == "password_reset" {
		subject = "Reset Your Skeeme Password"
	}

	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2>%s</h2>
			<p>Your one-time password is:</p>
			<h1 style="font-size: 32px; letter-spacing: 5px; color: #0072FF;">%s</h1>
			<p>This code will expire in 10 minutes.</p>
			<p>If you didn't request this, you can safely ignore this email.</p>
		</div>
	`, subject, code)

	return s.send(email, subject, html)
}

func (s *EmailService) SendWelcome(email, name string) error {
	subject := "Welcome to Skeeme! 🚀"
	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2>Welcome, %s!</h2>
			<p>We're thrilled to have you on board.</p>
			<p>Skeeme is here to help you study smarter, not harder. Start by uploading a document or generating a quiz!</p>
			<p>Happy studying,<br>The Skeeme Team</p>
		</div>
	`, name)

	return s.send(email, subject, html)
}

func (s *EmailService) send(to, subject, html string) error {
	if s.APIKey == "" {
		// Fallback to console in development
		fmt.Printf("\n--- MOCK EMAIL ---\nTo: %s\nSubject: %s\nBody: %s\n------------------\n", to, subject, html)
		return nil
	}

	payload := ResendPayload{
		From:    "Skeeme <hello@skeeme.com>", // Make sure to use verified domain
		To:      to,
		Subject: subject,
		Html:    html,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("failed to send email via Resend, status: %d", resp.StatusCode)
	}

	return nil
}
