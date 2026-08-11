<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupOldUploads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-old-uploads';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete student document uploads older than 14 days from Cloudflare R2';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting cleanup of student uploads older than 14 days...");

        $diskName = config('filesystems.default');
        $disk = \Illuminate\Support\Facades\Storage::disk($diskName);
        $prefix = 'student-uploads';

        if (!$disk->exists($prefix)) {
            $this->warn("Prefix '{$prefix}' does not exist on disk '{$diskName}'. Nothing to clean.");
            return;
        }

        $files = $disk->allFiles($prefix);
        $count = 0;
        $now = now();

        foreach ($files as $file) {
            try {
                $lastModified = $disk->lastModified($file);
                $fileDate = \Carbon\Carbon::createFromTimestamp($lastModified);

                if ($now->diffInDays($fileDate) >= 14) {
                    $disk->delete($file);
                    $count++;
                    $this->line("Deleted: {$file} (Modified: {$fileDate->toDateTimeString()})");
                }
            } catch (\Exception $e) {
                $this->error("Failed to process file: {$file}. Error: " . $e->getMessage());
            }
        }

        $this->info("Cleanup complete. Deleted {$count} files.");
    }
}
