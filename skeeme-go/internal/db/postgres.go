package db

import (
	"fmt"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func NewStudentDB() (*sqlx.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback to individual vars if DATABASE_URL is not set
		host := os.Getenv("PGHOST")
		if host == "" {
			host = os.Getenv("PG_HOST")
		}
		if host == "" {
			host = "localhost" // prevent empty string lookup errors
		}

		port := os.Getenv("PGPORT")
		if port == "" {
			port = os.Getenv("PG_PORT")
		}
		if port == "" {
			port = "5432"
		}

		user := os.Getenv("PGUSER")
		if user == "" {
			user = os.Getenv("PG_USERNAME")
		}

		dbName := os.Getenv("PGDATABASE")
		if dbName == "" {
			dbName = os.Getenv("PG_DATABASE")
		}

		pass := os.Getenv("PGPASSWORD")
		if pass == "" {
			pass = os.Getenv("PG_PASSWORD")
		}

		dsn = fmt.Sprintf(
			"host=%s port=%s dbname=%s user=%s password=%s sslmode=require",
			host, port, dbName, user, pass,
		)
	}

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("postgres connect: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}
