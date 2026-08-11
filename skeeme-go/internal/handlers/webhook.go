package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

type WebhookHandler struct {
	DB *sqlx.DB
}

func (h *WebhookHandler) Paystack(w http.ResponseWriter, r *http.Request) {
	// In a real app, verify Paystack signature here
	
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	var event map[string]interface{}
	if err := json.Unmarshal(body, &event); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Just log it or acknowledge it for now
	w.WriteHeader(http.StatusOK)
}

func (h *WebhookHandler) RevenueCat(w http.ResponseWriter, r *http.Request) {
	// In a real app, verify RevenueCat webhook signature here
	
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	var event map[string]interface{}
	if err := json.Unmarshal(body, &event); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	eventData, ok := event["event"].(map[string]interface{})
	if ok {
		eventType, _ := eventData["type"].(string)
		appUserIDStr, _ := eventData["app_user_id"].(string)
		
		// Map appUserID back to local user.ID
		var userID int64
		err := h.DB.Get(&userID, "SELECT id FROM users WHERE id::text = $1 OR rc_app_user_id = $1 LIMIT 1", appUserIDStr)
		
		if err == nil {
			switch eventType {
			case "INITIAL_PURCHASE", "RENEWAL", "NON_RENEWING_PURCHASE":
				// Determine tier based on entitlements
				tier := "free"
				if entitlements, ok := eventData["entitlement_ids"].([]interface{}); ok {
					for _, e := range entitlements {
						if eStr, _ := e.(string); eStr == "pro" {
							tier = "pro"
							break
						}
					}
				}
				h.DB.Exec("UPDATE users SET subscription_tier = $1 WHERE id = $2", tier, userID)
			case "EXPIRATION", "CANCELLATION", "BILLING_ISSUE":
				// Downgrade to free
				h.DB.Exec("UPDATE users SET subscription_tier = 'free' WHERE id = $1", userID)
			}
			
			// Optional: log transaction
			h.DB.Exec(`
				INSERT INTO transactions (user_id, type, amount, description, metadata, created_at, updated_at) 
				VALUES ($1, 'subscription', 0, $2, $3, NOW(), NOW())
			`, userID, "RevenueCat event: "+eventType, string(body))
		} else {
			log.Printf("RevenueCat webhook: User not found for app_user_id %s", appUserIDStr)
		}
	}

	w.WriteHeader(http.StatusOK)
}
