package middleware

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

// Known malicious scanner IPs (static blocklist)
var defaultBlockedIPs = map[string]bool{
	"45.138.12.44": true,
}

// Known bot/scanner probe paths (common WordPress, Laravel, PHP, and sensitive file probes)
var probePatterns = []string{
	"/livewire",
	"/filament",
	"/nova",
	"/telescope",
	"/horizon",
	"/backpack",
	"/wp-admin",
	"/wp-login",
	"/wp-content",
	"/wp-includes",
	"/phpmyadmin",
	"/pma",
	"/.env",
	"/.git",
	"/eval-stdin.php",
	"/setup",
	"/install",
	"/actuator",
	"/solr",
}

// FirewallMiddleware blocks known malicious IPs and auto-bans scanner bots.
func FirewallMiddleware(rdb *redis.Client) func(http.Handler) http.Handler {
	// Parse BLOCKED_IPS env var (comma-separated)
	envBlocked := map[string]bool{}
	if env := os.Getenv("BLOCKED_IPS"); env != "" {
		for _, ip := range strings.Split(env, ",") {
			cleaned := strings.TrimSpace(ip)
			if cleaned != "" {
				envBlocked[cleaned] = true
			}
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			clientIP := getCleanIP(r)

			// 1. Check Static Blocklist & Env Blocklist
			if defaultBlockedIPs[clientIP] || envBlocked[clientIP] {
				blockRequest(w, clientIP, r.URL.Path, "static blocklist")
				return
			}

			// 2. Check Redis Dynamic Blocklist
			ctx, cancel := context.WithTimeout(r.Context(), 500*time.Millisecond)
			defer cancel()

			if rdb != nil {
				isBlocked, err := rdb.Exists(ctx, "blocked_ip:"+clientIP).Result()
				if err == nil && isBlocked > 0 {
					blockRequest(w, clientIP, r.URL.Path, "redis dynamic blocklist")
					return
				}
			}

			// 3. Auto-Ban Vulnerability Scanners
			lowerPath := strings.ToLower(r.URL.Path)
			for _, probe := range probePatterns {
				if strings.HasPrefix(lowerPath, probe) || strings.Contains(lowerPath, probe) {
					log.Printf("[Firewall] 🚨 Auto-banning scanner IP %s for probing %s\n", clientIP, r.URL.Path)
					if rdb != nil {
						_ = rdb.Set(ctx, "blocked_ip:"+clientIP, "auto_ban_prober", 24*time.Hour).Err()
					}
					blockRequest(w, clientIP, r.URL.Path, "auto-banned probe pattern: "+probe)
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

func getCleanIP(r *http.Request) string {
	raw := r.RemoteAddr
	if host, _, err := net.SplitHostPort(raw); err == nil {
		raw = host
	}
	return strings.TrimSpace(raw)
}

func blockRequest(w http.ResponseWriter, ip, path, reason string) {
	log.Printf("[Firewall] ⛔ Denied access to %s [%s] (%s)\n", ip, path, reason)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusForbidden)
	_, _ = w.Write([]byte(`{"error":"forbidden"}`))
}
