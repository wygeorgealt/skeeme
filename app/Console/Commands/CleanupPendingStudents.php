<?php
 
namespace App\Console\Commands;
 
use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Log;
 
class CleanupPendingStudents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-pending-students';
 
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes student accounts that have been in pending status for more than 2 hours';
 
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of pending student accounts...');
 
        $threshold = now()->subHours(2);
 
        try {
            $deleted = User::where('role', 'student')
                ->where('status', 'pending')
                ->where('created_at', '<', $threshold)
                ->delete();
                
            $message = "Successfully deleted {$deleted} stale pending student accounts.";
            $this->info($message);
            Log::info("[Cleanup] " . $message);
        } catch (\Exception $e) {
            $this->error("Failed to delete stale accounts: " . $e->getMessage());
            Log::error("[Cleanup] Error deleting stale student accounts: " . $e->getMessage());
        }
    }
}
