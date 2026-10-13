package jobs

import (
	"bytes"
	"context"
	"fmt"
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
)

// RunPostgresBackup executes pg_dump, zips it, and uploads to R2 organized by month and day folders
func RunPostgresBackup() error {
	log.Println("[Backup Job] Starting Postgres backup to R2...")

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		err := fmt.Errorf("DATABASE_URL not set")
		log.Printf("[Backup Job] Error: %v\n", err)
		return err
	}

	bucket := os.Getenv("AWS_BUCKET")
	endpoint := os.Getenv("AWS_ENDPOINT")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	region := os.Getenv("AWS_DEFAULT_REGION")

	if bucket == "" || endpoint == "" || accessKey == "" || secretKey == "" {
		err := fmt.Errorf("missing AWS credentials or bucket info")
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
	localPath := filepath.Join("/tmp", filename)

	// Run pg_dump and pipe to gzip
	cmdStr := fmt.Sprintf("set -e -o pipefail; pg_dump '%s' | gzip > %s", dbURL, localPath)
	cmd := exec.Command("sh", "-c", cmdStr)
	
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		err = fmt.Errorf("pg_dump failed: %w, stderr: %s", err, stderr.String())
		log.Printf("[Backup Job] %v\n", err)
		return err
	}

	fi, err := os.Stat(localPath)
	if err != nil {
		err = fmt.Errorf("local backup file was not created: %w", err)
		log.Printf("[Backup Job] %v\n", err)
		return err
	}
	if fi.Size() < 50 {
		err = fmt.Errorf("local backup file too small (%d bytes), likely empty dump. stderr: %s", fi.Size(), stderr.String())
		log.Printf("[Backup Job] %v\n", err)
		return err
	}
	log.Printf("[Backup Job] Successfully created local dump: %s (%d bytes)\n", localPath, fi.Size())

	// Clean up local file when done
	defer os.Remove(localPath)

	// Configure AWS SDK for Cloudflare R2
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, reg string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:               endpoint,
			SigningRegion:     region,
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(customResolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithRegion(region),
	)
	if err != nil {
		err = fmt.Errorf("failed to load AWS config: %w", err)
		log.Printf("[Backup Job] %v\n", err)
		return err
	}

	client := s3.NewFromConfig(cfg)

	// Upload to S3
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

	// Organize backups by month and day folders (e.g. Skeeme-Postgres/2026-10/13/postgres_backup_....sql.gz)
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
