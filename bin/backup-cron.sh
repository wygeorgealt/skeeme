#!/bin/bash

# Daily Database Backup Script for Railway
# Add to railway.json cron jobs:
# "backup-database": "0 2 * * * bash bin/backup-cron.sh"

cd /var/www/html 2>/dev/null || cd $(dirname "$0")/../

# Run the PHP backup script
php scripts/backup_database.php

if [ $? -eq 0 ]; then
    # Backup succeeded
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Database backup completed successfully" >> storage/logs/backup.log
else
    # Backup failed
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Database backup FAILED" >> storage/logs/backup.log
    exit 1
fi
