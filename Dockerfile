FROM serversideup/php:8.3-fpm-nginx

# Switch to root to install dependencies
USER root

# Install PHP extensions (pcntl needed for queue:work signal handling)
RUN install-php-extensions intl gd bcmath pcntl

# Install Node.js, NPM
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    NODE_MAJOR=20 && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install nodejs -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Increase Nginx and PHP limits for high-res image scans
RUN echo "client_body_buffer_size 10M;" > /etc/nginx/conf.d/tuning.conf
ENV PHP_POST_MAX_SIZE=20M
ENV PHP_UPLOAD_MAX_FILESIZE=20M
ENV NGINX_MAX_BODY_SIZE=20M

# PHP-FPM Performance Tuning (ServerSideUp requires config files for FPM pool settings)
RUN FPM_POOL_DIR=$(find /etc -type d -name "pool.d" | head -n 1) && \
    if [ -z "$FPM_POOL_DIR" ]; then FPM_POOL_DIR="/etc/php/8.3/fpm/pool.d"; fi && \
    mkdir -p "$FPM_POOL_DIR" && \
    echo "[www]\npm.max_children = 50\npm.start_servers = 10\npm.min_spare_servers = 10\npm.max_spare_servers = 20\npm.max_requests = 1000\n" > "$FPM_POOL_DIR/zzz-tuning.conf"

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
    storage/certs \
    bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Generate optimized autoloader now that files are present
RUN composer dump-autoload --optimize

# Build frontend assets
RUN npm run build

# Set permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Railway startup script for web service (runs migrations, caching, etc.)
# Serversideup images execute scripts in /etc/entrypoint.d/ on boot
COPY --chown=www-data:www-data bin/railway-startup.sh /etc/entrypoint.d/railway-startup.sh
RUN chmod +x /etc/entrypoint.d/railway-startup.sh

# Worker startup script (used by skeeme-worker service via start command override)
COPY --chown=www-data:www-data bin/railway-worker.sh /usr/local/bin/railway-worker.sh
RUN chmod +x /usr/local/bin/railway-worker.sh

# Cron startup script (used by the skeeme-cron service)
COPY --chown=www-data:www-data bin/railway-cron.sh /usr/local/bin/railway-cron.sh
RUN chmod +x /usr/local/bin/railway-cron.sh

# Switch back to www-data user
USER www-data

# The base image already has the entrypoint configured for Nginx and PHP-FPM
# The worker/cron services override the start command to use their respective scripts instead
