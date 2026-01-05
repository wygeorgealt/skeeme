<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GradingMetrics extends Model
{
    use HasFactory;

    protected $table = 'grading_metrics';

    protected $fillable = [
        'exam_session_id',
        'lecturer_id',
        'grading_started_at',
        'grading_completed_at',
        'total_time_seconds',
        'question_index',
        'time_per_question_seconds',
        'comments_added',
        'revision_count',
    ];

    protected $casts = [
        'grading_started_at' => 'datetime',
        'grading_completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the exam session this metric belongs to
     */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Get the lecturer who graded
     */
    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    /**
     * Get total grading time in minutes
     */
    public function getTotalTimeMinutesAttribute(): float
    {
        return round($this->total_time_seconds / 60, 2);
    }

    /**
     * Get time per question in seconds
     */
    public function getAverageTimePerQuestionAttribute(): float
    {
        if ($this->total_time_seconds === null || $this->question_index === null || $this->question_index === 0) {
            return 0;
        }
        return round($this->total_time_seconds / $this->question_index, 2);
    }

    /**
     * Check if grading is complete
     */
    public function isComplete(): bool
    {
        return $this->grading_completed_at !== null;
    }

    /**
     * Get consistency score (based on revision count and comments)
     */
    public function getConsistencyScoreAttribute(): float
    {
        $baseScore = 100;
        $baseScore -= ($this->revision_count ?? 0) * 5; // Deduct 5 points per revision
        return max(0, min(100, $baseScore));
    }
}
