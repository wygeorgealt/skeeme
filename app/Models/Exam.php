<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'lecturer_id',
        'title',
        'description',
        'exam_date',
        'duration',
        'total_marks',
        'passing_marks',
        'questions',
        'status',
        'randomize_questions',
        'randomize_options',
        'category',
        'google_event_id',
    ];

    protected $casts = [
        'exam_date' => 'datetime',
        'questions' => 'array',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function sessions()
    {
        return $this->hasMany(ExamSession::class);
    }

    /**
     * Get exam questions with questions
     */
    public function examQuestions()
    {
        return $this->hasMany(ExamQuestion::class)->orderBy('order');
    }

    /**
     * Get questions for this exam
     */
    public function questions()
    {
        return $this->belongsToMany(Question::class, 'exam_questions')
            ->withPivot('order', 'marks')
            ->orderBy('exam_questions.order');
    }

    /**
     * Get all student attempts for this exam
     */
    public function studentAttempts()
    {
        return $this->sessions();
    }

    /**
     * Get submitted sessions (completed attempts)
     */
    public function submittedSessions()
    {
        return $this->sessions()->where('status', 'submitted');
    }

    /**
     * Get graded sessions
     */
    public function gradedSessions()
    {
        return $this->sessions()->where('status', 'graded');
    }

    /**
     * Get exam blueprint
     */
    public function blueprint()
    {
        return $this->hasOne(ExamBlueprint::class);
    }
}
