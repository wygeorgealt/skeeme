<?php

use App\Models\ExamSession;

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$session = ExamSession::with('exam.questions')->find(1);

if (!$session) {
    echo "Session 1 not found.\n";
    exit;
}

echo "Exam: " . $session->exam->title . "\n";
echo "Questions Count (Relation): " . $session->exam->questions()->count() . "\n";

$questions = \App\Models\Question::where('question_bank_id', $session->exam->question_bank_id)->get();
echo "Questions in Bank ({$session->exam->question_bank_id}): " . $questions->count() . "\n";

foreach ($questions as $q) {
    echo "ID: {$q->id} | Type: '{$q->question_type}'\n";
}
