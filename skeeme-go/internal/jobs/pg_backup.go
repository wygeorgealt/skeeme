package jobs

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// RunPostgresBackup executes pg_dump, zips it, and uploads to R2
func RunPostgresBackup() {
	log.Println("[Backup Job] Starting Postgres backup to R2...")

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Println("[Backup Job] Error: DATABASE_URL not set")
		return
	}

	bucket := os.Getenv("AWS_BUCKET")
	endpoint := os.Getenv("AWS_ENDPOINT")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	region := os.Getenv("AWS_DEFAULT_REGION")

	if bucket == "" || endpoint == "" || accessKey == "" || secretKey == "" {
		log.Println("[Backup Job] Error: Missing AWS credentials or bucket info")
		return
	}
	if region == "" {
		region = "auto"
	}

	// Generate filename
	timestamp := time.Now().UTC().Format("2006-01-02-15-04-05")
	filename := fmt.Sprintf("postgres_backup_%s.sql.gz", timestamp)
	localPath := filepath.Join("/tmp", filename)

	// Run pg_dump and pipe to gzip
	cmdStr := fmt.Sprintf("pg_dump '%s' | gzip > %s", dbURL, localPath)
	cmd := exec.Command("sh", "-c", cmdStr)
	
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		log.Printf("[Backup Job] pg_dump failed: %v, stderr: %s\n", err, stderr.String())
		return
	}
	log.Printf("[Backup Job] Successfully created local dump: %s\n", localPath)

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
		log.Printf("[Backup Job] Failed to load AWS config: %v\n", err)
		return
	}

	client := s3.NewFromConfig(cfg)

	// Upload to S3
	file, err := os.Open(localPath)
	if err != nil {
		log.Printf("[Backup Job] Failed to open local backup file: %v\n", err)
		return
	}
	defer file.Close()

	s3Key := fmt.Sprintf("Skeeme-Postgres/%s", filename)
	
	log.Printf("[Backup Job] Uploading to R2: %s/%s...\n", bucket, s3Key)
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(s3Key),
		Body:   file,
	})

	if err != nil {
		log.Printf("[Backup Job] Failed to upload to R2: %v\n", err)
		return
	}

	log.Println("[Backup Job] Successfully uploaded Postgres backup to Cloudflare R2!")
}
