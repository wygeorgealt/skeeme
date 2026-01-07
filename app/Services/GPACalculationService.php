<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Grade;
use App\Models\School;

class GPACalculationService
{
    /**
     * Calculate and return the Grade Point for a given score.
     * Assumes a standard 5.0 scale unless school config overrides.
     */
    public function calculateGradePoint(float $score, School $school = null): float
    {
        // TODO: Use $school->grading_scale if available for custom logic
        // Standard 5.0 Scale (Nigeria/General)
        if ($score >= 70) return 5.0; // A
        if ($score >= 60) return 4.0; // B
        if ($score >= 50) return 3.0; // C
        if ($score >= 45) return 2.0; // D
        if ($score >= 40) return 1.0; // E
        return 0.0; // F
    }

    /**
     * Calculate the Letter Grade for a given score.
     */
    public function calculateLetterGrade(float $score, School $school = null): string
    {
        if ($score >= 70) return 'A';
        if ($score >= 60) return 'B';
        if ($score >= 50) return 'C';
        if ($score >= 45) return 'D';
        if ($score >= 40) return 'E';
        return 'F';
    }

    /**
     * Update the student's cumulative GPA.
     * This should be called whenever a new final grade is published.
     */
    public function updateStudentGPA(User $student)
    {
        $grades = Grade::where('student_id', $student->id)->get();

        if ($grades->isEmpty()) {
            $student->update(['gpa' => 0.00]);
            return 0.00;
        }

        $totalPoints = 0;
        $totalUnits = 0;

        foreach ($grades as $grade) {
            // Ensure credit units are available, fallback to course default or 3
            $units = $grade->credit_units ?? $grade->course->credit_units ?? 3;
            
            // Calculate grade point for this specific grade
            $gradePoint = $this->calculateGradePoint($grade->score, $student->school);

            $totalPoints += ($gradePoint * $units);
            $totalUnits += $units;
        }

        $gpa = $totalUnits > 0 ? round($totalPoints / $totalUnits, 2) : 0.00;

        $student->update(['gpa' => $gpa]);

        return $gpa;
    }
}
