<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AnalyticsSnapshot extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'exam_id', 'course_id', 'lecturer_id', 'snapshot_date', 'period',
        'total_students', 'students_submitted', 'average_score', 'median_score',
        'std_deviation', 'min_score', 'max_score', 'total_questions',
        'average_difficulty', 'difficulty_distribution', 'bloom_level_distribution',
        'questions_auto_graded', 'questions_ai_graded', 'average_confidence',
        'grades_pending_review', 'grades_approved', 'grades_overridden',
        'average_time_spent', 'early_submissions', 'last_minute_submissions',
        'average_autosave_frequency', 'question_performance', 'skill_mastery',
        'common_mistakes', 'class_average_change', 'pass_rate', 'improvement_count',
        'metadata'
    ];

    protected $casts = [
        'snapshot_date' => 'datetime',
        'difficulty_distribution' => 'array',
        'bloom_level_distribution' => 'array',
        'question_performance' => 'array',
        'skill_mastery' => 'array',
        'common_mistakes' => 'array',
        'metadata' => 'array',
        'average_score' => 'float',
        'median_score' => 'float',
        'std_deviation' => 'float',
        'average_difficulty' => 'float',
        'average_confidence' => 'float',
        'average_time_spent' => 'float',
        'average_autosave_frequency' => 'float',
        'class_average_change' => 'float',
        'pass_rate' => 'float',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function getPerformanceTrendAttribute()
    {
        return [
            'average' => $this->average_score,
            'change' => $this->class_average_change,
            'pass_rate' => $this->pass_rate,
        ];
    }

    public function getGradingMetricsAttribute()
    {
        return [
            'auto_graded' => $this->questions_auto_graded,
            'ai_graded' => $this->questions_ai_graded,
            'confidence' => $this->average_confidence,
            'pending_review' => $this->grades_pending_review,
        ];
    }

    public function getEngagementMetricsAttribute()
    {
        return [
            'avg_time' => $this->average_time_spent,
            'early' => $this->early_submissions,
            'last_minute' => $this->last_minute_submissions,
        ];
    }
}
