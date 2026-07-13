package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"skeeme-go/internal/cache"
	"skeeme-go/internal/db"
	"skeeme-go/internal/handlers"
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
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	
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
	oauthHandler := &handlers.OAuthHandler{DB: database}
	profileHandler := &handlers.ProfileHandler{DB: database}
	internalAIHandler := &handlers.InternalAIHandler{DB: database}
	creditHandler := &handlers.CreditHandler{DB: database}
	syncHandler := &handlers.SyncHandler{DB: database}
	quizHandler := &handlers.QuizHandler{DB: database}
	flashcardHandler := &handlers.FlashcardHandler{DB: database}
	streakHandler := &handlers.StreakHandler{DB: database}
	pushTokenHandler := &handlers.PushTokenHandler{DB: database}

	// Middleware
	requireAuth := middleware.AuthMiddleware(database)
	requireInternalAuth := middleware.InternalAuthMiddleware

	// Routes
	r.Get("/api/health", healthHandler.Check)
	
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

		// Protected Routes
		r.Group(func(r chi.Router) {
			r.Use(requireAuth)
			
			r.Post("/logout", authHandler.Logout)
			r.Get("/me", authHandler.Me)
			r.Patch("/profile", profileHandler.Update)

			// Credit Endpoints
			r.Get("/credits/summary", creditHandler.Summary)
			r.Post("/credits/checkout", creditHandler.Checkout)
			r.Post("/credits/out-of-credits", creditHandler.OutOfCredits)

			// Data & Session Endpoints
			r.Get("/sync", syncHandler.Sync)
			
			r.Route("/quiz/history", func(r chi.Router) {
				r.Get("/", quizHandler.History)
				r.Get("/{id}", quizHandler.GetSession)
				r.Delete("/{id}", quizHandler.DeleteSession)
			})

			r.Route("/flashcards/decks", func(r chi.Router) {
				r.Get("/", flashcardHandler.ListDecks)
				r.Get("/{id}", flashcardHandler.GetDeck)
				r.Delete("/{id}", flashcardHandler.DeleteDeck)
			})
			
			r.Route("/streaks", func(r chi.Router) {
				r.Get("/heatmap", streakHandler.Heatmap)
				r.Get("/freezes", streakHandler.Freezes)
				r.Post("/reward", streakHandler.ClaimReward)
			})

			// Notifications
			r.Post("/notifications/token", pushTokenHandler.UpdateToken)
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
