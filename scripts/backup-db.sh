#!/bin/bash

# ===================================
# APAS Database Backup Script
# ===================================

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/apas"
DB_NAME="apas"
DB_USER="apas_user"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# PostgreSQL backup
echo "Starting database backup..."
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/apas_$DATE.sql

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Database backup completed: $BACKUP_DIR/apas_$DATE.sql"

    # Compress backup
    gzip $BACKUP_DIR/apas_$DATE.sql
    echo "Backup compressed: $BACKUP_DIR/apas_$DATE.sql.gz"

    # Delete old backups
    echo "Removing backups older than $RETENTION_DAYS days..."
    find $BACKUP_DIR -name "apas_*.sql.gz" -mtime +$RETENTION_DAYS -delete

    echo "Backup completed successfully!"
else
    echo "Error: Database backup failed!"
    exit 1
fi

# List current backups
echo ""
echo "Current backups:"
ls -lh $BACKUP_DIR/apas_*.sql.gz 2>/dev/null || echo "No backups found"
