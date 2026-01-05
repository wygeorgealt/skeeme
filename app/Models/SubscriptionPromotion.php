<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPromotion extends Model
{
    protected $table = 'subscription_promotions';

    protected $fillable = [
        'created_by',
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'max_per_school',
        'applies_to_all_plans',
        'applicable_plans',
        'applies_to_first_month',
        'applies_to_renewal',
        'duration_months',
        'status',
        'starts_at',
        'expires_at',
        'min_subscription_amount',
    ];

    protected $casts = [
        'applicable_plans' => 'array',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'created_by');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class, 'promotion_id');
    }

    public function calculateDiscount($price)
    {
        if ($this->discount_type === 'percentage') {
            return ($price * $this->discount_value) / 100;
        }

        return $this->discount_value;
    }

    public function canBeUsed($schoolId = null)
    {
        // Check if promotion is active
        if ($this->status !== 'active') {
            return false;
        }

        // Check if expired
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        // Check if not started
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        // Check max uses
        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return false;
        }

        // Check max per school
        if ($schoolId && $this->max_per_school) {
            $schoolUsages = $this->usages()
                ->where('school_id', $schoolId)
                ->count();

            if ($schoolUsages >= $this->max_per_school) {
                return false;
            }
        }

        return true;
    }

    public function isExpired()
    {
        return $this->status === 'expired' || ($this->expires_at && $this->expires_at->isPast());
    }

    public function getFormattedDiscount()
    {
        if ($this->discount_type === 'percentage') {
            return "{$this->discount_value}%";
        }

        return "\${$this->discount_value}";
    }

    public static function findByCode($code)
    {
        return self::where('code', strtoupper($code))->first();
    }

    public static function getActivePromotions()
    {
        return self::where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get();
    }
}
