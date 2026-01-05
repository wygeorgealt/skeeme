<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamBlueprint extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'name',
        'description',
        'total_questions',
        'total_marks',
        'difficulty_distribution',
        'question_type_distribution',
        'topic_distribution',
        'metadata',
    ];

    protected $casts = [
        'difficulty_distribution' => 'array', // {easy: 20, medium: 50, hard: 30}
        'question_type_distribution' => 'array', // {multiple_choice: 50, essay: 30, ...}
        'topic_distribution' => 'array', // {topic1: 40, topic2: 60}
        'metadata' => 'array',
    ];

    /**
     * Relationship to Exam
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Relationship to blueprint requirements
     */
    public function requirements(): HasMany
    {
        return $this->hasMany(BlueprintRequirement::class);
    }

    /**
     * Get blueprint summary
     */
    public function getSummary(): array
    {
        return [
            'total_questions' => $this->total_questions,
            'total_marks' => $this->total_marks,
            'difficulty_distribution' => $this->difficulty_distribution ?? [],
            'question_types' => $this->question_type_distribution ?? [],
            'topics' => $this->topic_distribution ?? [],
        ];
    }

    /**
     * Calculate how well exam matches blueprint
     */
    public function getComplianceScore(): float
    {
        if (!$this->exam) {
            return 0;
        }

        $questions = $this->exam->questions;
        if ($questions->isEmpty()) {
            return 0;
        }

        $score = 0;
        $checks = 0;

        // Check total questions
        $checks++;
        if (abs($questions->count() - $this->total_questions) <= 1) {
            $score += 25; // 25% for correct question count
        }

        // Check difficulty distribution
        if ($this->difficulty_distribution) {
            $checks++;
            $difficultyCount = $questions->groupBy('difficulty_level')->map->count();
            $totalQuestions = $questions->count();
            
            $scoreForDifficulty = 0;
            foreach ($this->difficulty_distribution as $difficulty => $percentage) {
                $expected = ceil(($percentage / 100) * $this->total_questions);
                $actual = $difficultyCount[$difficulty] ?? 0;
                if (abs($actual - $expected) <= 1) {
                    $scoreForDifficulty += 25;
                }
            }
            $score += $scoreForDifficulty / count($this->difficulty_distribution);
        }

        // Check question types
        if ($this->question_type_distribution) {
            $checks++;
            $typeCount = $questions->groupBy('question_type')->map->count();
            
            $scoreForTypes = 0;
            foreach ($this->question_type_distribution as $type => $percentage) {
                $expected = ceil(($percentage / 100) * $this->total_questions);
                $actual = $typeCount[$type] ?? 0;
                if (abs($actual - $expected) <= 1) {
                    $scoreForTypes += 25;
                }
            }
            $score += $scoreForTypes / count($this->question_type_distribution);
        }

        // Check topics (now based on learning objectives)
        if ($this->topic_distribution) {
            $checks++;
            // Group by learning_objective instead of removed topic column
            $topicCount = $questions->groupBy('learning_objective')->map->count();
            
            $scoreForTopics = 0;
            foreach ($this->topic_distribution as $topic => $percentage) {
                $expected = ceil(($percentage / 100) * $this->total_questions);
                $actual = $topicCount[$topic] ?? 0;
                if (abs($actual - $expected) <= 1) {
                    $scoreForTopics += 25;
                }
            }
            $score += $scoreForTopics / count($this->topic_distribution);
        }

        return $checks > 0 ? $score / $checks : 0;
    }
}
