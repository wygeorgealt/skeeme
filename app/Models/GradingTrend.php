<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GradingTrend extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'grading_trends';

    protected $fillable = [
        'exam_id', 'lecturer_id', 'trend_date', 'period',
        'mcq_graded_count', 'mcq_average_score', 'essays_graded_count',
        'essays_average_score', 'essays_average_confidence', 'overrides_count',
        'override_rate', 'override_patterns', 'average_grading_time',
        'grades_per_hour', 'consistency_score', 'metadata'
    ];

    protected $casts = [
        'trend_date' => 'datetime',
        'override_patterns' => 'array',
        'metadata' => 'array',
        'mcq_average_score' => 'float',
        'essays_average_score' => 'float',
        'essays_average_confidence' => 'float',
        'override_rate' => 'float',
        'average_grading_time' => 'float',
        'consistency_score' => 'float',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function getTotalGradedCountAttribute()
    {
        return $this->mcq_graded_count + $this->essays_graded_count;
    }

    public function getAverageScoreAttribute()
    {
        $total = $this->total_graded_count;
        if ($total === 0) return 0;
        
        $combined = ($this->mcq_average_score * $this->mcq_graded_count) +
                   ($this->essays_average_score * $this->essays_graded_count);
        
        return round($combined / $total, 2);
    }

    public function getGradingEfficiencyAttribute()
    {
        if ($this->average_grading_time === 0) return 0;
        return round(1 / $this->average_grading_time * 60, 2); // items per hour
    }

    public function getConsistencyRatingAttribute()
    {
        $score = $this->consistency_score;
        if ($score >= 90) return 'Excellent';
        if ($score >= 75) return 'Good';
        if ($score >= 60) return 'Acceptable';
        return 'Needs Review';
    }
}
