<?php

/**
 * Clear Mock Users Script
 * 
 * Removes all test/mock users created during the accidental database reset
 * and keeps the first 34 real users.
 * 
 * Usage: php scripts/clear_mock_users.php
 */

require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Initialize app
$app = require_once __DIR__ . '/../bootstrap/app.php';
$container = $app->make('Illuminate\Contracts\Container\Container');

echo "=== Mock Users Cleanup ===\n\n";

// Get current user count
$totalUsers = User::count();
$usersToKeep = 34;
$usersToDelete = $totalUsers - $usersToKeep;

echo "Current user count: {$totalUsers}\n";
echo "Users to keep: {$usersToKeep}\n";
echo "Users to delete: {$usersToDelete}\n\n";

if ($usersToDelete <= 0) {
    echo "✓ No mock users to delete\n";
    exit(0);
}

// Get sample of users to be deleted
$sampleUsers = User::where('id', '>', $usersToKeep)
    ->limit(5)
    ->get(['id', 'name', 'email', 'created_at']);

echo "Sample of users to be deleted:\n";
foreach ($sampleUsers as $user) {
    echo "  - ID {$user->id}: {$user->name} ({$user->email}) - created {$user->created_at->diffForHumans()}\n";
}
echo "\n";

// Confirm before deletion
echo "⚠️  WARNING: This will permanently delete {$usersToDelete} users and all their associated data.\n";
echo "   This includes: exams, answers, enrollments, transactions, grades, sessions, etc.\n\n";

// Read user confirmation
echo "Type 'YES' to confirm deletion: ";
$input = trim(fgets(STDIN));

if ($input !== 'YES') {
    echo "Cancelled. No users were deleted.\n";
    exit(0);
}

echo "\nStarting deletion...\n\n";

try {
    // Begin transaction
    DB::beginTransaction();
    
    // Get all user IDs to delete
    $userIds = User::where('id', '>', $usersToKeep)->pluck('id');
    
    // Delete related data (cascade)
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
    
    $deletedCounts = [];
    
    foreach ($tables_with_user_id as $table => $column) {
        if (!DB::getSchemaBuilder()->hasTable($table)) {
            continue;
        }
        
        if ($column === 'email') {
            // Special case for password_reset_tokens (uses email)
            $emails = User::where('id', '>', $usersToKeep)->pluck('email');
            $count = DB::table($table)->whereIn($column, $emails)->delete();
        } else {
            $count = DB::table($table)->whereIn($column, $userIds)->delete();
        }
        
        if ($count > 0) {
            $deletedCounts[$table] = $count;
            echo "  Deleted from {$table}: {$count} records\n";
        }
    }
    
    // Delete users
    $deletedUsers = User::where('id', '>', $usersToKeep)->delete();
    echo "  Deleted users: {$deletedUsers}\n";
    
    // Commit transaction
    DB::commit();
    
    echo "\n✓ Cleanup completed successfully!\n";
    echo "  Total records deleted: " . array_sum($deletedCounts) + $deletedUsers . "\n";
    echo "  Remaining users: " . User::count() . "\n";
    
    exit(0);
    
} catch (Exception $e) {
    DB::rollBack();
    echo "\n✗ Cleanup failed: " . $e->getMessage() . "\n";
    echo "  No data was modified (transaction rolled back)\n";
    exit(1);
}
