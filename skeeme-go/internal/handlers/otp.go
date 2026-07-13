package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
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
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Generate 6 digit OTP
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	// Ensure we match Laravel's cache key pattern if they share Redis during migration
	key := fmt.Sprintf("otp_token_%s", req.Email)

	// Store in Redis with 10 min expiry
	err := h.Redis.Set(r.Context(), key, code, 10*time.Minute).Err()
	if err != nil {
		http.Error(w, "Could not store OTP", http.StatusInternalServerError)
		return
	}

	// TODO: Trigger email via Resend API
	fmt.Printf("Mock Email Sent to %s: OTP is %s\n", req.Email, code)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"OTP sent successfully"}`))
}

func (h *OtpHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var req OtpVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("otp_token_%s", req.Email)
	val, err := h.Redis.Get(r.Context(), key).Result()
	
	if err == redis.Nil || val != req.Code {
		http.Error(w, "Invalid or expired OTP", http.StatusUnauthorized)
		return
	} else if err != nil {
		http.Error(w, "Error verifying OTP", http.StatusInternalServerError)
		return
	}

	// OTP is valid, delete from redis to prevent reuse
	h.Redis.Del(r.Context(), key)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"OTP verified"}`))
}

func (h *OtpHandler) Resend(w http.ResponseWriter, r *http.Request) {
	h.Send(w, r)
}
