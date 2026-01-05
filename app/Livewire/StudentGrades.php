<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StudentGrades extends Component
{
    public $grades = [];
    public $gpa = null;

    public function mount()
    {
        $this->loadGrades();
    }

    public function loadGrades()
    {
        $user = Auth::user();
        $school = $user->school;
        
        // Default weights if not set: Exam 70%, Test 20%, Assignment 10%
        $weights = $school->grade_weighting ?? [
            'exam' => 70,
            'test' => 20,
            'assignment' => 10,
        ];

        // Fetch published exam sessions
        $sessions = \App\Models\ExamSession::where('student_id', $user->id)
            ->where('status', 'published')
            ->with(['exam.course'])
            ->get();

        // Group sessions by course
        $groupedByCourse = $sessions->groupBy('exam.course_id');

        $this->grades = $groupedByCourse->map(function ($courseSessions, $courseId) use ($weights) {
            $course = $courseSessions->first()->exam->course;
            
            // Separate sessions by category
            $categories = [
                'exam' => $courseSessions->filter(fn($s) => ($s->exam->category ?? 'exam') === 'exam'),
                'test' => $courseSessions->filter(fn($s) => ($s->exam->category ?? 'exam') === 'test'),
                'assignment' => $courseSessions->filter(fn($s) => ($s->exam->category ?? 'exam') === 'assignment'),
            ];

            // Calculate weighted percentage
            $finalPercentage = 0;
            $totalWeightUsed = 0;

            foreach ($categories as $type => $sessions) {
                if ($sessions->count() > 0) {
                    $avgPercentage = $sessions->map(function($s) {
                        $total = $s->exam->total_marks > 0 ? $s->exam->total_marks : 100;
                        return ($s->score / $total) * 100;
                    })->average();

                    $weight = $weights[$type] ?? 0;
                    $finalPercentage += ($avgPercentage * ($weight / 100));
                    $totalWeightUsed += $weight;
                }
            }

            // Normalize if not all categories have data (to avoid penalizing for missing optional tests)
            if ($totalWeightUsed > 0 && $totalWeightUsed < 100) {
                $finalPercentage = ($finalPercentage / $totalWeightUsed) * 100;
            }

            $letterGrade = $this->calculateGrade($finalPercentage);
            
            return (object)[
                'course_name' => $course->name ?? 'N/A',
                'course_code' => $course->code ?? 'N/A',
                'final_percentage' => round($finalPercentage, 1),
                'grade' => $letterGrade,
                'points' => $this->getGradePoint($letterGrade),
                'category_breakdown' => $categories // For debugging/detailed view
            ];
        })->values();

        // Calculate final GPA
        $totalPoints = $this->grades->sum('points');
        $totalCourses = $this->grades->count();
        $this->gpa = $totalCourses > 0 ? round($totalPoints / $totalCourses, 2) : 0.00;
    }

    private function calculateGrade($percentage)
    {
        if ($percentage >= 70) return 'A';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 45) return 'D';
        return 'F';
    }

    private function getGradePoint($letter)
    {
        return match($letter) {
            'A' => 4.0,
            'B' => 3.0,
            'C' => 2.0,
            'D' => 1.0,
            default => 0.0,
        };
    }

    public function render()
    {
        return view('livewire.student-grades');
    }
}
