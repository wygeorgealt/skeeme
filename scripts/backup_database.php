<?php

/**
 * Database Backup Script
 * 
 * Usage: php scripts/backup_database.php
 * 
 * Performs a logical backup of the MySQL database by exporting all tables
 * and saving to storage/backups/ directory.
 */

require_once __DIR__ . '/../bootstrap/app.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

$app = require_once __DIR__ . '/../bootstrap/app.php';
$container = $app->make('Illuminate\Contracts\Container\Container');

// Verify we're using MySQL
$connection = config('database.default');
$db_driver = config("database.connections.{$connection}.driver");

if ($db_driver !== 'mysql') {
    echo "Error: This script only supports MySQL databases\n";
    exit(1);
}

$db_host = config("database.connections.{$connection}.host");
$db_name = config("database.connections.{$connection}.database");
$db_user = config("database.connections.{$connection}.username");
$db_password = config("database.connections.{$connection}.password");
$db_port = config("database.connections.{$connection}.port");

if (!$db_user || !$db_name) {
    echo "Error: Database credentials not configured\n";
    exit(1);
}

// Create backups directory if it doesn't exist
$backup_dir = storage_path('backups');
if (!File::isDirectory($backup_dir)) {
    File::makeDirectory($backup_dir, 0755, true);
}

// Generate backup filename with timestamp
$timestamp = now()->format('Y-m-d-His');
$backup_file = "{$backup_dir}/db_backup_{$timestamp}.sql";

echo "Starting database backup...\n";
echo "Database: {$db_name}\n";
echo "Host: {$db_host}\n";
echo "Output: {$backup_file}\n\n";

try {
    // Get all tables
    $tables = DB::select('SHOW TABLES');
    
    // Build SQL dump
    $sql = "-- MySQL database dump\n";
    $sql .= "-- Generated at " . now()->toDateTimeString() . "\n";
    $sql .= "-- Host: {$db_host}\n";
    $sql .= "-- Database: {$db_name}\n";
    $sql .= "-- PHP Version: " . phpversion() . "\n\n";
    $sql .= "SET NAMES utf8mb4;\n";
    $sql .= "SET sql_mode = 'NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';\n";
    $sql .= "SET foreign_key_checks = 0;\n\n";
    
    $tableCount = 0;
    $recordCount = 0;
    
    // Get table key from SHOW TABLES result
    $tableKey = 'Tables_in_' . $db_name;
    
    foreach ($tables as $table) {
        $tableName = $table->$tableKey;
        $tableCount++;
        
        // Drop table if exists
        $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
        
        // Get CREATE TABLE statement
        $createTableResult = DB::select("SHOW CREATE TABLE {$tableName}");
        if (!empty($createTableResult)) {
            $sql .= $createTableResult[0]->{'Create Table'} . ";\n\n";
        }
        
        // Get table data
        $rows = DB::table($tableName)->get();
        
        if ($rows->count() > 0) {
            $columns = array_keys((array) $rows[0]);
            $columnList = '`' . implode('`, `', $columns) . '`';
            
            $sql .= "INSERT INTO `{$tableName}` ({$columnList}) VALUES\n";
            
            $valueStrings = [];
            foreach ($rows as $row) {
                $values = [];
                foreach ($columns as $col) {
                    $val = $row->$col;
                    if ($val === null) {
                        $values[] = 'NULL';
                    } else {
                        $values[] = "'" . addslashes((string) $val) . "'";
                    }
                }
                $valueStrings[] = '(' . implode(', ', $values) . ')';
                $recordCount++;
            }
            
            $sql .= implode(",\n", $valueStrings) . ";\n\n";
        }
        
        echo "✓ Backed up table: {$tableName} (" . $rows->count() . " records)\n";
    }
    
    $sql .= "SET foreign_key_checks = 1;\n";
    
    // Write to file
    if (File::put($backup_file, $sql)) {
        $fileSize = File::size($backup_file);
        $fileSizeMB = round($fileSize / (1024 * 1024), 2);
        
        echo "\n✓ Backup completed successfully!\n";
        echo "  Tables: {$tableCount}\n";
        echo "  Records: {$recordCount}\n";
        echo "  File: {$backup_file}\n";
        echo "  Size: {$fileSizeMB} MB\n";
        
        // Keep only the last 7 backups
        $this->cleanOldBackups($backup_dir, 7);
        
        exit(0);
    } else {
        echo "✗ Failed to write backup file\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "✗ Backup failed: " . $e->getMessage() . "\n";
    exit(1);
}

/**
 * Clean old backup files, keeping only the most recent N backups
 */
function cleanOldBackups($directory, $keep = 7)
{
    $files = File::files($directory);
    
    // Filter for backup files only
    $backups = array_filter($files, function ($file) {
        return preg_match('/db_backup_\d{4}-\d{2}-\d{2}-\d{6}\.sql/', $file->getFilename());
    });
    
    // Sort by modification time (newest first)
    usort($backups, function ($a, $b) {
        return $b->getMTime() - $a->getMTime();
    });
    
    // Delete old backups
    foreach (array_slice($backups, $keep) as $file) {
        try {
            File::delete($file);
            echo "  [cleanup] Removed old backup: " . $file->getFilename() . "\n";
        } catch (Exception $e) {
            echo "  [cleanup] Failed to remove: " . $file->getFilename() . "\n";
        }
    }
}
