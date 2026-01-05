<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'email',
        'phone',
        'website',
        'timezone',
        'language',
        'academic_year',
        'grading_scale',
        'logo_path',
        'allow_student_password_change',
        'grade_weighting',
    ];

    protected $casts = [
        'allow_student_password_change' => 'boolean',
        'grade_weighting' => 'array',
    ];

    /**
     * Get the active subscription for this school
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('is_active', true);
    }

    /**
     * Get all subscriptions for this school
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get all users belonging to this school
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all courses belonging to this school
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Get all classes belonging to this school
     */
    public function classes(): HasMany
    {
        return $this->hasMany(\App\Models\SchoolClass::class);
    }

    /**
     * Get lecturers for this school
     */
    public function lecturers(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'lecturer');
    }

    /**
     * Get students for this school
     */
    public function students(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }

    /**
     * Get admins for this school
     */
    public function admins(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'admin');
    }

    /**
     * Check if school has an active subscription
     */
    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }

    /**
     * Get the current plan name
     */
    public function getCurrentPlanAttribute(): ?string
    {
        return $this->activeSubscription?->plan_name;
    }

    /**
     * Check if school can add more students based on current plan
     */
    public function canAddStudents(int $additionalStudents = 1): bool
    {
        $subscription = $this->activeSubscription;
        if (!$subscription) {
            return false; // No subscription means no students allowed
        }

        $currentStudentCount = DB::table('users')->where('school_id', $this->id)->where('role', 'student')->count();
        $studentLimit = $subscription->student_limit;

        if ($studentLimit === null) {
            return true; // Unlimited students
        }

        return ($currentStudentCount + $additionalStudents) <= $studentLimit;
    }
}
