#!/bin/sh
set -e

echo "========================================"
echo "⏰ Skeeme Cron/Scheduler Startup"
echo "========================================"

# Handle SSL certificate if provided as content
case "$MYSQL_ATTR_SSL_CA" in
  "-----BEGIN CERTIFICATE-----"*)
    echo "📜 Creating CA certificate file..."
    mkdir -p /var/www/html/storage/certs
    echo "$MYSQL_ATTR_SSL_CA" > /var/www/html/storage/certs/db-ca.pem
    export MYSQL_ATTR_SSL_CA=/var/www/html/storage/certs/db-ca.pem
    ;;
esac

# Cache config for scheduler (needs DB connection info)
php artisan config:cache

echo "⏰ Starting Laravel Scheduler..."
exec php artisan schedule:work
