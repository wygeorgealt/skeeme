#!/bin/bash

set -euo pipefail


cd /var/www/html 2>/dev/null || cd "$(dirname "$0")/../"

mkdir -p storage/logs
LOG_FILE="storage/logs/backup-health.log"

echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Starting retention health check" >> "$LOG_FILE"





if php artisan database:backup:test \
  --prefix="${BACKUP_HEALTH_PREFIX:-DB backups/retention-tests}" \
  --lock-mode="${BACKUP_LOCK_MODE:-COMPLIANCE}" \
  --lock-days="${BACKUP_LOCK_DAYS:-365}" >> "$LOG_FILE" 2>&1; then
    echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Retention health check passed" >> "$LOG_FILE"
else
    echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Retention health check FAILED" >> "$LOG_FILE"
    exit 1
fi

