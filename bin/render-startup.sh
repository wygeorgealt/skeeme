#!/bin/sh

# Exit on error
set -e

echo "🐘 Importing base schema (skeeme.sql)..."
php bin/import-base-schema.php

echo "🚀 Running incremental migrations..."
php artisan migrate --force

echo "🚀 Startup tasks complete!"
