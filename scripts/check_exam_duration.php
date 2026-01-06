<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Exam;

$examId = 642; // From logs
// Also check for the most recent exam created if 642 doesn't exist
$exam = Exam::find($examId);

if ($exam) {
    echo "Exam ID: {$exam->id}\n";
    echo "Title: {$exam->title}\n";
    echo "Duration: " . ($exam->duration ?? 'NULL') . "\n";
    echo "Start Date: " . ($exam->exam_date ?? 'NULL') . "\n";
    echo "End Date: " . ($exam->end_date ?? 'NULL') . "\n";
} else {
    echo "Exam 642 not found.\n";
    
    // Find latest exam
    $latest = Exam::latest()->first();
    if ($latest) {
        echo "Latest Exam ID: {$latest->id}\n";
        echo "Title: {$latest->title}\n";
        echo "Duration: " . ($latest->duration ?? 'NULL') . "\n";
    }
}
