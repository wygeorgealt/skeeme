<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'school_id',
        'class_teacher_id',
        'academic_year',
        'grade_level',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the school that owns this class
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the class teacher
     */
    public function classTeacher()
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    /**
     * Get students in this class
     */
    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'class_id');
    }

    /**
     * Get courses associated with this class
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'class_courses', 'class_id', 'course_id');
    }

    /**
     * Get attendance records for this class
     */
    public function attendance(): HasMany
    {
        return $this->hasMany(\App\Models\Attendance::class);
    }

    /**
     * Get announcements for this class
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(\App\Models\Announcement::class);
    }

    /**
     * Check if a student is in this class
     */
    public function hasStudent(User $student): bool
    {
        return $this->students()->where('user_id', $student->id)->exists();
    }

    /**
     * Get the number of students in this class
     */
    public function getStudentCount(): int
    {
        return $this->students()->count();
    }

    /**
     * Get the number of courses for this class
     */
    public function getCourseCount(): int
    {
        return $this->courses()->count();
    }
}
