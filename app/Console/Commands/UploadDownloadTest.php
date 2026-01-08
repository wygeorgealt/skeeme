<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UploadDownloadTest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:persistent-test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform a persistent upload/download test to Cloudflare R2.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Persistent R2 Upload/Download Test...');
        $disk = \Illuminate\Support\Facades\Storage::disk('s3');
        $filename = 'skeeme-test-' . now()->timestamp . '.txt';
        $content = "This is a persistent test file uploaded on " . now()->toDateTimeString() . " to verify Cloudflare R2 storage.";

        try {
            // 1. Upload
            $this->comment("Uploading: {$filename}");
            $disk->put($filename, $content);
            $this->info('✓ Upload successful.');

            // 2. Download
            $this->comment("Downloading file back to verify...");
            $downloadedContent = $disk->get($filename);
            
            if ($downloadedContent === $content) {
                $this->info('✓ Download successful (content matches).');
            } else {
                $this->error('✗ Download failed (content mismatch).');
                $this->line("Expected: " . $content);
                $this->line("Received: " . $downloadedContent);
            }

            // 3. URLs
            $this->info('');
            $this->info('Test completed. File remains in bucket.');
            $this->line("File Name: {$filename}");
            
            try {
                $url = $disk->url($filename);
                $this->info("Public URL (if bucket is public): {$url}");
            } catch (\Exception $e) {
                $this->warn("Could not generate URL: " . $e->getMessage());
            }

            $this->info('');
            $this->info('Summary: Use Cloudflare dashboard to verify completion.');

        } catch (\Exception $e) {
            $this->error('Test Failed: ' . $e->getMessage());
        }
    }
}
