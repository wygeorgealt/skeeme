<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'school_id',
        'course_link',
        'course_rep_id',
        'created_by',
        'status',
        'zoom_meeting_id',
        'zoom_join_url',
        'zoom_start_url',
        'zoom_recording_url',
        'class_summary',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Generate a unique course code
     */
    public static function generateCourseCode(string $courseName): string
    {
        $prefix = strtoupper(substr($courseName, 0, 2));
        $random = Str::random(6);
        return $prefix . '-' . $random;
    }

    /**
     * Generate a unique course link
     */
    public static function generateCourseLink(): string
    {
        return 'skeeme.com/enroll/' . Str::random(8);
    }

    /**
     * Get the school that owns the course
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the user who created the course (lecturer)
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the course representative (student)
     */
    public function courseRep()
    {
        return $this->belongsTo(User::class, 'course_rep_id');
    }

    /**
     * Get lecturers assigned to this course
     */
    public function lecturers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_lecturers');
    }

    /**
     * Get classes associated with this course
     */
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\SchoolClass::class, 'class_courses');
    }

    /**
     * Get enrollments for this course
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(\App\Models\Enrollment::class);
    }

    /**
     * Get enrolled students through classes
     */
    public function enrolledStudents()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'course_id', 'student_id');
    }

    /**
     * Get exams for this course
     */
    public function exams(): HasMany
    {
        return $this->hasMany(\App\Models\Exam::class);
    }

    /**
     * Get attendance records for this course
     */
    public function attendance(): HasMany
    {
        return $this->hasMany(\App\Models\Attendance::class);
    }

    /**
     * Get notes/materials for this course
     */
    public function notes(): HasMany
    {
        return $this->hasMany(\App\Models\Note::class);
    }

    /**
     * Get announcements for this course
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(\App\Models\Announcement::class);
    }

    /**
     * Check if a lecturer is assigned to this course
     */
    public function hasLecturer(User $lecturer): bool
    {
        return $this->lecturers()->where('user_id', $lecturer->id)->exists();
    }

    /**
     * Check if a student is enrolled in this course
     */
    public function hasStudent(User $student): bool
    {
        return $this->enrolledStudents()->where('user_id', $student->id)->exists();
    }

    /**
     * Get course URL for enrollment
     */
    public function getEnrollmentUrl(): string
    {
        return url($this->course_link);
    }

    /**
     * Check if course was created by a lecturer
     */
    public function isCreatedByLecturer(): bool
    {
        return $this->created_by !== null;
    }

    /**
     * Check if course was created by admin
     */
    public function isCreatedByAdmin(): bool
    {
        return $this->created_by === null;
    }

    /**
     * Check if user can edit this course
     */
    public function canBeEditedBy(User $user): bool
    {
        // Admin can edit any course in their school
        if ($user->hasRole('admin') && $user->school_id === $this->school_id) {
            return true;
        }

        // Lecturer can edit only their own created courses
        if ($user->hasRole('lecturer') && $this->created_by === $user->id) {
            return true;
        }

        return false;
    }
}
