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
	"golang.org/x/crypto/bcrypt"

	"skeeme-go/internal/auth"
	"skeeme-go/internal/middleware"
	"skeeme-go/internal/models"
	"skeeme-go/internal/services"
)

type AuthHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Device   string `json:"device_name"`
}

type AuthResponse struct {
	User    *models.User   `json:"user"`
	Token   string         `json:"token"`
	Pricing map[string]any `json:"pricing"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var user models.User
	err := h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE email = $1 LIMIT 1", req.Email)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if user.Role.Valid && user.Role.String != "student" {
		http.Error(w, "You do not have permission to access the student portal.", http.StatusForbidden)
		return
	}

	if user.Status != "active" {
		http.Error(w, "Your account is "+user.Status+". Please contact support.", http.StatusForbidden)
		return
	}

	if req.Device == "" {
		req.Device = "mobile_app"
	}

	token, err := auth.GenerateSanctumToken(h.DB, user.ID, req.Device)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	// Fetch pricing to include in login response
	var pricingStr string
	var pricing map[string]any
	h.DB.GetContext(r.Context(), &pricingStr, "SELECT value FROM system_settings WHERE key = $1", "pricing")
	if pricingStr != "" {
		json.Unmarshal([]byte(pricingStr), &pricing)
	}

	user.PopulateTransientFields(r.Context(), h.Redis)

	res := AuthResponse{
		User:    &user,
		Token:   token,
		Pricing: pricing,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user != nil {
		// Delete all tokens for this user for security
		h.DB.ExecContext(r.Context(), "DELETE FROM personal_access_tokens WHERE tokenable_id = $1", user.ID)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Logged out successfully"}`))
}

type RegisterRequest struct {
	Name           string `json:"name"`
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Device         string `json:"device_name"`
	EducationLevel string `json:"education_level"`
	FieldOfStudy   string `json:"field_of_study"`
	LearningStyle  string `json:"learning_style"`
	ReferralCode   string `json:"referral_code"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	var count int
	h.DB.GetContext(r.Context(), &count, "SELECT count(*) FROM users WHERE email = $1", req.Email)
	if count > 0 {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}

	firstName := req.FirstName
	lastName := req.LastName
	fullName := req.Name
	if fullName == "" {
		fullName = strings.TrimSpace(firstName + " " + lastName)
	} else if firstName == "" {
		parts := strings.SplitN(fullName, " ", 2)
		firstName = parts[0]
		if len(parts) > 1 {
			lastName = parts[1]
		}
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	
	rand.Seed(time.Now().UnixNano())
	refCode := fmt.Sprintf("%06X", rand.Intn(0xFFFFFF))

	aiPrefs := map[string]string{
		"education_level": req.EducationLevel,
		"field_of_study":  req.FieldOfStudy,
		"learning_style":  req.LearningStyle,
		"tone":            "encouraging",
		"language":        "english",
	}
	aiPrefsJSON, _ := json.Marshal(aiPrefs)
	role := "student"

	var userID int64
	query := `
		INSERT INTO users (
			name, first_name, last_name, email, password, role, status, 
			credits, referral_code, ai_preferences, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id
	`
	err := h.DB.QueryRowContext(r.Context(), query, 
		fullName, firstName, lastName, req.Email, string(hashedPassword), 
		&role, "pending", 100, refCode, aiPrefsJSON,
	).Scan(&userID)

	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	h.DB.ExecContext(r.Context(), `
		INSERT INTO transactions (user_id, type, amount, description, metadata, created_at, updated_at) 
		VALUES ($1, 'reward', 100, 'Welcome bonus: Free tier signup credits', '{"source":"signup"}', NOW(), NOW())
	`, userID)

	if req.ReferralCode != "" {
		h.Redis.Set(r.Context(), fmt.Sprintf("pending_referral_%d", userID), req.ReferralCode, 24*time.Hour)
	}

	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	h.Redis.Set(r.Context(), fmt.Sprintf("otp_token_%s", req.Email), code, 10*time.Minute)
	
	emailService := services.NewEmailService()
	emailService.SendOTP(req.Email, code, "verification")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message": "Registration successful. Please verify your email.", "email": "` + req.Email + `"}`))
}

type VerifyAccountRequest struct {
	Email string `json:"email"`
}

func (h *AuthHandler) VerifyAccount(w http.ResponseWriter, r *http.Request) {
	var req VerifyAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var user models.User
	err := h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE email = $1 LIMIT 1", req.Email)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.Status == "active" {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message": "Account already verified"}`))
		return
	}

	_, err = h.DB.ExecContext(r.Context(), "UPDATE users SET status = 'active', email_verified_at = NOW(), approved_at = NOW() WHERE id = $1", user.ID)
	if err != nil {
		http.Error(w, "Failed to verify account", http.StatusInternalServerError)
		return
	}

	emailService := services.NewEmailService()
	emailService.SendWelcome(user.Email, user.Name)

	token, _ := auth.GenerateSanctumToken(h.DB, user.ID, "mobile_app")

	user.PopulateTransientFields(r.Context(), h.Redis)

	res := AuthResponse{
		User:  &user,
		Token: token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

type ResetPasswordRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	
	res, err := h.DB.ExecContext(r.Context(), "UPDATE users SET password = $1 WHERE email = $2", hashedPassword, req.Email)
	if err != nil {
		http.Error(w, "Failed to reset password", http.StatusInternalServerError)
		return
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Password reset successfully"}`))
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	user.PopulateTransientFields(r.Context(), h.Redis)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
