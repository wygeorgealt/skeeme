<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Course;
use Filament\Models\Contracts\FilamentUser;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'middle_name',
        'address',
        'phone_number',
        'role',
        'status',
        'school_id',
        'class_id',
        'approved_at',
        'timezone',
        'credits',
        'is_unlimited_student',
        'last_credit_refill_at',
        'ai_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'last_credit_refill_at' => 'datetime',
            'password' => 'hashed',
            'is_unlimited_student' => 'boolean',
            'ai_preferences' => 'array',
        ];
    }

    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        return Str::of($this->name)
            ->explode(' ')
            ->take(2)
            ->map(fn ($word) => Str::substr($word, 0, 1))
            ->implode('');
    }

    /**
     * Get the school that the user belongs to
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the team member record if this user is a team/company manager
     */
    public function teamMember()
    {
        return $this->hasOne(TeamMember::class);
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is the creator (Super Admin Team Member)
     */
    public function isCreator(): bool
    {
        return $this->teamMember && $this->teamMember->role === 'super-admin';
    }

    /**
     * Determine if the user can access a Filament panel.
     */
    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        if ($panel->getId() === 'creator') {
            return $this->isCreator();
        }

        return true; // Default allow for other panels if they exist and have their own middleware
    }

    /**
     * Get the user's active individual subscription
     */
    public function individualSubscription()
    {
        return $this->hasOne(IndividualSubscription::class)->active();
    }

    /**
     * Get courses taught by this lecturer (assigned courses)
     */
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_lecturers');
    }

    /**
     * Get courses created by this lecturer
     */
    public function createdCourses()
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    /**
     * Get classes this user belongs to (for students)
     */
    public function classes()
    {
        return $this->belongsToMany(\App\Models\SchoolClass::class, 'class_students');
    }

    /**
     * Get the class this user belongs to (for students) - singular relationship
     */
    public function schoolClass()
    {
        return $this->belongsTo(\App\Models\SchoolClass::class, 'class_id');
    }

    /**
     * Get classes taught by this lecturer (as class teacher)
     */
    public function taughtClasses()
    {
        return $this->hasMany(\App\Models\SchoolClass::class, 'class_teacher_id');
    }

    /**
     * Get enrollments for this user (for students)
     */
    public function enrollments()
    {
        return $this->belongsToMany(Course::class, 'enrollments', 'student_id', 'course_id');
    }

    /**
     * Check if lecturer has reached course limit
     */
    public function hasReachedCourseLimit(): bool
    {
        if ($this->school) {
            // School lecturers use school subscription - no course limits
            return false;
        }

        if ($this->hasRole('lecturer')) {
            $subscription = $this->individualSubscription;
            if (!$subscription) {
                return true; // No subscription means no courses allowed
            }

            $courseLimit = $subscription->getCourseLimit();
            if ($courseLimit === null) {
                return false; // Unlimited
            }

            return $this->courses()->count() >= $courseLimit;
        }

        return false;
    }

    /**
     * Get the effective subscription plan for this user
     */
    public function getEffectiveSubscriptionPlan(): ?string
    {
        if ($this->school) {
            // School user - uses school subscription
            $schoolSubscription = $this->school->activeSubscription;
            return $schoolSubscription ? $schoolSubscription->plan_name : null;
        }

        if ($this->hasRole('lecturer')) {
            // Individual lecturer - uses individual subscription
            $individualSubscription = $this->individualSubscription;
            return $individualSubscription ? $individualSubscription->plan_name : null;
        }

        return null;
    }

    /**
     * Check if user can access a feature based on their effective subscription
     */
    public function canAccessFeature(string $feature): bool
    {
        if ($this->school) {
            // School user - check school subscription
            $subscription = $this->school->activeSubscription;
            return $subscription ? $subscription->hasFeature($feature) : false;
        }

        if ($this->hasRole('lecturer')) {
            // Individual lecturer - check individual subscription
            $subscription = $this->individualSubscription;
            return $subscription ? $subscription->hasFeature($feature) : false;
        }

        return false;
    }

    /**
     * Check if lecturer can create courses
     */
    public function canCreateCourse(): bool
    {
        return $this->hasRole('lecturer') && $this->school_id !== null;
    }

    /**
     * Get the social accounts associated with the user
     */
    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack()
    {
        return config('services.slack.webhook_url');
    }
}
