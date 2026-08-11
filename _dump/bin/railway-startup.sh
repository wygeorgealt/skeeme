#!/bin/sh
set -e

echo "========================================"
echo "🚀 Skeeme Railway Startup"
echo "========================================"

# Handle Aiven/Railway SSL certificate if provided as content
case "$MYSQL_ATTR_SSL_CA" in
  "-----BEGIN CERTIFICATE-----"*)
    echo "📜 Creating CA certificate file from MYSQL_ATTR_SSL_CA..."
    mkdir -p /var/www/html/storage/certs
    echo "$MYSQL_ATTR_SSL_CA" > /var/www/html/storage/certs/db-ca.pem
    export MYSQL_ATTR_SSL_CA=/var/www/html/storage/certs/db-ca.pem
    ;;
esac

# Import base schema if needed
echo "🐘 Importing base schema..."
php bin/import-base-schema.php

# Run migrations
echo "📦 Running migrations..."
php artisan migrate --force

# Setup admin user if configured
if [ -n "$ADMIN_EMAIL" ]; then
    echo "👤 Setting up admin user ($ADMIN_EMAIL)..."
    php artisan app:make-admin "$ADMIN_EMAIL" "$ADMIN_PASSWORD" || true
fi

# Create storage link
echo "🔗 Creating storage link..."
php artisan storage:link --force 2>/dev/null || true

# Production optimizations
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan event:cache

# Run backup on deployment
echo "💾 Running pre-deployment backup..."
php artisan database:backup || echo "⚠️ Backup failed, but proceeding with startup."

echo "========================================"
echo "✅ Startup tasks complete!"
echo "========================================"
echo "🌐 Starting Nginx + PHP-FPM..."

# The serversideup base image handles starting Nginx + PHP-FPM
# This script runs via /etc/entrypoint.d/ before the main process starts
