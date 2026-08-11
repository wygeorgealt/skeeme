package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"

	"skeeme-go/internal/auth"
	"skeeme-go/internal/models"
	"skeeme-go/internal/services"
)

type OAuthHandler struct {
	DB    *sqlx.DB
	Redis *redis.Client
}

type OAuthRequest struct {
	Token        string `json:"token"`
	DeviceName   string `json:"device_name"`
	ReferralCode string `json:"referral_code"`
}

type GoogleUserInfo struct {
	Sub           string `json:"sub"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
}

type OAuthResponse struct {
	User      *models.User   `json:"user"`
	Token     string         `json:"token"`
	Pricing   map[string]any `json:"pricing"`
	IsNewUser bool           `json:"is_new_user"`
}

func (h *OAuthHandler) HandleProvider(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")
	if provider != "google" {
		http.Error(w, "Unsupported provider", http.StatusUnprocessableEntity)
		return
	}

	var req OAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	// Verify Google Token
	userInfoUrl := "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + req.Token
	resp, err := http.Get(userInfoUrl)
	if err != nil || resp.StatusCode != http.StatusOK {
		http.Error(w, "Authentication failed. Invalid or expired token.", http.StatusUnauthorized)
		return
	}
	defer resp.Body.Close()

	var googleUser GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		http.Error(w, "Failed to parse Google user info", http.StatusInternalServerError)
		return
	}

	var user models.User
	var isNewUser bool

	// Try to find by provider + ID first
	err = h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1", provider, googleUser.Sub)
	
	if err != nil {
		// Try to find by email
		err = h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE email = $1 LIMIT 1", googleUser.Email)
		
		if err == nil {
			// User found by email, link social provider
			if user.Role.Valid && user.Role.String != "student" {
				http.Error(w, "You do not have permission to access the student portal.", http.StatusForbidden)
				return
			}
			if user.Status != "active" {
				http.Error(w, "Your account is "+user.Status+". Please contact support.", http.StatusForbidden)
				return
			}

			if !user.Provider.Valid || user.Provider.String == "" {
				_, _ = h.DB.ExecContext(r.Context(), "UPDATE users SET provider = $1, provider_id = $2, avatar = $3 WHERE id = $4", 
					provider, googleUser.Sub, googleUser.Picture, user.ID)
			}
		} else {
			// Create new user
			isNewUser = true

			firstName := googleUser.GivenName
			lastName := googleUser.FamilyName
			fullName := googleUser.Name
			
			if fullName == "" {
				fullName = "Student"
			}

			// Generate random password
			rand.Seed(time.Now().UnixNano())
			randomPassword := fmt.Sprintf("%x", rand.Int63())
			hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
			
			refCode := fmt.Sprintf("%06X", rand.Intn(0xFFFFFF))
			role := "student"

			query := `
				INSERT INTO users (
					name, first_name, last_name, email, password, role, status, 
					credits, provider, provider_id, avatar, referral_code, 
					email_verified_at, approved_at, created_at, updated_at
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW(), NOW()) RETURNING *
			`
			
			err = h.DB.QueryRowxContext(r.Context(), query, 
				fullName, firstName, lastName, googleUser.Email, string(hashedPassword), 
				&role, "active", 100, provider, googleUser.Sub, googleUser.Picture, refCode,
			).StructScan(&user)

			if err != nil {
				http.Error(w, "Failed to create user", http.StatusInternalServerError)
				return
			}

			// Log initial credits
			h.DB.ExecContext(r.Context(), `
				INSERT INTO transactions (user_id, type, amount, description, metadata, created_at, updated_at) 
				VALUES ($1, 'reward', 100, 'Welcome bonus: Free tier signup credits', '{"source":"signup"}', NOW(), NOW())
			`, user.ID)

			// Process referral if provided
			if req.ReferralCode != "" {
				// We need a referral service, but for now we skip or just add a TODO
				// TODO: Call referral redemption logic
			}

			// Send welcome email
			emailService := services.NewEmailService()
			go emailService.SendWelcome(user.Email, user.Name)
		}
	} else {
		// User found by provider ID
		if user.Role.Valid && user.Role.String != "student" {
			http.Error(w, "You do not have permission to access the student portal.", http.StatusForbidden)
			return
		}
		if user.Status != "active" {
			http.Error(w, "Your account is "+user.Status+". Please contact support.", http.StatusForbidden)
			return
		}
	}

	if req.DeviceName == "" {
		req.DeviceName = "mobile_app"
	}

	token, err := auth.GenerateSanctumToken(h.DB, user.ID, req.DeviceName)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	var pricingStr string
	var pricing map[string]any
	h.DB.GetContext(r.Context(), &pricingStr, "SELECT value FROM system_settings WHERE key = $1", "pricing")
	if pricingStr != "" {
		json.Unmarshal([]byte(pricingStr), &pricing)
	}

	user.PopulateTransientFields(r.Context(), h.Redis)

	res := OAuthResponse{
		User:      &user,
		Token:     token,
		Pricing:   pricing,
		IsNewUser: isNewUser,
	}

	w.Header().Set("Content-Type", "application/json")
	if isNewUser {
		w.WriteHeader(http.StatusCreated)
	} else {
		w.WriteHeader(http.StatusOK)
	}
	json.NewEncoder(w).Encode(res)
}
