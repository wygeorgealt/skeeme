<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlagiarismCheck extends Model
{
    protected $fillable = [
        'exam_session_id',
        'question_id',
        'student_answer',
        'plagiarism_score',
        'plagiarism_status',
        'similar_content',
        'sources',
        'flagged_at',
        'penalty_applied',
        'penalty_type',
        'penalty_amount',
        'checked_at',
        'metadata',
    ];

    protected $casts = [
        'plagiarism_score' => 'float',
        'sources' => 'array',
        'similar_content' => 'array',
        'metadata' => 'array',
        'flagged_at' => 'datetime',
        'checked_at' => 'datetime',
        'penalty_applied' => 'boolean',
    ];

    /**
     * Get the exam session
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    /**
     * Get the question
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Check if this answer is flagged as plagiarism
     */
    public function isFlagged(): bool
    {
        return $this->plagiarism_status === 'flagged' && $this->flagged_at !== null;
    }

    /**
     * Get severity level based on plagiarism score
     */
    public function getSeverityLevel(): string
    {
        if ($this->plagiarism_score >= 0.8) {
            return 'critical';
        } elseif ($this->plagiarism_score >= 0.6) {
            return 'high';
        } elseif ($this->plagiarism_score >= 0.4) {
            return 'medium';
        } elseif ($this->plagiarism_score >= 0.2) {
            return 'low';
        }
        return 'minimal';
    }

    /**
     * Get severity label
     */
    public function getSeverityLabel(): string
    {
        return match ($this->getSeverityLevel()) {
            'critical' => 'Critical - Very High Match',
            'high' => 'High - Significant Match',
            'medium' => 'Medium - Moderate Match',
            'low' => 'Low - Minor Match',
            default => 'Minimal - Very Low Match',
        };
    }
}
