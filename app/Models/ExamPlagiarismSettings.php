<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPlagiarismSettings extends Model
{
    protected $table = 'exam_plagiarism_settings';

    protected $fillable = [
        'exam_id',
        'plagiarism_check_enabled',
        'plagiarism_threshold',
        'check_mode',
        'checked_question_types',
        'penalty_for_flagged',
        'penalty_marks',
        'plagiarism_service',
        'service_config',
        'detection_sources',
        'check_student_submissions',
        'check_internet',
        'check_university_database',
    ];

    protected $casts = [
        'plagiarism_check_enabled' => 'boolean',
        'plagiarism_threshold' => 'float',
        'checked_question_types' => 'array',
        'service_config' => 'array',
        'check_student_submissions' => 'boolean',
        'check_internet' => 'boolean',
        'check_university_database' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (is_null($model->checked_question_types)) {
                $model->checked_question_types = ['essay', 'short_answer', 'long_answer'];
            }
        });
    }

    /**
     * Get the exam
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Get plagiarism checks for this exam
     */
    public function plagiarismChecks(): HasMany
    {
        return $this->hasMany(PlagiarismCheck::class, 'exam_id', 'exam_id');
    }

    /**
     * Get flagged plagiarism checks
     */
    public function flaggedChecks(): HasMany
    {
        return $this->plagiarismChecks()->where('plagiarism_status', 'flagged');
    }

    /**
     * Get the percentage of answers flagged
     */
    public function getFlaggedPercentage(): float
    {
        $total = $this->plagiarismChecks()->count();
        if ($total === 0) {
            return 0;
        }

        $flagged = $this->flaggedChecks()->count();
        return ($flagged / $total) * 100;
    }

    /**
     * Check if plagiarism checking should run for question type
     */
    public function shouldCheckQuestionType(string $questionType): bool
    {
        $types = $this->checked_question_types ?? ['essay', 'short_answer'];
        return in_array($questionType, $types);
    }

    /**
     * Get threshold as percentage string
     */
    public function getThresholdPercentage(): string
    {
        return number_format($this->plagiarism_threshold * 100, 0) . '%';
    }

    /**
     * Check if threshold exceeded
     */
    public function isThresholdExceeded(float $score): bool
    {
        return $score >= $this->plagiarism_threshold;
    }
}
