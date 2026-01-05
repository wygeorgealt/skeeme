<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionPool extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'lecturer_id',
        'name',
        'description',
        'status',
        'total_questions',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Relationship to Course
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Relationship to User (Lecturer)
     */
    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    /**
     * Relationship to Questions
     */
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Get published questions
     */
    public function publishedQuestions()
    {
        return $this->questions()->where('status', 'published');
    }

    /**
     * Get questions by Bloom's level
     */
    public function questionsByBloomLevel(string $level)
    {
        return $this->publishedQuestions()->where('bloom_level', $level);
    }

    /**
     * Get questions by type
     */
    public function questionsByType(string $type)
    {
        return $this->publishedQuestions()->where('question_type', $type);
    }

    /**
     * Update total question count
     */
    public function updateQuestionCount(): void
    {
        $this->update([
            'total_questions' => $this->publishedQuestions()->count(),
        ]);
    }
}
