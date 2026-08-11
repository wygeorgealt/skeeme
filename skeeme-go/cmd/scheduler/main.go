package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
	
	"skeeme-go/internal/db"
	"skeeme-go/internal/jobs"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system variables")
	}

	database, err := db.NewStudentDB()
	if err != nil {
		log.Fatalf("Could not connect to postgres: %v", err)
	}
	defer database.Close()

	// Create a new cron instance
	c := cron.New()

	// Run every day at midnight (UTC)
	c.AddFunc("0 0 * * *", func() {
		log.Println("Running ResetStreaks job...")
		if err := jobs.ResetStreaks(database); err != nil {
			log.Printf("ResetStreaks failed: %v", err)
		}
	})

	// Run every hour
	c.AddFunc("0 * * * *", func() {
		jobs.RunPostgresBackup()
		jobs.PendingCleanup(database)
	})

	// Run every 3 hours
	c.AddFunc("0 */3 * * *", func() {
		jobs.AIHealthCheck()
	})

	log.Println("Starting scheduler service...")
	c.Start()

	// Block forever
	select {}
}
