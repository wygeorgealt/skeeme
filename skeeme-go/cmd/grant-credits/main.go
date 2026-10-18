package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"skeeme-go/internal/db"
)

func main() {
	userFlag := flag.String("user", "", "Target user email, ID, or name")
	amountFlag := flag.Int("amount", 500, "Number of purchased credits to grant")
	descFlag := flag.String("desc", "", "Optional purchase description")
	flag.Parse()

	_ = godotenv.Load()
	_ = godotenv.Load("../.env")

	identifier := strings.TrimSpace(*userFlag)
	if identifier == "" && flag.NArg() > 0 {
		identifier = strings.TrimSpace(flag.Arg(0))
	}
	if identifier == "" {
		fmt.Println("Usage: go run ./cmd/grant-credits --user <email_or_id> --amount <credits>")
		os.Exit(1)
	}
	if *amountFlag <= 0 {
		log.Fatalf("Amount must be greater than 0")
	}

	database, err := db.NewStudentDB()
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer database.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	var targetUser struct {
		ID               int64  `db:"id"`
		Name             string `db:"name"`
		Email            string `db:"email"`
		Credits          int    `db:"credits"`
		SubscriptionTier string `db:"subscription_tier"`
	}

	err = database.GetContext(
		ctx,
		&targetUser,
		`SELECT id, name, email, credits, COALESCE(subscription_tier, 'free') AS subscription_tier
		 FROM users
		 WHERE LOWER(email) = LOWER($1) OR id::text = $1 OR LOWER(name) = LOWER($1)
		 LIMIT 1`,
		identifier,
	)
	if err != nil {
		log.Fatalf("No user found matching %q: %v", identifier, err)
	}

	tx, err := database.BeginTxx(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	var newBalance int
	err = tx.GetContext(
		ctx,
		&newBalance,
		`UPDATE users
		 SET credits = credits + $1,
		     credits_emptied_at = NULL,
		     updated_at = NOW()
		 WHERE id = $2
		 RETURNING credits`,
		*amountFlag,
		targetUser.ID,
	)
	if err != nil {
		log.Fatalf("Failed to update credits: %v", err)
	}

	desc := strings.TrimSpace(*descFlag)
	if desc == "" {
		desc = fmt.Sprintf("Purchase of %d Skeeme Credits", *amountFlag)
	}
	reqID := fmt.Sprintf("purchase_credit_pack_%d_%d", targetUser.ID, time.Now().UnixNano())
	metaJSON := fmt.Sprintf(`{"source":"credit_pack","credits":%d,"credits_bought":true}`, *amountFlag)

	_, err = tx.ExecContext(
		ctx,
		`INSERT INTO transactions
		 (user_id, type, action_type, request_id, amount, description, metadata, created_at, updated_at)
		 VALUES ($1, 'purchase', 'credit_pack', $2, $3, $4, $5::jsonb, NOW(), NOW())`,
		targetUser.ID,
		reqID,
		*amountFlag,
		desc,
		metaJSON,
	)
	if err != nil {
		log.Fatalf("Failed to record purchase transaction: %v", err)
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	// Best-effort paid invoice record
	_, _ = database.ExecContext(
		ctx,
		`INSERT INTO invoices (user_id, amount, currency, status, reference, payment_method, description, metadata, paid_at, created_at, updated_at)
		 VALUES ($1, $2, 'NGN', 'paid', $3, 'credit_pack', $4, $5::jsonb, NOW(), NOW(), NOW())`,
		targetUser.ID,
		*amountFlag,
		reqID,
		desc,
		metaJSON,
	)

	fmt.Printf("Success! Sent %d purchased credits to %s (%s)\n", *amountFlag, targetUser.Name, targetUser.Email)
	fmt.Printf("Previous Balance: %d -> New Balance: %d (Recorded as type='purchase')\n", targetUser.Credits, newBalance)
}
