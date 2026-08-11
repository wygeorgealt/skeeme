<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_bank_id',
        'uuid',
        'question_type',
        'question_text',
        'options',
        'correct_answer',
        'marks',
        'bloom_level',
        'metadata',
        'difficulty_level',
        'learning_objective',
        'explanation',
        'source',
        'created_by',
        'status',
        'image_path',
        'usage_count',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'metadata' => 'array',
        'marks' => 'decimal:2',
    ];

    /**
     * Boot method - set UUID on creation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Relationship to QuestionPool
     */
    public function questionPool()
    {
        return $this->belongsTo(QuestionPool::class);
    }

    /**
     * Relationship to QuestionBank
     */
    public function questionBank()
    {
        return $this->belongsTo(QuestionBank::class);
    }

    /**
     * Get the user who created this question
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if this is a multiple choice question
     */
    public function isMultipleChoice(): bool
    {
        return $this->question_type === 'multiple_choice';
    }

    /**
     * Check if this is an essay question
     */
    public function isEssay(): bool
    {
        return $this->question_type === 'essay';
    }

    /**
     * Get formatted options for display
     */
    public function getFormattedOptions(): array
    {
        if (!$this->options || !is_array($this->options)) {
            return [];
        }

        return array_map(function ($option) {
            return [
                'id' => $option['id'] ?? null,
                'text' => $option['text'] ?? $option,
                'is_correct' => $option['is_correct'] ?? false,
            ];
        }, $this->options);
    }

    /**
     * Get difficulty level from metadata
     */
    public function getDifficulty(): ?string
    {
        if (!$this->metadata || !isset($this->metadata['difficulty'])) {
            return null;
        }

        return $this->metadata['difficulty'];
    }

    /**
     * Check if answer is correct (for auto-marking MCQ)
     */
    public function isAnswerCorrect($answer): bool
    {
        if ($this->isMultipleChoice()) {
            // For MCQ, find the correct option
            $correctOption = collect($this->options)->first(function ($option) {
                return $option['is_correct'] ?? false;
            });

            return $correctOption && ($correctOption['id'] ?? $correctOption) === $answer;
        }

        return false;
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
