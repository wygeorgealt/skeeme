<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIGrading extends Model
{
    use HasFactory;

    protected $table = 'ai_gradings';

    protected $fillable = [
        'exam_answer_id',
        'exam_session_id',
        'grading_method',
        'marks_awarded',
        'confidence_score',
        'confidence_threshold',
        'reasoning',
        'analysis_details',
        'ai_feedback',
        'feedback',
        'feedback_provided_by',
        'feedback_provided_at',
        'plagiarism_score',
        'consistency_score',
        'status',
        'reviewed_by',
        'lecturer_override_reason',
        'lecturer_override_marks',
        'reviewed_at',
    ];

    protected $casts = [
        'marks_awarded' => 'decimal:2',
        'confidence_score' => 'decimal:2',
        'confidence_threshold' => 'decimal:2',
        'plagiarism_score' => 'decimal:2',
        'consistency_score' => 'decimal:2',
        'lecturer_override_marks' => 'decimal:2',
        'analysis_details' => 'array',
        'reviewed_at' => 'datetime',
        'feedback_provided_at' => 'datetime',
    ];

    /**
     * Relationship to ExamAnswer
     */
    public function examAnswer()
    {
        return $this->belongsTo(ExamAnswer::class);
    }

    /**
     * Relationship to ExamSession
     */
    public function examSession()
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Relationship to User (reviewer/lecturer)
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if grading requires manual review
     */
    public function requiresReview(): bool
    {
        return $this->confidence_score < $this->confidence_threshold
            || $this->status === 'pending_review';
    }

    /**
     * Check if grading has been reviewed
     */
    public function isReviewed(): bool
    {
        return $this->status !== 'pending_review';
    }

    /**
     * Get final marks (considering overrides)
     */
    public function getFinalMarks(): float
    {
        if ($this->lecturer_override_marks !== null) {
            return (float) $this->lecturer_override_marks;
        }

        return (float) $this->marks_awarded;
    }

    /**
     * Override grading with manual mark
     */
    public function override(float $marks, string $reason, int $lecturerId): void
    {
        $this->update([
            'lecturer_override_marks' => $marks,
            'lecturer_override_reason' => $reason,
            'reviewed_by' => $lecturerId,
            'reviewed_at' => now(),
            'status' => 'revised',
        ]);
    }

    /**
     * Approve automated grading
     */
    public function approve(int $lecturerId): void
    {
        $this->update([
            'reviewed_by' => $lecturerId,
            'reviewed_at' => now(),
            'status' => 'approved',
        ]);
    }

    /**
     * Reject grading and mark for manual review
     */
    public function reject(string $reason, int $lecturerId): void
    {
        $this->update([
            'status' => 'rejected',
            'lecturer_override_reason' => $reason,
            'reviewed_by' => $lecturerId,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Get confidence rating (low, medium, high, very high)
     */
    public function getConfidenceRating(): string
    {
        $score = (float) $this->confidence_score;

        if ($score >= 90) {
            return 'very_high';
        } elseif ($score >= 75) {
            return 'high';
        } elseif ($score >= 60) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Get grading method display name
     */
    public function getMethodLabel(): string
    {
        return match ($this->grading_method) {
            'auto_mark' => 'Auto-marked (MCQ)',
            'ai_essay' => 'AI Graded (Essay)',
            'rubric' => 'Rubric-based (AI)',
            default => 'Unknown',
        };
    }
}
