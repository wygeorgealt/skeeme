#!/bin/bash

set -euo pipefail

# Database backup script for Railway cron
# - Creates compressed MySQL dump
# - Uploads to Cloudflare R2
# - Applies object retention lock (immutable window)

cd /var/www/html 2>/dev/null || cd "$(dirname "$0")/../"

mkdir -p storage/logs
LOG_FILE="storage/logs/backup.log"

echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Starting backup run" >> "$LOG_FILE"

if php artisan database:backup \
  --keep-local="${BACKUP_KEEP_LOCAL:-240}" \
  --prefix="${BACKUP_R2_PREFIX:-DB backups}" \
  --lock-mode="${BACKUP_LOCK_MODE:-COMPLIANCE}" \
  --lock-days="${BACKUP_LOCK_DAYS:-365}" \
  ${BACKUP_REQUIRE_LOCK:+--require-lock} >> "$LOG_FILE" 2>&1; then
    echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Database backup completed successfully" >> "$LOG_FILE"
else
    echo "[$(date -u +'%Y-%m-%d %H:%M:%S UTC')] Database backup FAILED" >> "$LOG_FILE"
    exit 1
fi
