package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"

	"skeeme-go/internal/cache"
	"skeeme-go/internal/db"
	"skeeme-go/internal/handlers"
	"skeeme-go/internal/jobs"
	"skeeme-go/internal/middleware"
)

func main() {
	// Load .env if present (mostly for local development)
	_ = godotenv.Load()

	// Allow /app/api to also execute one-off cron commands directly (e.g., `/app/api backup`)
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "backup":
			log.Println("[API CLI] Running Postgres backup to R2...")
			if err := jobs.RunPostgresBackup(); err != nil {
				log.Fatalf("[API CLI] Backup failed: %v", err)
			}
			log.Println("[API CLI] Backup finished successfully.")
			return
		case "streaks":
			database, err := db.NewStudentDB()
			if err != nil {
				log.Fatalf("[API CLI] DB connection failed: %v", err)
			}
			defer database.Close()
			if err := jobs.ResetStreaks(database); err != nil {
				log.Fatalf("[API CLI] ResetStreaks failed: %v", err)
			}
			log.Println("[API CLI] Streaks reset successfully.")
			return
		case "cleanup":
			database, err := db.NewStudentDB()
			if err != nil {
				log.Fatalf("[API CLI] DB connection failed: %v", err)
			}
			defer database.Close()
			jobs.PendingCleanup(database)
			log.Println("[API CLI] Cleanup finished.")
			return
		case "health":
			jobs.AIHealthCheck()
			return
		case "all":
			database, err := db.NewStudentDB()
			if err != nil {
				log.Fatalf("[API CLI] DB connection failed: %v", err)
			}
			defer database.Close()
			_ = jobs.ResetStreaks(database)
			jobs.PendingCleanup(database)
			_ = jobs.RunPostgresBackup()
			jobs.AIHealthCheck()
			return
		}
	}

	// Initialize DB
	database, err := db.NewStudentDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Initialize in-process Background Scheduler (backups & cleanups)
	if os.Getenv("DISABLE_INTERNAL_CRON") != "true" {
		c := cron.New()

		// Run every hour: pending student cleanup
		c.AddFunc("0 * * * *", func() {
			log.Println("[Scheduler] Running hourly pending student cleanup...")
			jobs.PendingCleanup(database)
		})

		// Run every 3 hours: AI Health Check
		c.AddFunc("0 */3 * * *", func() {
			log.Println("[Scheduler] Running AI health check...")
			jobs.AIHealthCheck()
		})

		// Midnight UTC: Reset streaks
		c.AddFunc("0 0 * * *", func() {
			log.Println("[Scheduler] Running midnight ResetStreaks job...")
			if err := jobs.ResetStreaks(database); err != nil {
				log.Printf("[Scheduler] ResetStreaks failed: %v", err)
			}
		})

		// In-process Database Backup to R2 (runs automatically inside Go, no external cron required)
		backupSchedule := os.Getenv("BACKUP_CRON_SCHEDULE")
		if backupSchedule == "" {
			backupSchedule = "0 * * * *" // Hourly at minute 0 UTC
		}
		c.AddFunc(backupSchedule, func() {
			log.Println("[Scheduler] Running scheduled database backup to R2...")
			if err := jobs.RunPostgresBackup(); err != nil {
				log.Printf("[Scheduler] Database backup failed: %v", err)
			}
		})

		c.Start()
		log.Printf("[Scheduler] In-process background scheduler started (streaks, cleanups, health checks & backup on '%s' active)\n", backupSchedule)
	}

	// Initialize Redis
	redisClient, err := cache.NewRedisClient()
	if err != nil {
		log.Fatalf("Failed to initialize redis: %v", err)
	}
	defer redisClient.Close()

	// Setup Router
	r := chi.NewRouter()

	// Middleware
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(middleware.LoggingMiddleware)
	r.Use(chimw.Recoverer)
	
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // Adjust for production
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Initialize Handlers
	healthHandler := &handlers.HealthHandler{DB: database, Redis: redisClient}
	systemHandler := &handlers.SystemHandler{DB: database, Redis: redisClient}
	authHandler := &handlers.AuthHandler{DB: database, Redis: redisClient}
	otpHandler := &handlers.OtpHandler{DB: database, Redis: redisClient}
	oauthHandler := &handlers.OAuthHandler{DB: database, Redis: redisClient}
	profileHandler := &handlers.ProfileHandler{DB: database}
	internalAIHandler := &handlers.InternalAIHandler{DB: database, Redis: redisClient}
	creditHandler := &handlers.CreditHandler{DB: database}
	syncHandler := &handlers.SyncHandler{DB: database}
	quizHandler := &handlers.QuizHandler{DB: database}
	flashcardHandler := &handlers.FlashcardHandler{DB: database}
	streakHandler := &handlers.StreakHandler{DB: database}
	pushTokenHandler := &handlers.PushTokenHandler{DB: database}
	onboardingHandler := &handlers.OnboardingHandler{DB: database}
	fileExtractHandler := &handlers.FileExtractHandler{DB: database, Redis: redisClient}
	userExamHandler := &handlers.UserExamHandler{DB: database}
	billingHandler := &handlers.BillingHandler{DB: database}
	webhookHandler := &handlers.WebhookHandler{DB: database}
	referralHandler := &handlers.ReferralHandler{DB: database}
	supportHandler := &handlers.SupportHandler{DB: database}
		publicSupportHandler := &handlers.PublicSupportHandler{DB: database, Redis: redisClient}
	gradeHandler := &handlers.GradeHandler{}
	aiHandler := handlers.NewAIHandler(database, redisClient)

	// Middleware
	requireAuth := middleware.AuthMiddleware(database)
	requireInternalAuth := middleware.InternalAuthMiddleware

	// Root & Health Checks (handles GET & HEAD for Brimble and cloud health-checks)
	rootHandler := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if r.Method != http.MethodHead {
			_, _ = w.Write([]byte(`{"status":"ok","service":"skeeme-api"}`))
		}
	}

	r.Get("/", rootHandler)
	r.Head("/", rootHandler)
	r.Get("/health", healthHandler.Check)
	r.Head("/health", healthHandler.Check)
	r.Get("/api/health", healthHandler.Check)
	r.Head("/api/health", healthHandler.Check)
	
	// Webhooks (public)
	r.Post("/api/webhooks/paystack", webhookHandler.Paystack)
	r.Post("/api/webhooks/revenuecat", webhookHandler.RevenueCat)

	// Cron endpoints (for manual triggering, Brimble HTTP cron, or external webhooks)
	r.Route("/api/cron", func(r chi.Router) {
		r.Use(func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				secret := os.Getenv("CRON_SECRET")
				requireSecret := os.Getenv("REQUIRE_CRON_AUTH") == "true"
				if requireSecret && secret != "" {
					authHeader := r.Header.Get("Authorization")
					cronHeader := r.Header.Get("X-Cron-Secret")
					querySecret := r.URL.Query().Get("secret")
					if cronHeader != secret && querySecret != secret && authHeader != "Bearer "+secret {
						log.Printf("[Cron Route] Unauthorized request from IP %s (require auth active)\n", r.RemoteAddr)
						w.Header().Set("Content-Type", "application/json")
						w.WriteHeader(http.StatusUnauthorized)
						_, _ = w.Write([]byte(`{"error":"unauthorized"}`))
						return
					}
				}
				next.ServeHTTP(w, r)
			})
		})

		handleBackup := func(w http.ResponseWriter, r *http.Request) {
			log.Printf("[Cron Route] Backup triggered via %s from %s\n", r.Method, r.RemoteAddr)
			if err := jobs.RunPostgresBackup(); err != nil {
				log.Printf("[Cron Route] Backup failed: %v\n", err)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_, _ = w.Write([]byte(fmt.Sprintf(`{"error":"%s"}`, err.Error())))
				return
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"ok","message":"backup completed successfully"}`))
		}
		r.Get("/backup", handleBackup)
		r.Post("/backup", handleBackup)

		handleStreaks := func(w http.ResponseWriter, r *http.Request) {
			log.Printf("[Cron Route] Streaks reset triggered via %s from %s\n", r.Method, r.RemoteAddr)
			if err := jobs.ResetStreaks(database); err != nil {
				log.Printf("[Cron Route] Streaks reset failed: %v\n", err)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_, _ = w.Write([]byte(fmt.Sprintf(`{"error":"%s"}`, err.Error())))
				return
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"ok","message":"streaks reset successfully"}`))
		}
		r.Get("/streaks", handleStreaks)
		r.Post("/streaks", handleStreaks)

		handleCleanup := func(w http.ResponseWriter, r *http.Request) {
			log.Printf("[Cron Route] Cleanup triggered via %s from %s\n", r.Method, r.RemoteAddr)
			jobs.PendingCleanup(database)
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"ok","message":"cleanup completed successfully"}`))
		}
		r.Get("/cleanup", handleCleanup)
		r.Post("/cleanup", handleCleanup)
	})
	
	// Native Go AI Engine Routes
	r.Group(func(r chi.Router) {
		r.Use(requireAuth)
		r.Post("/api/scan/solve", aiHandler.Solve)
		r.Post("/api/scan/chat", aiHandler.Chat)
		r.Post("/api/quizzes/generate", aiHandler.GenerateQuiz)
		r.Post("/api/flashcards/generate", aiHandler.GenerateFlashcards)
	})

	// Admin AI Switchboard & Credit Dispenser (Password-protected Web UI & API)
	r.Get("/admin/ai-switch", aiHandler.ServeSwitchUI)
	r.Get("/admin/credits", aiHandler.ServeSwitchUI)
	r.Get("/api/admin/ai/provider", aiHandler.GetAdminProvider)
	r.Post("/api/admin/ai/provider", aiHandler.SetAdminProvider)
	r.Post("/api/admin/ai/verify", aiHandler.VerifyAdminPassword)
	r.Post("/api/admin/credits/grant", aiHandler.GrantAdminCredits)

	// Legacy Internal AI Routes (retained for backward compatibility)
	r.Route("/api/v2/internal/ai", func(r chi.Router) {
		r.With(requireAuth).Post("/authorize", internalAIHandler.Authorize)
		r.With(requireInternalAuth).Post("/refund", internalAIHandler.Refund)
	})
	
	r.Route("/api/v2/student", func(r chi.Router) {
		r.Post("/admin/credits/grant", aiHandler.GrantAdminCredits)

		r.Route("/system", func(r chi.Router) {
			r.Get("/pricing", systemHandler.Pricing)
			r.Get("/app-version", systemHandler.AppVersion)
		})

		// Public Auth Routes
		r.Post("/login", authHandler.Login)
		r.Post("/register", authHandler.Register)
		r.Post("/oauth/{provider}", oauthHandler.HandleProvider)
		r.Post("/otp/send", otpHandler.Send)
		r.Post("/otp/verify", otpHandler.Verify)
		r.Post("/otp/resend", otpHandler.Resend)
		r.Post("/auth/verify-account", authHandler.VerifyAccount)
		r.Post("/auth/reset-password", authHandler.ResetPassword)

		// Public website contact (no auth)
		r.Post("/public/contact", publicSupportHandler.Contact)

		// Protected Routes
		r.Group(func(r chi.Router) {
			r.Use(requireAuth)
			
			r.Post("/logout", authHandler.Logout)
			r.Get("/me", authHandler.Me)
			r.Patch("/profile", profileHandler.Update)
			r.Post("/preferences", profileHandler.Preferences)
			r.Post("/me/onboarding", onboardingHandler.CompleteOnboarding)
			r.Post("/files/extract", fileExtractHandler.Extract)
			r.Post("/quizzes/grade-theory", gradeHandler.GradeTheory)
			r.Delete("/profile", profileHandler.DeleteAccount)
			r.Post("/profile/password", profileHandler.UpdatePassword)
			
			// Support
			r.Post("/support/contact", supportHandler.Contact)

			// Credit Endpoints
			r.Get("/credits/summary", creditHandler.Summary)
			r.Post("/credits/checkout", creditHandler.Checkout)
			r.Post("/credits/out-of-credits", creditHandler.OutOfCredits)

			// Data & Session Endpoints
			r.Get("/sync", syncHandler.Sync)
			
			r.Route("/quizzes/history", func(r chi.Router) {
				r.Get("/", quizHandler.History)
				r.Post("/", quizHandler.StoreSession)
				r.Get("/{id}", quizHandler.GetSession)
				r.Delete("/{id}", quizHandler.DeleteSession)
			})

			r.Route("/flashcards", func(r chi.Router) {
				r.Route("/decks", func(r chi.Router) {
					r.Get("/", flashcardHandler.ListDecks)
					r.Post("/", flashcardHandler.CreateDeck)
					r.Get("/{id}", flashcardHandler.GetDeck)
					r.Delete("/{id}", flashcardHandler.DeleteDeck)
					r.Post("/{id}/cards", flashcardHandler.SaveCards)
				})
				r.Route("/history", func(r chi.Router) {
					r.Get("/", flashcardHandler.History)
					r.Post("/", flashcardHandler.StoreSession)
				})
			})
			
			r.Route("/streaks", func(r chi.Router) {
				r.Get("/heatmap", streakHandler.Heatmap)
				r.Get("/freezes", streakHandler.Freezes)
				r.Post("/claim-reward", streakHandler.ClaimReward)
			})

			// Notifications
			r.Post("/device-token", pushTokenHandler.UpdateToken)
			
			// Referrals
			r.Get("/referral/my-code", referralHandler.MyCode)
			r.Get("/referral/stats", referralHandler.Stats)
			r.Post("/referral/claim-rewards", referralHandler.ClaimRewards)
			r.Get("/referral/pending-rewards", referralHandler.PendingRewards)
			r.Post("/referral/redeem", referralHandler.Redeem)

			// Billing
			r.Get("/billing/history", billingHandler.History)

			// User Exams CRUD
			r.Route("/user-exams", func(r chi.Router) {
				r.Get("/", userExamHandler.List)
				r.Post("/", userExamHandler.Create)
				r.Delete("/{id}", userExamHandler.Delete)
			})

			// AI Endpoints (Aliased under student API)
			r.Post("/scan/solve", aiHandler.Solve)
			r.Post("/scan/chat", aiHandler.Chat)
			r.Post("/quizzes/generate", aiHandler.GenerateQuiz)
			r.Post("/flashcards/generate", aiHandler.GenerateFlashcards)
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
