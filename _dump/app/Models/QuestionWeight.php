<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionWeight extends Model
{
    protected $table = 'question_weights';

    protected $fillable = [
        'exam_id',
        'question_id',
        'weight',
        'total_marks',
        'marking_notes',
        'is_optional',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'total_marks' => 'integer',
        'is_optional' => 'boolean',
    ];

    /**
     * Get the exam
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get the question
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Calculate total possible marks for this question
     * (weight * total_marks)
     */
    public function getTotalPossibleMarks(): float
    {
        return $this->weight * $this->total_marks;
    }

    /**
     * Calculate weighted marks for a given raw score
     */
    public function calculateWeightedMarks(float $rawMarks): float
    {
        return round($rawMarks * $this->weight, 2);
    }

    /**
     * Get percentage weight in exam
     */
    public function getWeightPercentage(float $totalExamWeight): float
    {
        if ($totalExamWeight === 0) {
            return 0;
        }
        return round(($this->getTotalPossibleMarks() / $totalExamWeight) * 100, 2);
    }
}
