package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid request payload",
		})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))

	var user models.User
	err := h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1", cleanEmail)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid email or password",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid email or password",
		})
		return
	}

	if user.Role.Valid && user.Role.String != "student" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "You do not have permission to access the student portal.",
		})
		return
	}

	if user.Status != "active" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Your account is " + user.Status + ". Please verify your email or contact support.",
		})
		return
	}

	if req.Device == "" {
		req.Device = "mobile_app"
	}

	token, err := auth.GenerateSanctumToken(h.DB, user.ID, req.Device)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Could not generate authentication session",
		})
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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid request payload",
		})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))
	if cleanEmail == "" || req.Password == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Email and password are required",
			"errors": map[string]any{
				"email":    []string{"Email is required."},
				"password": []string{"Password is required."},
			},
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Failed to process password",
		})
		return
	}

	aiPrefs := map[string]string{
		"education_level": req.EducationLevel,
		"field_of_study":  req.FieldOfStudy,
		"learning_style":  req.LearningStyle,
		"tone":            "encouraging",
		"language":        "english",
	}
	aiPrefsJSON, _ := json.Marshal(aiPrefs)

	// Check if user already exists (case-insensitive)
	var existingUser models.User
	err = h.DB.GetContext(r.Context(), &existingUser, "SELECT * FROM users WHERE LOWER(TRIM(email)) = $1", cleanEmail)
	if err == nil {
		// If the user already verified their email or is fully active, reject with clear reason
		if existingUser.Status == "active" && existingUser.EmailVerifiedAt.Valid {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnprocessableEntity)
			json.NewEncoder(w).Encode(map[string]any{
				"message": "An account with this email already exists.",
				"errors": map[string]any{
					"email": []string{"An account with this email already exists. Please log in."},
				},
			})
			return
		}

		// If user was never verified or is still pending: update their credentials and send fresh OTP
		_, updateErr := h.DB.ExecContext(r.Context(), `
			UPDATE users 
			SET password = $1, 
			    name = COALESCE(NULLIF($2, ''), name),
			    ai_preferences = $3,
			    status = 'pending',
			    updated_at = NOW()
			WHERE id = $4
		`, string(hashedPassword), req.Name, aiPrefsJSON, existingUser.ID)

		if updateErr != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{
				"message": fmt.Sprintf("Failed to update pending account: %v", updateErr),
			})
			return
		}

		// Generate and send fresh OTP
		code := fmt.Sprintf("%06d", rand.Intn(1000000))
		h.Redis.Set(r.Context(), fmt.Sprintf("otp_token_%s", cleanEmail), code, 10*time.Minute)

		emailService := services.NewEmailService()
		emailService.SendOTP(cleanEmail, code, "verification")

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Registration successful. Please verify your email.",
			"email":   cleanEmail,
		})
		return
	}

	fullName := req.Name
	firstName := ""
	lastName := ""

	rand.Seed(time.Now().UnixNano())
	refCode := fmt.Sprintf("%06X", rand.Intn(0xFFFFFF))
	role := "student"

	var userID int64
	query := `
		INSERT INTO users (
			name, first_name, last_name, email, password, role, status, 
			credits, referral_code, ai_preferences, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id
	`
	err = h.DB.QueryRowContext(r.Context(), query, 
		fullName, firstName, lastName, cleanEmail, string(hashedPassword), 
		&role, "pending", 100, refCode, aiPrefsJSON,
	).Scan(&userID)

	if err != nil {
		// Catch race condition: another request inserted the same email between our SELECT and INSERT
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnprocessableEntity)
			json.NewEncoder(w).Encode(map[string]any{
				"message": "An account with this email already exists.",
				"errors": map[string]any{
					"email": []string{"An account with this email already exists. Please log in."},
				},
			})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": fmt.Sprintf("Failed to create user account: %v", err),
		})
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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid request payload",
		})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))

	var user models.User
	err := h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1", cleanEmail)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "User account not found.",
		})
		return
	}

	if user.Status == "active" {
		token, _ := auth.GenerateSanctumToken(h.DB, user.ID, "mobile_app")
		user.PopulateTransientFields(r.Context(), h.Redis)

		res := AuthResponse{
			User:  &user,
			Token: token,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
		return
	}

	_, err = h.DB.ExecContext(r.Context(), "UPDATE users SET status = 'active', email_verified_at = NOW(), approved_at = NOW() WHERE id = $1", user.ID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Failed to activate account. Please try again.",
		})
		return
	}

	emailService := services.NewEmailService()
	emailService.SendWelcome(user.Email, user.Name)

	token, _ := auth.GenerateSanctumToken(h.DB, user.ID, "mobile_app")
	user.Status = "active"
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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Invalid request payload",
		})
		return
	}

	cleanEmail := strings.TrimSpace(strings.ToLower(req.Email))
	if cleanEmail == "" || req.Password == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Email and new password are required",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Failed to process password",
		})
		return
	}
	
	// Update password, and if user was pending, mark as active & email verified
	res, err := h.DB.ExecContext(r.Context(), `
		UPDATE users 
		SET password = $1, 
		    status = 'active',
		    email_verified_at = COALESCE(email_verified_at, NOW()),
		    updated_at = NOW() 
		WHERE LOWER(TRIM(email)) = $2
	`, string(hashedPassword), cleanEmail)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Failed to reset password. Please try again.",
		})
		return
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{
			"message": "No account found with this email address.",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"message": "Password reset successfully",
	})
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
