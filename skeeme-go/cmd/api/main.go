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

	"skeeme-go/internal/cache"
	"skeeme-go/internal/db"
	"skeeme-go/internal/handlers"
	"skeeme-go/internal/middleware"
)

func main() {
	// Load .env if present (mostly for local development)
	_ = godotenv.Load()

	// Initialize DB
	database, err := db.NewStudentDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

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
	r.Use(chimw.Logger)
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
	gradeHandler := &handlers.GradeHandler{}

	// Middleware
	requireAuth := middleware.AuthMiddleware(database)
	requireInternalAuth := middleware.InternalAuthMiddleware

	// Routes
	r.Get("/api/health", healthHandler.Check)
	
	// Webhooks (public)
	r.Post("/api/webhooks/paystack", webhookHandler.Paystack)
	r.Post("/api/webhooks/revenuecat", webhookHandler.RevenueCat)
	
	// Internal AI Routes (Node.js AI service)
	r.Route("/api/v1/internal/ai", func(r chi.Router) {
		r.Use(requireInternalAuth)
		r.Post("/authorize", internalAIHandler.Authorize)
		r.Post("/refund", internalAIHandler.Refund)
	})
	
	r.Route("/api/v1/student", func(r chi.Router) {
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
