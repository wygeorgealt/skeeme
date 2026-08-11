<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeightedExamResult extends Model
{
    protected $table = 'weighted_exam_results';

    protected $fillable = [
        'exam_session_id',
        'question_id',
        'raw_marks',
        'weight',
        'weighted_marks',
        'total_weighted_marks',
        'calculated_at',
    ];

    protected $casts = [
        'raw_marks' => 'decimal:2',
        'weight' => 'decimal:2',
        'weighted_marks' => 'decimal:2',
        'total_weighted_marks' => 'decimal:2',
        'calculated_at' => 'datetime',
    ];

    /**
     * Get the exam session
     */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Get the question
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Calculate percentage score for this question
     */
    public function getPercentageScore(): float
    {
        if ($this->total_weighted_marks == 0) {
            return 0;
        }
        return round(($this->weighted_marks / $this->total_weighted_marks) * 100, 2);
    }

    /**
     * Get percentage of raw marks
     */
    public function getRawPercentage(): float
    {
        if ($this->total_weighted_marks == 0) {
            return 0;
        }
        return round(($this->raw_marks / $this->total_weighted_marks) * 100, 2);
    }
}
