<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StudentLearningProgress extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'student_id', 'course_id', 'overall_progress', 'mastery_level',
        'skill_levels', 'average_score_trend', 'improvement_streak',
        'struggle_areas', 'exams_completed', 'average_completion_time',
        'times_reviewed_feedback', 'recommended_topics', 'strengths',
        'weaknesses', 'last_exam_at', 'metadata'
    ];

    protected $casts = [
        'skill_levels' => 'array',
        'recommended_topics' => 'array',
        'strengths' => 'array',
        'weaknesses' => 'array',
        'metadata' => 'array',
        'last_exam_at' => 'datetime',
        'overall_progress' => 'float',
        'mastery_level' => 'float',
        'average_score_trend' => 'float',
        'average_completion_time' => 'float',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getMasteryLevelRatingAttribute()
    {
        $level = $this->mastery_level;
        if ($level >= 90) return 'Mastery';
        if ($level >= 75) return 'Proficient';
        if ($level >= 60) return 'Developing';
        if ($level >= 40) return 'Beginning';
        return 'Limited';
    }

    public function getProgressStatusAttribute()
    {
        if ($this->improvement_streak >= 2) return 'Improving';
        if ($this->struggle_areas > 2) return 'Struggling';
        if ($this->average_score_trend > 0) return 'On Track';
        return 'Needs Attention';
    }

    public function getNeedsInterventionAttribute()
    {
        return $this->mastery_level < 40 || $this->struggle_areas > 3;
    }

    public function getIsHighPerformerAttribute()
    {
        return $this->mastery_level >= 85 && $this->improvement_streak > 0;
    }
}
