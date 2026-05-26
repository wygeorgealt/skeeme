<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearMockUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:clear-mock {--keep=34 : Number of users to keep (first N by ID)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete mock users created during testing, keeping the first N real users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $usersToKeep = (int) $this->option('keep');
        
        $this->info("=== Mock Users Cleanup ===\n");

        // Get current count
        $totalUsers = User::count();
        $usersToDelete = $totalUsers - $usersToKeep;

        $this->line("Current user count: {$totalUsers}");
        $this->line("Users to keep: {$usersToKeep}");
        $this->line("Users to delete: {$usersToDelete}\n");

        if ($usersToDelete <= 0) {
            $this->info("✓ No mock users to delete");
            return 0;
        }

        // Show sample
        $sampleUsers = User::where('id', '>', $usersToKeep)
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at']);

        $this->line("Sample of users to be deleted:");
        foreach ($sampleUsers as $user) {
            $this->line("  - ID {$user->id}: {$user->name} ({$user->email}) - created {$user->created_at->diffForHumans()}");
        }
        $this->newLine();

        // Warning
        $this->warn("WARNING: This will permanently delete {$usersToDelete} users and all their associated data.");
        $this->line("         This includes: exams, answers, enrollments, transactions, grades, sessions, etc.\n");

        // Confirm
        if (!$this->confirm('Do you want to proceed?')) {
            $this->info('Cancelled. No users were deleted.');
            return 0;
        }

        $this->newLine();
        $this->info("Starting deletion...\n");

        try {
            // Begin transaction
            DB::beginTransaction();
            
            // Get user IDs to delete
            $userIds = User::where('id', '>', $usersToKeep)->pluck('id');
            
            // Tables with foreign keys to users
            $tables_with_user_id = [
                'exam_sessions' => 'user_id',
                'exam_answers' => 'student_id',
                'enrollments' => 'student_id',
                'transactions' => 'user_id',
                'ai_gradings' => 'user_id',
                'notes' => 'user_id',
                'grade_items' => 'student_id',
                'exam_attempts' => 'user_id',
                'question_favorites' => 'user_id',
                'notifications' => 'notifiable_id',
                'api_tokens' => 'user_id',
                'sessions' => 'user_id',
                'password_reset_tokens' => 'email',
            ];
            
            $totalDeleted = 0;
            
            foreach ($tables_with_user_id as $table => $column) {
                if (!DB::getSchemaBuilder()->hasTable($table)) {
                    continue;
                }
                
                if ($column === 'email') {
                    $emails = User::where('id', '>', $usersToKeep)->pluck('email');
                    $count = DB::table($table)->whereIn($column, $emails)->delete();
                } else {
                    $count = DB::table($table)->whereIn($column, $userIds)->delete();
                }
                
                if ($count > 0) {
                    $this->line("  Deleted from {$table}: {$count} records");
                    $totalDeleted += $count;
                }
            }
            
            // Delete users
            $deletedUsers = User::where('id', '>', $usersToKeep)->delete();
            $this->line("  Deleted users: {$deletedUsers}");
            $totalDeleted += $deletedUsers;
            
            // Commit
            DB::commit();
            
            $this->newLine();
            $this->info("✓ Cleanup completed successfully!");
            $this->line("  Total records deleted: {$totalDeleted}");
            $this->line("  Remaining users: " . User::count());
            
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("✗ Cleanup failed: " . $e->getMessage());
            $this->line("  No data was modified (transaction rolled back)");
            return 1;
        }
    }
}
