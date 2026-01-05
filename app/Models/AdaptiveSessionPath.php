<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdaptiveSessionPath extends Model
{
    protected $table = 'adaptive_session_paths';

    protected $fillable = [
        'exam_session_id',
        'question_pool_id',
        'sequence_number',
        'student_performance_at_point',
        'routing_reason',
        'presented_at',
    ];

    protected $casts = [
        'student_performance_at_point' => 'float',
        'presented_at' => 'datetime',
    ];

    /**
     * Get the exam session
     */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Get the question pool
     */
    public function questionPool(): BelongsTo
    {
        return $this->belongsTo(QuestionPool::class);
    }

    /**
     * Get readable path info
     */
    public function getPathInfo(): string
    {
        $performancePercentage = round($this->student_performance_at_point * 100, 1);
        return "Q{$this->sequence_number}: {$this->questionPool->name} ({$performancePercentage}% performance)";
    }
}
