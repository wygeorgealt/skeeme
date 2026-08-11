<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class QuestionAnalytics extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'question_analytics';

    protected $fillable = [
        'question_id', 'exam_id', 'total_attempts', 'correct_attempts',
        'correct_rate', 'bloom_level', 'difficulty_index', 'discrimination_index',
        'option_selection_count', 'common_distractors', 'average_time_spent',
        'last_used_at', 'uses_count', 'metadata'
    ];

    protected $casts = [
        'option_selection_count' => 'array',
        'common_distractors' => 'array',
        'metadata' => 'array',
        'last_used_at' => 'datetime',
        'correct_rate' => 'float',
        'difficulty_index' => 'float',
        'discrimination_index' => 'float',
        'average_time_spent' => 'float',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function getDifficultyLevelAttribute()
    {
        $difficulty = $this->difficulty_index;
        if ($difficulty > 75) return 'Hard';
        if ($difficulty > 50) return 'Medium';
        return 'Easy';
    }

    public function getIsWellPerformingAttribute()
    {
        return $this->discrimination_index > 0.2 && $this->correct_rate > 30;
    }

    public function getIsPoorlyPerformingAttribute()
    {
        return $this->discrimination_index < -0.2 || $this->correct_rate > 95;
    }

    public function getPerformanceRatingAttribute()
    {
        if ($this->is_poorly_performing) return 'Poor';
        if ($this->discrimination_index < 0) return 'Needs Revision';
        if ($this->is_well_performing) return 'Good';
        return 'Fair';
    }
}
