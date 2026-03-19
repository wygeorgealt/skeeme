FROM serversideup/php:8.3-fpm-nginx

# Switch to root to install dependencies
USER root

# Install PHP extensions
RUN install-php-extensions intl gd bcmath

# Install Node.js and NPM
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    NODE_MAJOR=20 && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install nodejs -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy dependency files first to leverage Docker layer caching
COPY --chown=www-data:www-data composer.json composer.lock ./
# Install PHP dependencies (without autoloader/scripts since code isn't copied yet)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY --chown=www-data:www-data package.json package-lock.json* ./
RUN npm ci || npm install

# Copy the rest of the application files
COPY --chown=www-data:www-data . .

# Create necessary directories and set permissions
RUN mkdir -p storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/logs \
    bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Generate optimized autoloader now that files are present
RUN composer dump-autoload --optimize

# Build frontend assets
RUN npm run build

# Note: view:cache is skipped — Filament panel components require runtime registration
# Views are compiled and cached automatically on first request

# Set permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Add runtime startup script for migrations
# Serversideup images execute scripts in /etc/entrypoint.d/ on boot
COPY --chown=www-data:www-data bin/render-startup.sh /etc/entrypoint.d/render-startup.sh
RUN chmod +x /etc/entrypoint.d/render-startup.sh

# Switch back to www-data user
USER www-data

# The base image already has the entrypoint configured for Nginx and PHP-FPM
