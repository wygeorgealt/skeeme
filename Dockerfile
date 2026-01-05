FROM richarvey/nginx-php-fpm:3.1.6

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Image config
ENV SKIP_COMPOSER 1
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Laravel config
ENV WEBROOT /var/www/html/public
ENV APP_ENV production
ENV APP_DEBUG false

# Install dependencies if not already done (though typically handled by image if RUN_SCRIPTS=1)
# However, for efficiency we can do it here
RUN composer install --no-dev --optimize-autoloader

# Install Node and build assets
RUN apk add --no-cache nodejs npm \
    && npm install \
    && npm run build

# Set permissions
RUN chown -R fresh:fresh /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port (8080 is common for this image but Render uses 80 by default)
EXPOSE 80
