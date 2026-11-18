package handlers

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"testing"
	"time"
)

func TestVerifyAppleIdentityTokenWithKeys(t *testing.T) {
	now := time.Unix(1_800_000_000, 0)
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	token := signedAppleTestToken(t, privateKey, map[string]any{
		"iss":            appleIssuer,
		"sub":            "apple-user-123",
		"aud":            []string{"com.skeeme.app", "other.client"},
		"exp":            now.Add(time.Hour).Unix(),
		"iat":            now.Add(-time.Minute).Unix(),
		"email":          "student@example.com",
		"email_verified": "true",
	})
	keys := map[string]*rsa.PublicKey{"test-key": &privateKey.PublicKey}

	claims, err := verifyAppleIdentityTokenWithKeys(token, []string{"com.skeeme.app"}, keys, now)
	if err != nil {
		t.Fatalf("valid identity token rejected: %v", err)
	}
	if claims.Subject != "apple-user-123" || claims.Email != "student@example.com" || !claims.EmailVerified {
		t.Fatalf("unexpected claims: %+v", claims)
	}

	if _, err := verifyAppleIdentityTokenWithKeys(token, []string{"wrong.client"}, keys, now); err == nil {
		t.Fatal("token with the wrong audience was accepted")
	}
	if _, err := verifyAppleIdentityTokenWithKeys(token, []string{"com.skeeme.app"}, nil, now); err == nil {
		t.Fatal("token signed by an unknown key was accepted")
	}
}

func TestVerifyAppleIdentityTokenRejectsExpiredAndUnverifiedEmail(t *testing.T) {
	now := time.Unix(1_800_000_000, 0)
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	keys := map[string]*rsa.PublicKey{"test-key": &privateKey.PublicKey}
	baseClaims := map[string]any{
		"iss": appleIssuer,
		"sub": "apple-user-123",
		"aud": "com.skeeme.app",
		"iat": now.Add(-time.Minute).Unix(),
	}

	expiredClaims := cloneAppleTestClaims(baseClaims)
	expiredClaims["exp"] = now.Add(-time.Minute).Unix()
	expiredToken := signedAppleTestToken(t, privateKey, expiredClaims)
	if _, err := verifyAppleIdentityTokenWithKeys(expiredToken, []string{"com.skeeme.app"}, keys, now); err == nil {
		t.Fatal("expired identity token was accepted")
	}

	unverifiedClaims := cloneAppleTestClaims(baseClaims)
	unverifiedClaims["exp"] = now.Add(time.Hour).Unix()
	unverifiedClaims["email"] = "student@example.com"
	unverifiedClaims["email_verified"] = "false"
	unverifiedToken := signedAppleTestToken(t, privateKey, unverifiedClaims)
	if _, err := verifyAppleIdentityTokenWithKeys(unverifiedToken, []string{"com.skeeme.app"}, keys, now); err == nil {
		t.Fatal("identity token with an unverified email was accepted")
	}
}

func signedAppleTestToken(t *testing.T, privateKey *rsa.PrivateKey, claims map[string]any) string {
	t.Helper()
	header, err := json.Marshal(map[string]string{"alg": "RS256", "kid": "test-key"})
	if err != nil {
		t.Fatal(err)
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		t.Fatal(err)
	}
	unsigned := base64.RawURLEncoding.EncodeToString(header) + "." +
		base64.RawURLEncoding.EncodeToString(payload)
	digest := sha256.Sum256([]byte(unsigned))
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, digest[:])
	if err != nil {
		t.Fatal(err)
	}
	return unsigned + "." + base64.RawURLEncoding.EncodeToString(signature)
}

func cloneAppleTestClaims(claims map[string]any) map[string]any {
	clone := make(map[string]any, len(claims))
	for key, value := range claims {
		clone[key] = value
	}
	return clone
}
