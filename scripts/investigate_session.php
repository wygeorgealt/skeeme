<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ExamSession;

$session = ExamSession::find(1);

if ($session) {
    echo "Session ID: {$session->id}\n";
    echo "Status: {$session->status}\n";
    echo "Started At: " . ($session->started_at ?? 'NULL') . "\n";
    echo "Submitted At: " . ($session->submitted_at ?? 'NULL') . "\n";
    
    $exam = $session->exam;
    if ($exam) {
        echo "Exam ID: {$exam->id}\n";
        echo "Title: {$exam->title}\n";
        echo "Duration: " . ($exam->duration ?? 'NULL') . "\n";
    } else {
        echo "EXAM NOT FOUND!\n";
    }
} else {
    echo "Session 1 NOT FOUND\n";
    
    // Check if there are ANY sessions
    $count = ExamSession::count();
    echo "Total Sessions in DB: $count\n";
    if ($count > 0) {
        $last = ExamSession::latest()->first();
        echo "Last Session ID: {$last->id}\n";
    }
}
