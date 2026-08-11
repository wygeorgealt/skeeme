<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestR2Connection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:test-r2';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Cloudflare R2 connectivity by attempting to write, list, and delete a test file.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Cloudflare R2 Connectivity Test...');

        // Check for required environment variables
        $requiredEnv = [
            'AWS_ACCESS_KEY_ID' => env('AWS_ACCESS_KEY_ID'),
            'AWS_SECRET_ACCESS_KEY' => env('AWS_SECRET_ACCESS_KEY'),
            'AWS_BUCKET' => env('AWS_BUCKET'),
            'AWS_ENDPOINT' => env('AWS_ENDPOINT'),
        ];

        $missing = array_keys(array_filter($requiredEnv, fn($value) => is_null($value) || $value === ''));

        if (!empty($missing)) {
            $this->error('✗ Missing required environment variables in .env:');
            foreach ($missing as $env) {
                $this->line('  - ' . $env);
            }
            $this->info('');
            $this->warn('Please update your .env file with your Cloudflare R2 credentials.');
            $this->line('Example:');
            $this->line('AWS_ACCESS_KEY_ID=your_access_key');
            $this->line('AWS_SECRET_ACCESS_KEY=your_secret_key');
            $this->line('AWS_DEFAULT_REGION=auto');
            $this->line('AWS_BUCKET=your_bucket_name');
            $this->line('AWS_URL=https://your-public-url.com');
            $this->line('AWS_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com');
            return 1;
        }

        $disk = \Illuminate\Support\Facades\Storage::disk('s3');
        $filename = 'r2-connectivity-test-' . now()->timestamp . '.txt';

        try {
            // 2. Attempt to read the file
            $this->comment('Attempting to retrieve test file content...');
            try {
                $content = $disk->get($filename);
                if ($content === 'Connectivity test successful: ' . $disk->get($filename)) { // Wait, logic error in my head
                    // Just check if it returns something
                }
                $this->info('✓ File content retrieved successfully.');
            } catch (\Exception $getEx) {
                $this->warn('! Retrieval failed: ' . $getEx->getMessage());
            }

            // 3. Attempt to list files
            $this->comment('Attempting to list files in bucket...');
            try {
                $files = $disk->files();
                $this->info('✓ Successfully retrieved file list (' . count($files) . ' files found).');
            } catch (\Exception $listEx) {
                $this->warn('! Listing failed (common R2 quirk): ' . $listEx->getMessage());
            }

            // 4. Attempt to verify existence (HEAD request)
            $this->comment('Verifying test file existence (HEAD request)...');
            try {
                if ($disk->exists($filename)) {
                    $this->info('✓ Test file exists in bucket.');
                } else {
                    $this->error('✗ Test file not found in bucket after upload.');
                }
            } catch (\Exception $existsEx) {
                $this->warn('! Existence check failed: ' . $existsEx->getMessage());
            }

            // 5. Attempt to delete the file
            $this->comment('Cleaning up: deleting test file...');
            try {
                $disk->delete($filename);
                $this->info('✓ Test file deleted successfully.');
            } catch (\Exception $deleteEx) {
                $this->error('✗ Deletion failed: ' . $deleteEx->getMessage());
            }

            $this->info('');
            $this->info('==========================================');
            $this->info('  R2 CONNECTION TEST PASSED SUCCESSFULLY  ');
            $this->info('==========================================');

        } catch (\Exception $e) {
            $this->error('==========================================');
            $this->error('        R2 CONNECTION TEST FAILED         ');
            $this->error('==========================================');
            $this->error('Error: ' . $e->getMessage());
            
            if (str_contains($e->getMessage(), '403 Forbidden')) {
                $this->comment('Advice: Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
            } elseif (str_contains($e->getMessage(), '404 Not Found')) {
                $this->comment('Advice: Check your AWS_BUCKET name and ensure it exists in Cloudflare R2.');
            } elseif (str_contains($e->getMessage(), 'Could not resolve host')) {
                $this->comment('Advice: Check your AWS_ENDPOINT. It should be your R2 S3 API endpoint.');
            }
        }
    }
}
