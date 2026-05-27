<?php

namespace App\Console\Commands;

use Aws\S3\S3Client;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestBackupRetention extends Command
{
    /**
     * @var string
     */
    protected $signature = 'database:backup:test
                            {--prefix=DB backups/retention-tests : R2 path prefix for the test object}
                            {--lock-mode=COMPLIANCE : Retention mode (COMPLIANCE|GOVERNANCE)}
                            {--lock-days=1 : Retention period in days}
                            {--cleanup : Try deleting test object after verification (works only if not retention-locked)}';

    /**
     * @var string
     */
    protected $description = 'Verify Cloudflare R2 retention lock for backup objects and print clear OK/FAILED status.';

    public function handle(): int
    {
        $this->line('Starting backup retention verification...');

        $required = [
            'AWS_ACCESS_KEY_ID' => env('AWS_ACCESS_KEY_ID'),
            'AWS_SECRET_ACCESS_KEY' => env('AWS_SECRET_ACCESS_KEY'),
            'AWS_BUCKET' => env('AWS_BUCKET'),
            'AWS_ENDPOINT' => env('AWS_ENDPOINT'),
        ];

        $missing = array_keys(array_filter($required, fn ($v) => blank($v)));
        if (!empty($missing)) {
            $this->error('R2 retention FAILED');
            $this->error('Missing required environment variables:');
            foreach ($missing as $name) {
                $this->line(" - {$name}");
            }
            return self::FAILURE;
        }

        $mode = strtoupper((string) $this->option('lock-mode'));
        if (!in_array($mode, ['COMPLIANCE', 'GOVERNANCE'], true)) {
            $this->error('R2 retention FAILED');
            $this->error('Invalid --lock-mode. Use COMPLIANCE or GOVERNANCE.');
            return self::FAILURE;
        }

        $days = max(1, (int) $this->option('lock-days'));
        $bucket = (string) env('AWS_BUCKET');
        $prefix = trim((string) $this->option('prefix'), '/');
        $retainUntil = CarbonImmutable::now('UTC')->addDays($days);
        $testKey = sprintf(
            '%s/%s/retention-test-%s.txt',
            $prefix,
            now('UTC')->format('Y/m/d'),
            now('UTC')->format('Ymd_His')
        );

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

        try {
            $this->line("Bucket: {$bucket}");
            $this->line("Test object: {$testKey}");
            $this->line("Retention mode: {$mode}");
            $this->line('Retention until: ' . $retainUntil->toIso8601String());

            $client->putObject([
                'Bucket' => $bucket,
                'Key' => $testKey,
                'Body' => 'backup retention test generated at ' . now('UTC')->toIso8601String(),
                'ContentType' => 'text/plain',
            ]);

            $actualMode = '';
            $actualDate = null;
            $retentionApiSupported = true;

            try {
                $client->putObjectRetention([
                    'Bucket' => $bucket,
                    'Key' => $testKey,
                    'Retention' => [
                        'Mode' => $mode,
                        'RetainUntilDate' => $retainUntil,
                    ],
                ]);

                $retention = $client->getObjectRetention([
                    'Bucket' => $bucket,
                    'Key' => $testKey,
                ]);

                $actual = $retention['Retention'] ?? [];
                $actualMode = (string) ($actual['Mode'] ?? '');
                $actualDate = $actual['RetainUntilDate'] ?? null;

                if ($actualMode !== $mode || !$actualDate) {
                    throw new \RuntimeException('Retention metadata missing or mismatched after write.');
                }
            } catch (\Throwable $retentionEx) {
                $message = $retentionEx->getMessage();
                $retentionApiSupported = !(str_contains($message, 'NotImplemented') || str_contains($message, '501'));
                if ($retentionApiSupported) {
                    throw $retentionEx;
                }
                $this->warn('PutObjectRetention API not implemented on this endpoint; validating via bucket lock behavior.');
            }

            if (!$retentionApiSupported) {
                try {
                    $client->deleteObject([
                        'Bucket' => $bucket,
                        'Key' => $testKey,
                    ]);
                    throw new \RuntimeException(
                        'Delete succeeded. Bucket lock did not block deletion for this object.'
                    );
                } catch (\Throwable $deleteEx) {
                    $deleteMsg = $deleteEx->getMessage();
                    $blocked = str_contains($deleteMsg, 'AccessDenied')
                        || str_contains($deleteMsg, 'forbidden')
                        || str_contains($deleteMsg, 'cannot be deleted')
                        || str_contains($deleteMsg, 'Object is locked')
                        || str_contains($deleteMsg, 'ObjectLockedByBucketPolicy')
                        || str_contains($deleteMsg, '409 Conflict');
                    if (!$blocked) {
                        throw new \RuntimeException('Delete failed, but not with a clear lock-denied response: ' . $deleteMsg);
                    }
                    $this->line('Delete blocked by bucket lock (expected): ' . $deleteMsg);
                }
            } elseif ((bool) $this->option('cleanup')) {
                try {
                    $client->deleteObject([
                        'Bucket' => $bucket,
                        'Key' => $testKey,
                    ]);
                    $this->warn('Cleanup succeeded. This can happen if retention period/mode allows this token to bypass.');
                } catch (\Throwable $deleteEx) {
                    $this->line('Cleanup blocked by retention policy (expected): ' . $deleteEx->getMessage());
                }
            }

            $this->info('R2 retention OK');
            if ($retentionApiSupported) {
                $this->line('Verified mode: ' . $actualMode);
                $this->line('Verified retain-until: ' . $actualDate);
            } else {
                $this->line('Verified via bucket lock delete protection.');
            }

            Log::info('Backup retention health check passed', [
                'bucket' => $bucket,
                'test_key' => $testKey,
                'retention_api_supported' => $retentionApiSupported,
                'mode' => $mode,
            ]);
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('R2 retention FAILED');
            $this->error($e->getMessage());

            if (str_contains($e->getMessage(), 'AccessDenied')) {
                $this->line('Hint: Ensure token has PutObjectRetention/GetObjectRetention permissions.');
            } elseif (str_contains($e->getMessage(), 'NotImplemented') || str_contains($e->getMessage(), '501')) {
                $this->line('Hint: This R2 endpoint does not support object retention API.');
                $this->line('Hint: For true immutability, use storage that supports Object Lock, or set BACKUP_REQUIRE_LOCK=true to block non-locked uploads.');
            } elseif (str_contains($e->getMessage(), 'InvalidRequest')) {
                $this->line('Hint: Ensure your R2 bucket has Object Lock enabled.');
            }

            Log::critical('Backup retention health check failed', [
                'bucket' => $bucket ?? null,
                'mode' => $mode ?? null,
                'error' => $e->getMessage(),
            ]);

            return self::FAILURE;
        }
    }
}

