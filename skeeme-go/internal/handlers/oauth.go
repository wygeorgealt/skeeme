package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
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
	FirstName    string `json:"first_name"`
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
	if provider != "google" && provider != "apple" {
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

	var (
		subject    string
		name       string
		firstName  string
		lastName   string
		picture    string
		email      string
		emailValid = true
	)
	if provider == "google" {
		request, err := http.NewRequestWithContext(
			r.Context(),
			http.MethodGet,
			"https://www.googleapis.com/oauth2/v3/userinfo",
			nil,
		)
		if err != nil {
			http.Error(w, "Could not verify Google credentials.", http.StatusInternalServerError)
			return
		}
		request.Header.Set("Authorization", "Bearer "+req.Token)
		response, err := (&http.Client{Timeout: 10 * time.Second}).Do(request)
		if err != nil {
			http.Error(w, "Google authentication is temporarily unavailable.", http.StatusServiceUnavailable)
			return
		}
		defer response.Body.Close()
		if response.StatusCode != http.StatusOK {
			http.Error(w, "Authentication failed. Invalid or expired token.", http.StatusUnauthorized)
			return
		}

		var googleUser GoogleUserInfo
		if err := json.NewDecoder(response.Body).Decode(&googleUser); err != nil {
			http.Error(w, "Failed to parse Google user info", http.StatusInternalServerError)
			return
		}
		if googleUser.Sub == "" || googleUser.Email == "" || !googleUser.EmailVerified {
			http.Error(w, "Google did not provide a verified email.", http.StatusUnauthorized)
			return
		}
		subject = googleUser.Sub
		name = googleUser.Name
		firstName = googleUser.GivenName
		if firstName == "" {
			firstName = strings.TrimSpace(req.FirstName)
		}
		lastName = googleUser.FamilyName
		picture = googleUser.Picture
		email = googleUser.Email
	} else {
		claims, err := verifyAppleIdentityToken(r.Context(), req.Token, appleClientIDs())
		if err != nil {
			if errors.Is(err, errAppleKeysUnavailable) {
				http.Error(w, "Apple authentication is temporarily unavailable.", http.StatusServiceUnavailable)
			} else {
				http.Error(w, "Authentication failed. Invalid or expired token.", http.StatusUnauthorized)
			}
			return
		}
		subject = claims.Subject
		email = claims.Email
		emailValid = claims.EmailVerified
		firstName = strings.TrimSpace(req.FirstName)
	}

	var user models.User
	var isNewUser bool

	// Try to find by provider + ID first
	err := h.DB.GetContext(
		r.Context(),
		&user,
		"SELECT * FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1",
		provider,
		subject,
	)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		http.Error(w, "Could not look up your account.", http.StatusInternalServerError)
		return
	}

	if errors.Is(err, sql.ErrNoRows) {
		if email == "" || !emailValid {
			http.Error(w, "Apple did not provide a verified email for this account.", http.StatusUnauthorized)
			return
		}

		err = h.DB.GetContext(r.Context(), &user, "SELECT * FROM users WHERE email = $1 LIMIT 1", email)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Could not look up your account.", http.StatusInternalServerError)
			return
		}
		if err == nil {
			if user.Role.Valid && user.Role.String != "student" {
				http.Error(w, "You do not have permission to access the student portal.", http.StatusForbidden)
				return
			}
			if user.Status != "active" {
				http.Error(w, "Your account is "+user.Status+". Please contact support.", http.StatusForbidden)
				return
			}

			if !user.Provider.Valid || user.Provider.String == "" {
				_, err = h.DB.ExecContext(
					r.Context(),
					"UPDATE users SET provider = $1, provider_id = $2, avatar = $3 WHERE id = $4",
					provider,
					subject,
					nullIfEmpty(picture),
					user.ID,
				)
				if err != nil {
					http.Error(w, "Could not link your account.", http.StatusInternalServerError)
					return
				}
			}
		} else {
			isNewUser = true
			fullName := strings.TrimSpace(name)
			if fullName == "" {
				fullName = strings.TrimSpace(firstName + " " + lastName)
			}
			if fullName == "" {
				fullName = "Student"
			}

			passwordBytes := make([]byte, 32)
			if _, err := rand.Read(passwordBytes); err != nil {
				http.Error(w, "Could not create your account.", http.StatusInternalServerError)
				return
			}
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(hex.EncodeToString(passwordBytes)), bcrypt.DefaultCost)
			if err != nil {
				http.Error(w, "Could not create your account.", http.StatusInternalServerError)
				return
			}
			referralBytes := make([]byte, 3)
			if _, err := rand.Read(referralBytes); err != nil {
				http.Error(w, "Could not create your account.", http.StatusInternalServerError)
				return
			}
			refCode := strings.ToUpper(hex.EncodeToString(referralBytes))
			role := "student"

			query := `
				INSERT INTO users (
					name, first_name, last_name, email, password, role, status,
					provider, provider_id, avatar, referral_code,
					email_verified_at, approved_at, created_at, updated_at
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), NOW(), NOW()) RETURNING *
			`
			err = h.DB.QueryRowxContext(
				r.Context(),
				query,
				fullName,
				firstName,
				lastName,
				email,
				string(hashedPassword),
				role,
				"active",
				provider,
				subject,
				nullIfEmpty(picture),
				refCode,
			).StructScan(&user)
			if err != nil {
				http.Error(w, "Failed to create user", http.StatusInternalServerError)
				return
			}

			emailService := services.NewEmailService()
			go emailService.SendWelcome(user.Email, user.Name)
		}
	} else {
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

func nullIfEmpty(value string) any {
	if value == "" {
		return nil
	}
	return value
}
