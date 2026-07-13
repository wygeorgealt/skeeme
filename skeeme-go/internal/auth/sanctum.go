package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"skeeme-go/internal/models"
)

func ValidateSanctumToken(ctx context.Context, db *sqlx.DB, bearer string) (*models.User, error) {
	// Bearer is usually "id|plaintext_token"
	parts := strings.Split(bearer, "|")
	var plainToken string

	if len(parts) == 2 {
		plainToken = parts[1]
	} else if len(parts) == 1 {
		plainToken = parts[0]
	} else {
		return nil, errors.New("invalid token format")
	}

	// Hash the plaintext token
	hasher := sha256.New()
	hasher.Write([]byte(plainToken))
	hashedToken := hex.EncodeToString(hasher.Sum(nil))

	// Find the token in DB
	var pat models.PersonalAccessToken
	err := db.GetContext(ctx, &pat, "SELECT * FROM personal_access_tokens WHERE token = $1 LIMIT 1", hashedToken)
	if err != nil {
		return nil, errors.New("invalid token")
	}

	// Update last_used_at (fire and forget to not block auth)
	go func(id int64) {
		// In a real app we'd want to use a separate background context or worker pool.
		// For now we'll just execute it and ignore errors.
		_, _ = db.Exec("UPDATE personal_access_tokens SET last_used_at = NOW() WHERE id = $1", id)
	}(pat.ID)

	// Get User
	var user models.User
	err = db.GetContext(ctx, &user, "SELECT * FROM users WHERE id = $1 LIMIT 1", pat.TokenableID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return &user, nil
}

func GenerateSanctumToken(db *sqlx.DB, userID int64, deviceName string) (string, error) {
	// Generate 40 characters random string for the plaintext token
	b := make([]byte, 20)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	plainText := hex.EncodeToString(b) // 40 chars

	// Hash the plaintext token
	hasher := sha256.New()
	hasher.Write([]byte(plainText))
	hashedToken := hex.EncodeToString(hasher.Sum(nil))

	// Insert into DB
	query := `
		INSERT INTO personal_access_tokens 
		(tokenable_type, tokenable_id, name, token, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`

	var id int64
	// In Laravel, the morph map might map 'App\Models\User' to 'user' or just use the FQCN. 
	// Usually it's 'App\Models\User' for default Sanctum setup.
	err = db.QueryRow(query, "App\\Models\\User", userID, deviceName, hashedToken).Scan(&id)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%d|%s", id, plainText), nil
}
