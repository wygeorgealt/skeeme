package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"skeeme-go/internal/services"
)

type OtpHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

type OtpRequest struct {
	Email string `json:"email"`
}

type OtpVerifyRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func (h *OtpHandler) Send(w http.ResponseWriter, r *http.Request) {
	var req OtpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid request payload",
		})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))
	if cleanEmail == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Email address is required",
		})
		return
	}

	// Generate 6 digit OTP
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	key := fmt.Sprintf("otp_token_%s", cleanEmail)

	// Store in Redis with 10 min expiry
	err := h.Redis.Set(r.Context(), key, code, 10*time.Minute).Err()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Could not generate OTP code. Please try again.",
		})
		return
	}

	emailService := services.NewEmailService()
	otpType := "verification" 
	
	err = emailService.SendOTP(cleanEmail, code, otpType)
	if err != nil {
		fmt.Printf("Error sending email: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"message": "OTP sent successfully",
	})
}

func (h *OtpHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var req OtpVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid request payload",
		})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))
	key := fmt.Sprintf("otp_token_%s", cleanEmail)
	val, err := h.Redis.Get(r.Context(), key).Result()
	
	if err == redis.Nil || val != strings.TrimSpace(req.Code) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid or expired OTP code. Please check the code or request a new one.",
		})
		return
	} else if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "An error occurred while verifying the code.",
		})
		return
	}

	// OTP is valid, delete from redis to prevent reuse
	h.Redis.Del(r.Context(), key)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"message": "OTP verified successfully",
	})
}

func (h *OtpHandler) Resend(w http.ResponseWriter, r *http.Request) {
	h.Send(w, r)
}
