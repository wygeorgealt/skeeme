<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'plan_name',
        'student_limit',
        'price',
        'start_date',
        'expiry_date',
        'is_active',
        'auto_renew',
    ];

    protected $casts = [
        'student_limit' => 'integer',
        'price' => 'decimal:2',
        'start_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
        'auto_renew' => 'boolean',
    ];

    // Plan constants
    const PLAN_FREE = 'Free/Basic Plan';
    const PLAN_PRO = 'Pro';
    const PLAN_ENTERPRISE = 'Enterprise';

    // USD Base Prices (all prices in USD)
    const PLANS = [
        self::PLAN_FREE => [
            'name' => 'Free Plan',
            'student_limit' => 150,
            'price_usd' => 0.00,
            'features' => [
                'basic_course_management' => true,
                'student_enrollment' => true,
                'basic_reporting' => true,
                'email_support' => true,
                'advanced_analytics' => false,
                'custom_branding' => false,
                'api_access' => false,
                'priority_support' => false,
                'unlimited_storage' => false,
                'ai_management' => false,
                'ai_exams_management' => false,
            ],
        ],
        self::PLAN_PRO => [
            'name' => 'Pro Plan',
            'student_limit' => null, // Unlimited
            'price_usd' => 39.00,
            'features' => [
                'basic_course_management' => true,
                'student_enrollment' => true,
                'basic_reporting' => true,
                'email_support' => true,
                'advanced_analytics' => true,
                'custom_branding' => true,
                'api_access' => false,
                'priority_support' => false,
                'unlimited_storage' => false,
                'ai_management' => true,
                'ai_exams_management' => true,
            ],
        ],
        self::PLAN_ENTERPRISE => [
            'name' => 'Enterprise Plan',
            'student_limit' => null, // Unlimited
            'price_usd' => 199.99,
            'features' => [
                'basic_course_management' => true,
                'student_enrollment' => true,
                'basic_reporting' => true,
                'email_support' => true,
                'advanced_analytics' => true,
                'custom_branding' => true,
                'api_access' => true,
                'priority_support' => true,
                'unlimited_storage' => true,
                'ai_management' => true,
                'ai_exams_management' => true,
            ],
        ],
    ];

    // Currency conversion rates (to USD - how many units = 1 USD)
    const CURRENCY_RATES = [
        'USD' => 1.00,
        'NGN' => 1439.37,  // 1 USD = 1439.37 NGN
        'EUR' => 0.92,     // 1 EUR = 1.08 USD, so 1 USD = 0.92 EUR
        'GBP' => 0.79,     // 1 GBP = 1.27 USD, so 1 USD = 0.79 GBP
        'CAD' => 1.37,     // 1 USD = 1.37 CAD
    ];

    const CURRENCY_SYMBOLS = [
        'USD' => '$',
        'NGN' => '₦',
        'EUR' => '€',
        'GBP' => '£',
        'CAD' => 'C$',
    ];

    // Billing period constants
    const BILLING_PERIOD_MONTHLY = 'monthly';
    const BILLING_PERIOD_BIANNUAL = 'biannual'; // 6 months
    const BILLING_PERIOD_ANNUAL = 'annual';     // 12 months

    // Discount amounts in NGN (base currency for discounts)
    const BILLING_DISCOUNTS = [
        self::BILLING_PERIOD_MONTHLY => 0,           // No discount for monthly
        self::BILLING_PERIOD_BIANNUAL => 50000,      // ₦50,000 for 6 months
        self::BILLING_PERIOD_ANNUAL => 100000,       // ₦100,000 for 12 months
    ];

    // Billing period months
    const BILLING_PERIOD_MONTHS = [
        self::BILLING_PERIOD_MONTHLY => 1,
        self::BILLING_PERIOD_BIANNUAL => 6,
        self::BILLING_PERIOD_ANNUAL => 12,
    ];

    /**
     * Get the school that owns the subscription
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get all invoices for this subscription
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get all payments for this subscription
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
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
     * Get student limit for the plan
     */
    public function getStudentLimit(): ?int
    {
        return $this->student_limit ?? $this->getPlanDetails()['student_limit'] ?? null;
    }

    /**
     * Get price for the plan
     */
    public function getPrice(): float
    {
        return $this->price ?? $this->getPlanDetails()['price_usd'] ?? 0.00;
    }

    /**
     * Get price in specific currency
     */
    public function getPriceInCurrency(string $currency = 'USD'): float
    {
        $basePrice = $this->getPrice();
        if ($basePrice == 0) {
            return 0;
        }
        
        $rate = self::CURRENCY_RATES[$currency] ?? 1.00;
        return round($basePrice * $rate, 2);
    }

    /**
     * Get formatted price with currency symbol
     */
    public function getFormattedPrice(string $currency = 'USD'): string
    {
        $price = $this->getPriceInCurrency($currency);
        $symbol = self::CURRENCY_SYMBOLS[$currency] ?? '$';
        
        if ($price == 0) {
            return 'Free';
        }
        
        return $symbol . number_format($price, 2);
    }

    /**
     * Get currency symbol
     */
    public static function getCurrencySymbol(string $currency = 'USD'): string
    {
        return self::CURRENCY_SYMBOLS[$currency] ?? '$';
    }

    /**
     * Convert USD price to another currency
     */
    public static function convertPrice(float $priceUSD, string $fromCurrency = 'USD', string $toCurrency = 'USD'): float
    {
        if ($priceUSD == 0) {
            return 0;
        }
        
        $fromRate = self::CURRENCY_RATES[$fromCurrency] ?? 1.00;
        $toRate = self::CURRENCY_RATES[$toCurrency] ?? 1.00;
        
        // Convert from source currency to USD, then USD to target currency
        $priceInUSD = $priceUSD / $fromRate;
        return round($priceInUSD * $toRate, 2);
    }

    /**
     * Check if can upgrade to a new plan
     */
    public function canUpgradeTo(string $newPlan): bool
    {
        $planOrder = [
            self::PLAN_FREE => 1,
            self::PLAN_PRO => 2,
            self::PLAN_ENTERPRISE => 3,
        ];

        return ($planOrder[$newPlan] ?? 0) > ($planOrder[$this->plan_name] ?? 0);
    }

    /**
     * Check if can downgrade to a new plan
     */
    public function canDowngradeTo(string $newPlan): bool
    {
        $planOrder = [
            self::PLAN_FREE => 1,
            self::PLAN_PRO => 2,
            self::PLAN_ENTERPRISE => 3,
        ];

        return ($planOrder[$newPlan] ?? 0) < ($planOrder[$this->plan_name] ?? 0);
    }

    /**
     * Check if current plan is Pro
     */
    public function isPro(): bool
    {
        return $this->plan_name === self::PLAN_PRO;
    }

    public function isFree(): bool
    {
        return $this->plan_name === self::PLAN_FREE;
    }

    /**
     * Calculate days remaining in subscription
     */
    public function daysRemaining(): int
    {
        $now = time();
        $expiry = strtotime($this->expiry_date);
        $secondsRemaining = $expiry - $now;
        
        // Use ceil to round up fractional days (same as AdminDashboard)
        $daysRemaining = ceil($secondsRemaining / (60 * 60 * 24));
        
        return max(0, $daysRemaining);
    }

    /**
     * Scope for active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('expiry_date', '>', now());
    }

    /**
     * Scope for expired subscriptions
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<=', now());
    }

    /**
     * Calculate billing period total with discount
     */
    public function calculateBillingTotal(string $planName, string $currency, string $billingPeriod): array
    {
        $planDetails = self::PLANS[$planName] ?? null;
        if (!$planDetails) {
            return ['error' => 'Invalid plan'];
        }

        // Get base monthly price in USD
        $monthlyPriceUSD = $planDetails['price_usd'];
        
        // Convert to target currency
        $rate = self::CURRENCY_RATES[$currency] ?? 1.00;
        $monthlyPrice = round($monthlyPriceUSD * $rate, 2);
        
        // Get number of months for this period
        $months = self::BILLING_PERIOD_MONTHS[$billingPeriod] ?? 1;
        
        // Calculate subtotal (months × monthly price)
        $subtotal = round($monthlyPrice * $months, 2);
        
        // Get discount in NGN and convert to target currency if needed
        $discountNGN = self::BILLING_DISCOUNTS[$billingPeriod] ?? 0;
        $discount = 0;
        
        // Only apply discount if we're in NGN or convert the NGN discount
        if ($currency === 'NGN') {
            $discount = $discountNGN;
        } else {
            // Convert NGN discount to target currency
            // NGN rate tells us how many NGN = 1 USD, so: discount_in_currency = discountNGN / NGN_rate
            $ngnRate = self::CURRENCY_RATES['NGN'];
            $discount = round($discountNGN / $ngnRate, 2);
        }
        
        // Total after discount
        $total = max(0, $subtotal - $discount);
        
        $currencySymbol = self::CURRENCY_SYMBOLS[$currency] ?? '$';
        
        return [
            'billing_period' => $billingPeriod,
            'months' => $months,
            'monthly_price' => $monthlyPrice,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $total,
            'currency' => $currency,
            'currency_symbol' => $currencySymbol,
            'save_message' => $discount > 0 ? "Save " . $currencySymbol . number_format($discount, 2) : '',
        ];
    }

    /**
     * Get all billing period options with pricing
     */
    public function getBillingOptions(string $planName, string $currency): array
    {
        $options = [];
        foreach (self::BILLING_PERIOD_MONTHS as $period => $months) {
            $options[$period] = $this->calculateBillingTotal($planName, $currency, $period);
        }
        return $options;
    }
}
