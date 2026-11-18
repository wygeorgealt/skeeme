package handlers

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"math/big"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	appleIssuer  = "https://appleid.apple.com"
	appleKeysURL = "https://appleid.apple.com/auth/keys"
)

var errAppleKeysUnavailable = errors.New("Apple signing keys unavailable")

var appleKeyCache = struct {
	sync.Mutex
	keys        map[string]*rsa.PublicKey
	expiresAt   time.Time
	lastRefresh time.Time
}{}

type appleIdentityClaims struct {
	Subject       string
	Email         string
	EmailVerified bool
}

type appleJWK struct {
	KeyID     string `json:"kid"`
	KeyType   string `json:"kty"`
	Algorithm string `json:"alg"`
	Use       string `json:"use"`
	Modulus   string `json:"n"`
	Exponent  string `json:"e"`
}

func appleClientIDs() []string {
	ids := make([]string, 0)
	for _, id := range strings.Split(os.Getenv("APPLE_CLIENT_IDS"), ",") {
		if id = strings.TrimSpace(id); id != "" {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		ids = append(ids, "com.skeeme.app")
	}
	return ids
}

func verifyAppleIdentityToken(ctx context.Context, token string, audiences []string) (appleIdentityClaims, error) {
	keyID, err := appleTokenKeyID(token)
	if err != nil {
		return appleIdentityClaims{}, err
	}

	keys, err := getAppleSigningKeys(ctx, false)
	if err != nil {
		return appleIdentityClaims{}, err
	}
	if keys[keyID] == nil {
		keys, err = getAppleSigningKeys(ctx, true)
		if err != nil {
			return appleIdentityClaims{}, err
		}
	}
	return verifyAppleIdentityTokenWithKeys(token, audiences, keys, time.Now())
}

func appleTokenKeyID(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", errors.New("malformed Apple identity token")
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", errors.New("malformed Apple identity token header")
	}
	var header struct {
		Algorithm string `json:"alg"`
		KeyID     string `json:"kid"`
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil ||
		header.Algorithm != "RS256" || header.KeyID == "" {
		return "", errors.New("unsupported Apple identity token header")
	}
	return header.KeyID, nil
}

func verifyAppleIdentityTokenWithKeys(
	token string,
	audiences []string,
	keys map[string]*rsa.PublicKey,
	now time.Time,
) (appleIdentityClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return appleIdentityClaims{}, errors.New("malformed Apple identity token")
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return appleIdentityClaims{}, errors.New("malformed Apple identity token header")
	}
	var header struct {
		Algorithm string `json:"alg"`
		KeyID     string `json:"kid"`
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil ||
		header.Algorithm != "RS256" || header.KeyID == "" {
		return appleIdentityClaims{}, errors.New("unsupported Apple identity token header")
	}

	key := keys[header.KeyID]
	if key == nil {
		return appleIdentityClaims{}, errors.New("unknown Apple signing key")
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return appleIdentityClaims{}, errors.New("malformed Apple identity token signature")
	}
	digest := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	if err := rsa.VerifyPKCS1v15(key, crypto.SHA256, digest[:], signature); err != nil {
		return appleIdentityClaims{}, errors.New("invalid Apple identity token signature")
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return appleIdentityClaims{}, errors.New("malformed Apple identity token claims")
	}
	var claims map[string]any
	decoder := json.NewDecoder(strings.NewReader(string(payload)))
	decoder.UseNumber()
	if err := decoder.Decode(&claims); err != nil {
		return appleIdentityClaims{}, errors.New("malformed Apple identity token claims")
	}

	issuer, _ := claims["iss"].(string)
	subject, _ := claims["sub"].(string)
	if issuer != appleIssuer || subject == "" {
		return appleIdentityClaims{}, errors.New("invalid Apple identity token issuer or subject")
	}
	if !appleAudienceMatches(claims["aud"], audiences) {
		return appleIdentityClaims{}, errors.New("invalid Apple identity token audience")
	}

	expiry, ok := appleNumericDate(claims["exp"])
	if !ok || expiry <= now.Unix() {
		return appleIdentityClaims{}, errors.New("expired Apple identity token")
	}
	issuedAt, ok := appleNumericDate(claims["iat"])
	if !ok || issuedAt > now.Add(5*time.Minute).Unix() {
		return appleIdentityClaims{}, errors.New("invalid Apple identity token issue time")
	}
	if notBefore, exists := claims["nbf"]; exists {
		value, valid := appleNumericDate(notBefore)
		if !valid || value > now.Unix() {
			return appleIdentityClaims{}, errors.New("Apple identity token is not yet valid")
		}
	}

	email, _ := claims["email"].(string)
	emailVerified := appleBooleanClaim(claims["email_verified"])
	if email != "" && !emailVerified {
		return appleIdentityClaims{}, errors.New("Apple email is not verified")
	}

	return appleIdentityClaims{
		Subject:       subject,
		Email:         email,
		EmailVerified: emailVerified,
	}, nil
}

func appleAudienceMatches(value any, allowed []string) bool {
	values := make([]string, 0, 1)
	switch audience := value.(type) {
	case string:
		values = append(values, audience)
	case []any:
		for _, item := range audience {
			if id, ok := item.(string); ok {
				values = append(values, id)
			}
		}
	default:
		return false
	}

	for _, candidate := range values {
		for _, permitted := range allowed {
			if candidate == permitted && permitted != "" {
				return true
			}
		}
	}
	return false
}

func appleNumericDate(value any) (int64, bool) {
	number, ok := value.(json.Number)
	if !ok {
		return 0, false
	}
	parsed, err := strconv.ParseInt(number.String(), 10, 64)
	return parsed, err == nil
}

func appleBooleanClaim(value any) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case string:
		return typed == "true"
	default:
		return false
	}
}

func getAppleSigningKeys(ctx context.Context, forceRefresh bool) (map[string]*rsa.PublicKey, error) {
	now := time.Now()
	appleKeyCache.Lock()
	if !forceRefresh && now.Before(appleKeyCache.expiresAt) {
		keys := appleKeyCache.keys
		appleKeyCache.Unlock()
		return keys, nil
	}
	if forceRefresh && now.Sub(appleKeyCache.lastRefresh) < 30*time.Second && now.Before(appleKeyCache.expiresAt) {
		keys := appleKeyCache.keys
		appleKeyCache.Unlock()
		return keys, nil
	}
	appleKeyCache.lastRefresh = now
	appleKeyCache.Unlock()

	requestCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(requestCtx, http.MethodGet, appleKeysURL, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", errAppleKeysUnavailable, err)
	}
	response, err := (&http.Client{Timeout: 5 * time.Second}).Do(request)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", errAppleKeysUnavailable, err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%w: Apple returned HTTP %d", errAppleKeysUnavailable, response.StatusCode)
	}

	var document struct {
		Keys []appleJWK `json:"keys"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&document); err != nil {
		return nil, fmt.Errorf("%w: %v", errAppleKeysUnavailable, err)
	}

	keys := make(map[string]*rsa.PublicKey, len(document.Keys))
	for _, item := range document.Keys {
		if item.KeyType != "RSA" || item.Algorithm != "RS256" ||
			(item.Use != "" && item.Use != "sig") || item.KeyID == "" {
			continue
		}
		key, err := appleRSAKey(item)
		if err == nil {
			keys[item.KeyID] = key
		}
	}
	if len(keys) == 0 {
		return nil, fmt.Errorf("%w: no usable signing keys", errAppleKeysUnavailable)
	}

	ttl := appleKeyCacheDuration(response.Header.Get("Cache-Control"))
	appleKeyCache.Lock()
	appleKeyCache.keys = keys
	appleKeyCache.expiresAt = time.Now().Add(ttl)
	appleKeyCache.Unlock()
	return keys, nil
}

func appleKeyCacheDuration(cacheControl string) time.Duration {
	for _, directive := range strings.Split(cacheControl, ",") {
		key, value, found := strings.Cut(strings.TrimSpace(directive), "=")
		if !found || key != "max-age" {
			continue
		}
		seconds, err := strconv.Atoi(strings.Trim(value, `"`))
		if err == nil && seconds > 0 {
			return min(time.Duration(seconds)*time.Second, 24*time.Hour)
		}
	}
	return time.Hour
}

func appleRSAKey(item appleJWK) (*rsa.PublicKey, error) {
	modulusBytes, err := base64.RawURLEncoding.DecodeString(item.Modulus)
	if err != nil || len(modulusBytes) == 0 {
		return nil, errors.New("invalid Apple RSA modulus")
	}
	exponentBytes, err := base64.RawURLEncoding.DecodeString(item.Exponent)
	if err != nil || len(exponentBytes) == 0 {
		return nil, errors.New("invalid Apple RSA exponent")
	}
	var exponent uint64
	for _, value := range exponentBytes {
		if exponent > math.MaxInt32>>8 {
			return nil, errors.New("Apple RSA exponent is too large")
		}
		exponent = exponent<<8 | uint64(value)
	}
	if exponent < 3 || exponent%2 == 0 {
		return nil, errors.New("invalid Apple RSA exponent")
	}
	return &rsa.PublicKey{N: new(big.Int).SetBytes(modulusBytes), E: int(exponent)}, nil
}
