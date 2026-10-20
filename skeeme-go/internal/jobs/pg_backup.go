package jobs

import (
	"bytes"
	"compress/gzip"
	"context"
	"database/sql"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"skeeme-go/internal/db"
)

// RunPostgresBackup executes pg_dump (with a pure-Go SQL dump fallback), compresses with gzip,
// and uploads to Cloudflare R2 organized by month and day folders.
func RunPostgresBackup() error {
	log.Println("[Backup Job] Starting Postgres backup to R2...")

	bucket := os.Getenv("AWS_BUCKET")
	endpoint := os.Getenv("AWS_ENDPOINT")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	region := os.Getenv("AWS_DEFAULT_REGION")

	if bucket == "" || endpoint == "" || accessKey == "" || secretKey == "" {
		err := fmt.Errorf("missing AWS credentials or bucket info (AWS_BUCKET, AWS_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)")
		log.Printf("[Backup Job] Error: %v\n", err)
		return err
	}
	if region == "" {
		region = "auto"
	}

	// Generate filename and folder hierarchy (Month/Day)
	now := time.Now().UTC()
	timestamp := now.Format("2006-01-02-15-04-05")
	filename := fmt.Sprintf("postgres_backup_%s.sql.gz", timestamp)
	localPath := filepath.Join(os.TempDir(), filename)
	defer os.Remove(localPath)

	// Step 1: Try pg_dump directly into Go gzip writer; if pg_dump is missing or fails (e.g. sidecar/version mismatch), fallback to pure-Go dump
	dbURL := os.Getenv("DATABASE_URL")
	dumpErr := runPgDumpGzip(dbURL, localPath)
	if dumpErr != nil {
		log.Printf("[Backup Job] pg_dump unavailable or failed (%v) — using built-in pure-Go SQL backup fallback...\n", dumpErr)
		if fallbackErr := runNativeGoSQLDump(localPath); fallbackErr != nil {
			err := fmt.Errorf("backup failed (pg_dump: %v | native fallback: %w)", dumpErr, fallbackErr)
			log.Printf("[Backup Job] %v\n", err)
			return err
		}
	}

	fi, err := os.Stat(localPath)
	if err != nil {
		err = fmt.Errorf("local backup file was not created: %w", err)
		log.Printf("[Backup Job] %v\n", err)
		return err
	}
	if fi.Size() < 30 {
		err = fmt.Errorf("local backup file too small (%d bytes), likely empty dump", fi.Size())
		log.Printf("[Backup Job] %v\n", err)
		return err
	}
	log.Printf("[Backup Job] Successfully created compressed dump: %s (%d bytes)\n", localPath, fi.Size())

	endpoint = strings.TrimRight(endpoint, "/")
	if !strings.HasPrefix(endpoint, "http://") && !strings.HasPrefix(endpoint, "https://") {
		endpoint = "https://" + endpoint
	}

	signingRegion := region
	if signingRegion == "" || signingRegion == "auto" {
		signingRegion = "us-east-1"
	}

	// Configure AWS SDK for Cloudflare R2
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, reg string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:               endpoint,
			SigningRegion:     signingRegion,
			HostnameImmutable: true,
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(customResolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithRegion(signingRegion),
	)
	if err != nil {
		err = fmt.Errorf("failed to load AWS config: %w", err)
		log.Printf("[Backup Job] %v\n", err)
		return err
	}

	// Cloudflare R2 requires Path-Style addressing (https://endpoint/bucket/key)
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
		o.Region = signingRegion
	})

	// Upload to R2
	file, err := os.Open(localPath)
	if err != nil {
		err = fmt.Errorf("failed to open local backup file: %w", err)
		log.Printf("[Backup Job] %v\n", err)
		return err
	}
	defer file.Close()

	prefix := os.Getenv("BACKUP_R2_PREFIX")
	if prefix == "" {
		prefix = "Skeeme-Postgres"
	}
	prefix = strings.Trim(prefix, "/")

	// Organize backups by month and day folders (e.g. Skeeme-Postgres/2026-10/20/postgres_backup_....sql.gz)
	monthFolder := now.Format("2006-01")
	dayFolder := now.Format("02")
	s3Key := fmt.Sprintf("%s/%s/%s/%s", prefix, monthFolder, dayFolder, filename)

	log.Printf("[Backup Job] Uploading to R2: %s/%s...\n", bucket, s3Key)
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(s3Key),
		Body:   file,
	})

	if err != nil {
		err = fmt.Errorf("failed to upload to R2: %w", err)
		log.Printf("[Backup Job] %v\n", err)
		return err
	}

	log.Println("[Backup Job] Successfully uploaded Postgres backup to Cloudflare R2!")
	return nil
}

// runPgDumpGzip runs pg_dump directly (without bash/sh pipefail dependencies) and streams stdout into Go's native gzip writer.
func runPgDumpGzip(dbURL, localPath string) error {
	if dbURL == "" {
		return fmt.Errorf("DATABASE_URL is empty for pg_dump")
	}
	pgDumpPath, err := exec.LookPath("pg_dump")
	if err != nil {
		return fmt.Errorf("pg_dump binary not found in PATH: %w", err)
	}

	outFile, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("create temp file: %w", err)
	}
	defer outFile.Close()

	gzWriter := gzip.NewWriter(outFile)
	defer gzWriter.Close()

	cmd := exec.Command(pgDumpPath, "--no-owner", "--no-acl", dbURL)
	cmd.Stdout = gzWriter

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("pg_dump error: %w (stderr: %s)", err, strings.TrimSpace(stderr.String()))
	}

	if err := gzWriter.Close(); err != nil {
		return fmt.Errorf("gzip close: %w", err)
	}
	return outFile.Close()
}

// runNativeGoSQLDump connects to Postgres via Go's sql driver and writes a complete compressed SQL dump.
// Works in any environment (including minimal cron sidecars without postgresql-client installed).
func runNativeGoSQLDump(localPath string) error {
	database, err := db.NewStudentDB()
	if err != nil {
		return fmt.Errorf("db connect: %w", err)
	}
	defer database.Close()

	outFile, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("create output file: %w", err)
	}
	defer outFile.Close()

	gz := gzip.NewWriter(outFile)
	defer gz.Close()

	writef := func(format string, args ...any) error {
		_, wErr := fmt.Fprintf(gz, format, args...)
		return wErr
	}

	if err := writef("-- Skeeme Native Go PostgreSQL Dump\n-- Generated at %s UTC\n\nSET client_encoding = 'UTF8';\nSET standard_conforming_strings = on;\n\n", time.Now().UTC().Format(time.RFC3339)); err != nil {
		return err
	}

	var tables []string
	err = database.Select(&tables, `
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
		ORDER BY table_name
	`)
	if err != nil {
		return fmt.Errorf("list tables: %w", err)
	}

	for _, tbl := range tables {
		if err := dumpTable(database.DB, gz, tbl); err != nil {
			return fmt.Errorf("dump table %s: %w", tbl, err)
		}
	}

	if err := gz.Close(); err != nil {
		return err
	}
	return outFile.Close()
}

func dumpTable(dbConn *sql.DB, w io.Writer, tableName string) error {
	fmt.Fprintf(w, "--\n-- Table: %s\n--\n", tableName)

	rows, err := dbConn.Query(fmt.Sprintf(`SELECT * FROM "%s"`, strings.ReplaceAll(tableName, `"`, `""`)))
	if err != nil {
		return err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return err
	}
	if len(cols) == 0 {
		return nil
	}

	quotedCols := make([]string, len(cols))
	for i, c := range cols {
		quotedCols[i] = `"` + strings.ReplaceAll(c, `"`, `""`) + `"`
	}
	colList := strings.Join(quotedCols, ", ")
	safeTable := `"` + strings.ReplaceAll(tableName, `"`, `""`) + `"`

	values := make([]any, len(cols))
	valuePtrs := make([]any, len(cols))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	for rows.Next() {
		if err := rows.Scan(valuePtrs...); err != nil {
			return err
		}

		literals := make([]string, len(cols))
		for i, val := range values {
			literals[i] = formatSQLLiteral(val)
		}

		if _, err := fmt.Fprintf(w, "INSERT INTO %s (%s) VALUES (%s);\n", safeTable, colList, strings.Join(literals, ", ")); err != nil {
			return err
		}
	}

	fmt.Fprintln(w)
	return rows.Err()
}

func formatSQLLiteral(val any) string {
	if val == nil {
		return "NULL"
	}
	switch v := val.(type) {
	case bool:
		if v {
			return "TRUE"
		}
		return "FALSE"
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64, float32, float64:
		return fmt.Sprintf("%v", v)
	case time.Time:
		return "'" + v.UTC().Format("2006-01-02 15:04:05.999999Z07:00") + "'"
	case []byte:
		// In lib/pq, TEXT/VARCHAR/JSONB/NUMERIC columns can be returned as []byte
		if isPrintableUTF8(v) {
			s := string(v)
			return "'" + strings.ReplaceAll(s, "'", "''") + "'"
		}
		return "'\\x" + hex.EncodeToString(v) + "'"
	case string:
		return "'" + strings.ReplaceAll(v, "'", "''") + "'"
	default:
		s := fmt.Sprintf("%v", v)
		return "'" + strings.ReplaceAll(s, "'", "''") + "'"
	}
}

func isPrintableUTF8(b []byte) bool {
	for _, c := range b {
		if c == 0 {
			return false
		}
	}
	return true
}

