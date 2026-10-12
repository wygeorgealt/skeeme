package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"skeeme-go/internal/db"
	"skeeme-go/internal/jobs"
)

func main() {
	// Load .env if present
	_ = godotenv.Load()

	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	switch command {
	case "streaks":
		log.Println("[CLI] Connecting to database to reset streaks...")
		database, err := db.NewStudentDB()
		if err != nil {
			log.Fatalf("[CLI] Database connection failed: %v", err)
		}
		defer database.Close()

		if err := jobs.ResetStreaks(database); err != nil {
			log.Fatalf("[CLI] ResetStreaks failed: %v", err)
		}
		log.Println("[CLI] Streaks reset successfully.")

	case "backup":
		log.Println("[CLI] Running Postgres backup to R2...")
		jobs.RunPostgresBackup()
		log.Println("[CLI] Backup command finished.")

	case "cleanup":
		log.Println("[CLI] Connecting to database for pending cleanup...")
		database, err := db.NewStudentDB()
		if err != nil {
			log.Fatalf("[CLI] Database connection failed: %v", err)
		}
		defer database.Close()

		jobs.PendingCleanup(database)
		log.Println("[CLI] Pending cleanup finished.")

	case "health":
		log.Println("[CLI] Running AI health check...")
		jobs.AIHealthCheck()
		log.Println("[CLI] AI health check finished.")

	case "all":
		log.Println("[CLI] Running all maintenance tasks...")
		database, err := db.NewStudentDB()
		if err != nil {
			log.Fatalf("[CLI] Database connection failed: %v", err)
		}
		defer database.Close()

		if err := jobs.ResetStreaks(database); err != nil {
			log.Printf("[CLI] ResetStreaks warning: %v", err)
		}
		jobs.PendingCleanup(database)
		jobs.RunPostgresBackup()
		jobs.AIHealthCheck()
		log.Println("[CLI] All maintenance tasks completed.")

	default:
		fmt.Printf("Unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Skeeme Backend CLI Runner")
	fmt.Println("Usage: /app/cli <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  streaks   Reset inactive student streaks")
	fmt.Println("  backup    Run pg_dump and upload compressed backup to Cloudflare R2")
	fmt.Println("  cleanup   Delete stale pending student registrations (> 2 hrs)")
	fmt.Println("  health    Perform AI service health checks")
	fmt.Println("  all       Run streaks, cleanup, backup, and health check in sequence")
}
