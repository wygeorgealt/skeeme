#!/bin/sh

# Exit on error
set -e

echo "🐘 Running runtime migrations..."
php artisan migrate --force

echo "🚀 Startup tasks complete!"
