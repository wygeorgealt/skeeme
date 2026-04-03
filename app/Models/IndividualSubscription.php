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
        'billing_cycle',
        'price',
        'start_date',
        'expiry_date',
        'status', // active, inactive, expired
        'is_trial',
        'trial_ends_at',
        'paystack_authorization',
        'auto_renew',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'start_date' => 'date',
        'expiry_date' => 'date',
        'is_trial' => 'boolean',
        'trial_ends_at' => 'datetime',
        'auto_renew' => 'boolean',
    ];

    // Plan constants for students
    const PLAN_FREE = 'Free';
    const PLAN_STANDARD = 'Standard';
    const PLAN_ELITE = 'Elite';

    const PLANS = [
        self::PLAN_FREE => [
            'name' => 'Free',
            'credits_monthly' => 500,
            'price_monthly_ngn' => 0,
            'price_monthly_usd' => 0,
            'features' => [
                'credits' => '500 / month',
                'queue' => 'Standard',
                'speed' => 'Basic',
            ],
        ],
        self::PLAN_STANDARD => [
            'name' => 'Skeeme Standard',
            'credits_monthly' => 5000,
            'price_monthly_ngn' => 5000,
            'price_yearly_ngn' => 29999,
            'price_monthly_usd' => 12.99,
            'price_yearly_usd' => 99.99, // Calculated as ~7.5 months
            'features' => [
                'credits' => '5,000 / month',
                'queue' => 'Priority',
                'speed' => 'Fast AI',
                'badge' => 'Most Popular',
            ],
        ],
        self::PLAN_ELITE => [
            'name' => 'Skeeme Elite',
            'credits_monthly' => 15000,
            'price_monthly_ngn' => 13000,
            'price_yearly_ngn' => 119000,
            'price_monthly_usd' => 29.99,
            'price_yearly_usd' => 249.99,
            'features' => [
                'credits' => '15,000 / month',
                'queue' => 'Highest Priority',
                'speed' => 'Best Performance',
                'badge' => 'For Power Users',
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
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if subscription is active and not expired
     */
    public function isValid(): bool
    {
        return ($this->status === 'active' || $this->isInTrial()) && !$this->isExpired();
    }

    /**
     * Check if subscription is currently in a trial period
     */
    public function isInTrial(): bool
    {
        return $this->is_trial && $this->trial_ends_at && $this->trial_ends_at->isFuture();
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
     * Scope for active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('expiry_date')
                          ->orWhere('expiry_date', '>', now());
                    });
    }
}
