package jobs

import (
	"log"
)

// AIHealthCheck pings the external AI providers to ensure uptime.
func AIHealthCheck() {
	log.Println("[AI Health Job] Starting AI provider health check...")
	
	// TODO: Ping OpenAI, Anthropic, Gemini APIs and log latency/status
	
	log.Println("[AI Health Job] Finished.")
}
