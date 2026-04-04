<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupProduction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-production {--force : Force the cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clears all seeded students, lecturers, and schools, preserving core admin accounts.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $keepEmails = ['admin@skeeme.dev', 'creator@skeeme.com'];
        $this->info('Starting database cleanup...');

        // 1. Identify users to keep
        $keepers = \App\Models\User::whereIn('email', $keepEmails)->get();
        if ($keepers->isEmpty()) {
            $this->error('CRITICAL ERROR: No core admin accounts found! Aborting for safety.');
            return;
        }

        $this->info('Keeping these accounts: ' . $keepers->pluck('email')->implode(', '));
        $keeperIds = $keepers->pluck('id')->toArray();

        // 2. Identify schools to clear
        $schoolCount = \App\Models\School::count();
        $this->info("Identified {$schoolCount} schools to clear.");

        // 3. Clear Students/Lecturers (Cascades should handle subscriptions/streaks/etc.)
        $userCount = \App\Models\User::whereNotIn('id', $keeperIds)->count();
        $this->warn("About to delete {$userCount} users...");

        if ($this->option('force') || $this->confirm('Do you want to proceed with the deletion?', true)) {
            $this->info('Cleaning data...');
            // Detach schools from remaining admins so we can clear schools
            \App\Models\User::whereIn('id', $keeperIds)->update(['school_id' => null]);

            // Truncate schools (must disable FK checks or handle cascades)
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            
            // Delete users first
            \App\Models\User::whereNotIn('id', $keeperIds)->delete();
            
            // Truncate Schools and related core data
            \App\Models\School::truncate();
            \App\Models\SchoolClass::truncate();
            \App\Models\Course::truncate();
            
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

            $this->info("Cleanup complete. Remaining Users: " . \App\Models\User::count());
        } else {
            $this->info('Cleanup cancelled.');
        }
    }
}
