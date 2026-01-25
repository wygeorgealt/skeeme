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

if [ -n "$CREATOR_EMAIL" ]; then
    echo "👑 Setting up creator super-admin ($CREATOR_EMAIL)..."
    php artisan app:create-creator-account "$CREATOR_EMAIL" "$CREATOR_PASSWORD"
fi

echo "🚀 Startup tasks complete!"
