<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'database:backup {--keep=7 : Number of backups to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a logical backup of the MySQL database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $connection = config('database.default');
        $db_driver = config("database.connections.{$connection}.driver");

        if ($db_driver !== 'mysql') {
            $this->error('Error: This command only supports MySQL databases');
            return 1;
        }

        $db_host = config("database.connections.{$connection}.host");
        $db_name = config("database.connections.{$connection}.database");
        $db_user = config("database.connections.{$connection}.username");
        $db_password = config("database.connections.{$connection}.password");
        $db_port = config("database.connections.{$connection}.port");

        if (!$db_user || !$db_name) {
            $this->error('Error: Database credentials not configured');
            return 1;
        }

        // Create backups directory
        $backup_dir = storage_path('backups');
        if (!File::isDirectory($backup_dir)) {
            File::makeDirectory($backup_dir, 0755, true);
        }

        // Generate filename
        $timestamp = now()->format('Y-m-d-His');
        $backup_file = "{$backup_dir}/db_backup_{$timestamp}.sql";

        $this->info("Starting database backup...");
        $this->line("Database: {$db_name}");
        $this->line("Host: {$db_host}");
        $this->line("Output: {$backup_file}\n");

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
                
                $this->line("✓ Backed up table: {$tableName} (" . $rows->count() . " records)");
            }
            
            $sql .= "SET foreign_key_checks = 1;\n";
            
            // Write to file
            if (File::put($backup_file, $sql)) {
                $fileSize = File::size($backup_file);
                $fileSizeMB = round($fileSize / (1024 * 1024), 2);
                
                $this->newLine();
                $this->info("✓ Backup completed successfully!");
                $this->line("  Tables: {$tableCount}");
                $this->line("  Records: {$recordCount}");
                $this->line("  File: {$backup_file}");
                $this->line("  Size: {$fileSizeMB} MB");
                
                // Clean old backups
                $this->cleanOldBackups($backup_dir, $this->option('keep'));
                
                return 0;
            } else {
                $this->error('✗ Failed to write backup file');
                return 1;
            }
            
        } catch (\Exception $e) {
            $this->error('✗ Backup failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Clean old backup files
     */
    protected function cleanOldBackups($directory, $keep = 7)
    {
        $files = File::files($directory);
        
        // Filter for backup files
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
                $this->line("  [cleanup] Removed old backup: " . $file->getFilename());
            } catch (\Exception $e) {
                $this->line("  [cleanup] Failed to remove: " . $file->getFilename());
            }
        }
    }
}
