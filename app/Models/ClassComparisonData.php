<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassComparisonData extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'class_comparison_data';

    protected $fillable = [
        'exam_id', 'course_id', 'comparison_date', 'comparison_type',
        'class_average', 'median_score', 'pass_rate', 'high_achiever_rate',
        'benchmark_average', 'benchmark_pass_rate', 'performance_gap',
        'score_distribution', 'performance_vs_benchmark', 'metadata'
    ];

    protected $casts = [
        'comparison_date' => 'datetime',
        'score_distribution' => 'array',
        'performance_vs_benchmark' => 'array',
        'metadata' => 'array',
        'class_average' => 'float',
        'median_score' => 'float',
        'pass_rate' => 'float',
        'high_achiever_rate' => 'float',
        'benchmark_average' => 'float',
        'benchmark_pass_rate' => 'float',
        'performance_gap' => 'float',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getPerformanceStatusAttribute()
    {
        $gap = $this->performance_gap;
        if ($gap === null) return 'No Benchmark';
        if ($gap > 5) return 'Exceeding';
        if ($gap > -5) return 'Meeting';
        return 'Below Benchmark';
    }

    public function getGapTrendAttribute()
    {
        if ($this->performance_gap === null) return null;
        if ($this->performance_gap > 0) return 'improving';
        if ($this->performance_gap < 0) return 'declining';
        return 'stable';
    }

    public function getGradeDistributionAttribute()
    {
        if (!$this->score_distribution) return null;
        
        $dist = $this->score_distribution;
        return [
            'A' => $dist['A'] ?? 0,
            'B' => $dist['B'] ?? 0,
            'C' => $dist['C'] ?? 0,
            'D' => $dist['D'] ?? 0,
            'F' => $dist['F'] ?? 0,
        ];
    }
}
