<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'question_index',
        'question_id',
        'student_answer',
        'marks_obtained',
        'marking_status',
        'grading_details',
        'feedback',
        'answered_at',
    ];

    protected $casts = [
        'answered_at' => 'datetime',
        'grading_details' => 'array',
        'marks_obtained' => 'decimal:2',
    ];

    /**
     * Relationship to ExamSession
     */
    public function examSession()
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Relationship to ExamQuestion
     */
    public function question()
    {
        return $this->belongsTo(ExamQuestion::class, 'question_id');
    }

    /**
     * Check if answer has been marked
     */
    public function isMarked(): bool
    {
        return $this->marking_status !== 'not_marked';
    }

    /**
     * Check if answer was auto-marked (MCQ)
     */
    public function isAutoMarked(): bool
    {
        return $this->marking_status === 'auto_marked';
    }

    /**
     * Check if answer was AI graded
     */
    public function isAIGraded(): bool
    {
        return $this->marking_status === 'ai_graded';
    }

    /**
     * Get confidence score from grading details if available
     */
    public function getConfidenceScore(): ?float
    {
        if (!$this->grading_details || !isset($this->grading_details['confidence_score'])) {
            return null;
        }

        return (float) $this->grading_details['confidence_score'];
    }

    /**
     * Get grading reasoning if available
     */
    public function getGradingReasoning(): ?string
    {
        if (!$this->grading_details || !isset($this->grading_details['reasoning'])) {
            return null;
        }

        return $this->grading_details['reasoning'];
    }
}
