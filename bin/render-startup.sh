#!/bin/sh

# Exit on error
set -e

echo "🐘 Running runtime migrations (FRESH START)..."
php artisan migrate:fresh --force

echo "🚀 Startup tasks complete!"
