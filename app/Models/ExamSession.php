<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'status',
        'started_at',
        'submitted_at',
        'graded_at',
        'time_spent_seconds',
        'questions_answered',
        'score',
        'answers',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'answers' => 'array',
        'metadata' => 'array',
        'score' => 'decimal:2',
    ];

    /**
     * Relationship to Exam
     */
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Relationship to User (Student)
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Relationship to ExamAnswers
     */
    public function answers()
    {
        return $this->hasMany(ExamAnswer::class);
    }

    /**
     * Check if session is still active (not submitted)
     */
    public function isActive(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if session has expired based on exam duration
     */
    public function hasExpired(): bool
    {
        if (!$this->started_at || !$this->exam->duration) {
            return false;
        }

        $expiresAt = $this->started_at->copy()->addMinutes($this->exam->duration);
        return now()->isAfter($expiresAt);
    }

    /**
     * Get time remaining in seconds
     */
    public function getTimeRemainingSeconds(): int
    {
        if (!$this->exam->duration) {
            return 999999;
        }

        if (!$this->started_at) {
            return $this->exam->duration * 60;
        }

        $expiresAt = $this->started_at->copy()->addMinutes($this->exam->duration);
        
        // Use false to get signed value (negative if expired)
        return (int) now()->diffInSeconds($expiresAt, false);
    }

    /**
     * Submit the exam session
     */
    public function submit(): void
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Get session progress percentage
     */
    public function getProgressPercentage(): int
    {
        if (!$this->exam->questions || count($this->exam->questions) === 0) {
            return 0;
        }

        $total = count($this->exam->questions);
        $answered = $this->questions_answered;

        return (int) (($answered / $total) * 100);
    }

    /**
     * Check if the student passed the exam
     */
    public function hasPassed(): ?bool
    {
        if ($this->score === null || !$this->exam->passing_marks) {
            return null;
        }

        return $this->score >= $this->exam->passing_marks;
    }

    /**
     * Calculate and return total score from answers
     */
    public function calculateTotalScore(): float
    {
        if ($this->relationLoaded('answers')) {
            return (float) $this->getRelation('answers')->sum('marks_obtained');
        }

        return (float) $this->answers()->sum('marks_obtained');
    }
}
