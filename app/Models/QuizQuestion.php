<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_session_id', 'question', 'type', 'options', 'correct_answer', 
        'user_answer', 'is_correct', 'explanation', 'marks_awarded', 'max_marks', 'feedback'
    ];
}
