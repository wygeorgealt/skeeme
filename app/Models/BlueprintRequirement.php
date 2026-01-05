<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlueprintRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_blueprint_id',
        'topic',
        'difficulty_level',
        'question_type',
        'required_count',
        'required_marks',
        'learning_objectives',
    ];

    protected $casts = [
        'learning_objectives' => 'array',
    ];

    /**
     * Relationship to ExamBlueprint
     */
    public function blueprint(): BelongsTo
    {
        return $this->belongsTo(ExamBlueprint::class, 'exam_blueprint_id');
    }

    /**
     * Get questions that match this requirement
     */
    public function getMatchingQuestions()
    {
        // Since topic column was removed, match by learning_objective instead
        $query = Question::where('difficulty_level', $this->difficulty_level)
            ->where('question_type', $this->question_type);
        
        if ($this->topic) {
            $query->where('learning_objective', 'like', "%{$this->topic}%");
        }
        
        return $query->get();
    }

    /**
     * Check if requirement is met
     */
    public function isMet($exam): bool
    {
        $questions = $exam->questions()
            ->where('topic', $this->topic)
            ->where('difficulty_level', $this->difficulty_level)
            ->where('question_type', $this->question_type)
            ->get();

        return $questions->count() >= $this->required_count;
    }
}
