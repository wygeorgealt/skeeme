#!/bin/sh

# Exit on error
set -e

echo "🐘 Importing base schema (skeeme.sql)..."
php bin/import-base-schema.php

echo "🚀 Running incremental migrations..."
php artisan migrate --force

if [ -n "$ADMIN_EMAIL" ]; then
    echo "👤 Setting up admin user ($ADMIN_EMAIL)..."
    php artisan app:make-admin "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

# Configure Laravel Scheduler (cron) only if RUN_CRON is set to "true"
if [ "$RUN_CRON" = "true" ]; then
    echo "⏰ Setting up Laravel scheduler cron..."
    echo "* * * * * cd /var/www/html && php artisan schedule:run >> /var/www/html/storage/logs/scheduler.log 2>&1" | crontab -
    cron
else
    echo "⏭️ Skipping cron setup (RUN_CRON is not 'true')."
fi

echo "🚀 Startup tasks complete!"

