#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting build process..."

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
npm install
npm run build

# Clear and cache Laravel settings
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "🐘 Running database migrations..."
php artisan migrate --force

echo "✅ Build finished successfully!"
