<?php

/**
 * Clear all exam sessions for testing purposes
 * This script deletes all exam sessions from the database
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ExamSession;

echo "🗑️  Clearing all exam sessions...\n\n";

$count = ExamSession::count();
echo "Found {$count} exam session(s) to delete.\n";

if ($count > 0) {
    ExamSession::truncate();
    echo "✅ Successfully deleted all exam sessions!\n";
} else {
    echo "ℹ️  No exam sessions found.\n";
}

echo "\nDone!\n";
