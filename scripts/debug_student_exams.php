<?php

/**
 * Debug script to check student enrollments and available exams
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Exam;

$studentId = 17;
$user = User::find($studentId);

echo "=== Student: {$user->name} (ID: {$user->id}) ===\n\n";

echo "Enrolled Courses:\n";
$enrolledCourseIds = $user->enrollments->pluck('id')->toArray();
foreach ($user->enrollments as $course) {
    echo "  - {$course->name} (ID: {$course->id})\n";
}

if (empty($enrolledCourseIds)) {
    echo "  (No enrollments found)\n";
}

echo "\n=== All Published Exams ===\n";
$exams = Exam::where('status', 'published')->with('course')->get();
foreach ($exams as $exam) {
    $isEnrolled = in_array($exam->course_id, $enrolledCourseIds);
    $status = $isEnrolled ? "✅ ENROLLED" : "❌ NOT ENROLLED";
    $courseName = $exam->course ? $exam->course->name : 'N/A';
    echo "  - {$exam->title}\n";
    echo "    Course: {$courseName} (ID: {$exam->course_id}) | {$status}\n";
    echo "    Start: {$exam->exam_date} | End: {$exam->end_date}\n\n";
}

echo "Total published exams: " . count($exams) . "\n";
echo "Student enrolled in " . count($enrolledCourseIds) . " course(s)\n";
echo "Done!\n";
