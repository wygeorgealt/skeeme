<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class IndividualSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_name',
        'student_limit',
        'price',
        'start_date',
        'expiry_date',
        'is_active',
    ];

    protected $casts = [
        'student_limit' => 'integer',
        'price' => 'decimal:2',
        'start_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Plan constants for individual lecturers
    const PLAN_FREE = 'Free';
    const PLAN_PRO = 'Pro';

    const PLANS = [
        self::PLAN_FREE => [
            'name' => 'Free Plan',
            'course_limit' => 10,
            'price' => 0.00,
            'features' => [
                'basic_dashboard' => true,
                'course_notes' => true,
                'manual_exams' => true,
                'basic_attendance' => true,
                'email_support' => true,
                'ai_exams' => false,
                'unlimited_uploads' => false,
                'messaging' => false,
                'advanced_analytics' => false,
            ],
        ],
        self::PLAN_PRO => [
            'name' => 'Pro Plan',
            'course_limit' => null, // Unlimited
            'price' => 20.00, // Base USD, can be converted
            'features' => [
                'basic_dashboard' => true,
                'course_notes' => true,
                'manual_exams' => true,
                'basic_attendance' => true,
                'email_support' => true,
                'ai_exams' => true,
                'unlimited_uploads' => true,
                'messaging' => true,
                'advanced_analytics' => true,
            ],
        ],
    ];

    /**
     * Get the user that owns the subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if subscription is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    /**
     * Check if subscription is active and not expired
     */
    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired();
    }

    /**
     * Get plan details
     */
    public function getPlanDetails(): array
    {
        return self::PLANS[$this->plan_name] ?? [];
    }

    /**
     * Check if plan has a specific feature
     */
    public function hasFeature(string $feature): bool
    {
        $planDetails = $this->getPlanDetails();
        return $planDetails['features'][$feature] ?? false;
    }

    /**
     * Get course limit for the plan
     */
    public function getCourseLimit(): ?int
    {
        return $this->getPlanDetails()['course_limit'] ?? null;
    }

    /**
     * Get price for the plan
     */
    public function getPrice(): float
    {
        return $this->price ?? $this->getPlanDetails()['price'] ?? 0.00;
    }

    /**
     * Scope for active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('expiry_date', '>', now());
    }
}
