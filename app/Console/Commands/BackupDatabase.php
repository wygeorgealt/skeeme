<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Aws\S3\S3Client;
use Carbon\CarbonImmutable;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'database:backup
                            {--keep-local=240 : Number of local backups to keep}
                            {--prefix=DB backups : R2 key prefix for uploaded backups}
                            {--lock-mode=COMPLIANCE : Object lock mode: COMPLIANCE|GOVERNANCE}
                            {--lock-days=365 : Object lock retention days}
                            {--require-lock : Fail backup if object retention lock cannot be applied}
                            {--skip-upload : Only write local backup, do not upload}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a compressed MySQL backup and upload it to R2 with object lock';

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
        $db_password = (string) config("database.connections.{$connection}.password");
        $db_port = (string) config("database.connections.{$connection}.port", '3306');

        if (!$db_user || !$db_name) {
            $this->error('Error: Database credentials not configured');
            return 1;
        }

        if (!is_executable('/usr/bin/mysqldump') && !is_executable('/usr/local/bin/mysqldump')) {
            $this->error('mysqldump is not available in this runtime.');
            return 1;
        }

        $backup_dir = storage_path('backups');
        if (!File::isDirectory($backup_dir)) {
            File::makeDirectory($backup_dir, 0755, true);
        }

        $timestamp = now('UTC')->format('Y-m-d_His');
        $baseFilename = "db_backup_{$timestamp}.sql.gz";
        $backup_file = "{$backup_dir}/{$baseFilename}";

        $this->info('Starting database backup...');
        $this->line("Database: {$db_name}");
        $this->line("Host: {$db_host}");
        $this->line("Port: {$db_port}");
        $this->line("Output: {$backup_file}");

        try {
            $this->dumpDatabase($db_host, $db_port, $db_name, $db_user, $db_password, $backup_file);

            $fileSize = File::size($backup_file);
            $fileSizeMB = round($fileSize / (1024 * 1024), 2);
            $this->info("✓ Local backup created: {$baseFilename} ({$fileSizeMB} MB)");

            if (!$this->option('skip-upload')) {
                $remotePath = trim((string) $this->option('prefix'), '/') . '/' . now('UTC')->format('Y/m/d') . '/' . $baseFilename;
                $requireLock = (bool) $this->option('require-lock') || filter_var(env('BACKUP_REQUIRE_LOCK', false), FILTER_VALIDATE_BOOLEAN);
                $this->uploadToR2WithLock($backup_file, $remotePath, $requireLock);
                $this->info("✓ Uploaded to R2: {$remotePath}");
            }

            $this->cleanOldBackups($backup_dir, (int) $this->option('keep-local'));
            $this->info('✓ Backup flow completed successfully.');
            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Backup failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Execute mysqldump and gzip output to a local file.
     */
    protected function dumpDatabase(string $host, string $port, string $database, string $user, string $password, string $targetPath): void
    {
        $dumpBin = is_executable('/usr/bin/mysqldump') ? '/usr/bin/mysqldump' : '/usr/local/bin/mysqldump';

        $process = new Process([
            '/bin/sh',
            '-lc',
            sprintf(
                'MYSQL_PWD=%s %s --host=%s --port=%s --user=%s --single-transaction --quick --skip-lock-tables --routines --triggers --events %s | gzip -9 > %s',
                escapeshellarg($password),
                escapeshellarg($dumpBin),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($user),
                escapeshellarg($database),
                escapeshellarg($targetPath),
            )
        ]);

        $process->setTimeout(60 * 20);
        $process->mustRun();
    }

    /**
     * Upload backup to R2 and enforce immutable retention headers.
     */
    protected function uploadToR2WithLock(string $localPath, string $remotePath, bool $requireLock): void
    {
        $disk = Storage::disk('s3');
        $disk->put($remotePath, fopen($localPath, 'r'));

        $client = new S3Client([
            'version' => 'latest',
            'region' => env('AWS_DEFAULT_REGION', 'auto'),
            'endpoint' => env('AWS_ENDPOINT'),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
            'use_path_style_endpoint' => filter_var(env('AWS_USE_PATH_STYLE_ENDPOINT', true), FILTER_VALIDATE_BOOLEAN),
        ]);

        $bucket = (string) env('AWS_BUCKET');
        $mode = strtoupper((string) $this->option('lock-mode'));
        if (!in_array($mode, ['COMPLIANCE', 'GOVERNANCE'], true)) {
            throw new \RuntimeException('Invalid lock mode. Use COMPLIANCE or GOVERNANCE.');
        }

        $retainUntil = CarbonImmutable::now('UTC')->addDays((int) $this->option('lock-days'));

        try {
            $client->putObjectRetention([
                'Bucket' => $bucket,
                'Key' => $remotePath,
                'Retention' => [
                    'Mode' => $mode,
                    'RetainUntilDate' => $retainUntil,
                ],
            ]);
            $this->line("✓ Retention lock applied ({$mode} until {$retainUntil->toIso8601String()})");
        } catch (\Throwable $e) {
            $message = $e->getMessage();
            $unsupported = str_contains($message, 'NotImplemented')
                || str_contains($message, 'PutObjectRetention not implemented')
                || str_contains($message, '501');

            if ($unsupported && !$requireLock) {
                $this->warn('! Retention lock is not supported by this R2 endpoint. Backup uploaded WITHOUT immutability.');
                $this->warn('! Set BACKUP_REQUIRE_LOCK=true to fail fast until immutable storage is available.');
            } else {
                throw $e;
            }
        }

        $client->headObject([
            'Bucket' => $bucket,
            'Key' => $remotePath,
        ]);
    }

    /**
     * Clean old local backup files
     */
    protected function cleanOldBackups($directory, $keep = 7)
    {
        $files = File::files($directory);
        
        // Filter for backup files
        $backups = array_filter($files, function ($file) {
            return preg_match('/db_backup_\d{4}-\d{2}-\d{2}_\d{6}\.sql\.gz/', $file->getFilename());
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
