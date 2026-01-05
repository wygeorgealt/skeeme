<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    /**
     * Determine whether the user can view the exam.
     */
    public function view(User $user, Exam $exam): bool
    {
        // Lecturer can view exams they created
        if ($exam->lecturer_id === $user->id) {
            return true;
        }

        // Lecturer can view exams from courses they teach
        $course = $exam->course;
        if ($course) {
            return $course->lecturers()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create exams.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the exam.
     */
    public function update(User $user, Exam $exam): bool
    {
        // Only the creator can update
        return $exam->lecturer_id === $user->id;
    }

    /**
     * Determine whether the user can delete the exam.
     */
    public function delete(User $user, Exam $exam): bool
    {
        // Only the creator can delete
        return $exam->lecturer_id === $user->id;
    }
}
