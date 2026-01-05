<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdaptiveRoutingRule extends Model
{
    protected $table = 'adaptive_routing_rules';

    protected $fillable = [
        'exam_id',
        'rule_name',
        'description',
        'question_sequence',
        'performance_threshold',
        'operator',
        'target_pool_id',
        'questions_to_present',
        'is_active',
    ];

    protected $casts = [
        'performance_threshold' => 'float',
        'questions_to_present' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the exam
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get the target question pool
     */
    public function targetPool(): BelongsTo
    {
        return $this->belongsTo(QuestionPool::class, 'target_pool_id');
    }

    /**
     * Check if rule applies to student performance
     */
    public function appliesToPerformance(float $performance): bool
    {
        return match ($this->operator) {
            '>=' => $performance >= $this->performance_threshold,
            '>' => $performance > $this->performance_threshold,
            '<=' => $performance <= $this->performance_threshold,
            '<' => $performance < $this->performance_threshold,
            '==' => abs($performance - $this->performance_threshold) < 0.001,
            default => false,
        };
    }

    /**
     * Get readable description
     */
    public function getReadableRule(): string
    {
        $operatorSymbol = match ($this->operator) {
            '>=' => '≥',
            '>' => '>',
            '<=' => '≤',
            '<' => '<',
            '==' => '=',
            default => $this->operator,
        };
        
        $percentageThreshold = round($this->performance_threshold * 100, 0);
        
        return "{$this->rule_name}: If student performance {$operatorSymbol} {$percentageThreshold}% → Present {$this->questions_to_present} question(s) from {$this->targetPool->name}";
    }
}
