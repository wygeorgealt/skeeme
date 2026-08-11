<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionBank extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'description',
        'created_by',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the course this question bank belongs to
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the lecturer who created this bank
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all questions in this bank
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Get questions by difficulty level
     */
    public function questionsByDifficulty($difficulty)
    {
        return $this->questions()->where('difficulty_level', $difficulty);
    }

    /**
     * Get questions by learning objective (replaces old topic functionality)
     */
    public function questionsByLearningObjective($objective)
    {
        return $this->questions()->where('learning_objective', 'like', "%{$objective}%");
    }

    /**
     * Search questions in this bank
     */
    public function searchQuestions($query)
    {
        return $this->questions()
            ->where('question_text', 'like', "%{$query}%")
            ->orWhere('learning_objective', 'like', "%{$query}%");
    }
}
