<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'description'];

    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Determine the active AI Provider based on Manual Override vs. Cache
     */
    public static function getActiveAIProvider(): array
    {
        $aiConfig = self::get('ai_config', [
            'manual_override_enabled' => false,
            'manual_provider_choice' => 'claude',
        ]);

        if ($aiConfig['manual_override_enabled'] ?? false) {
            return [
                'provider' => $aiConfig['manual_provider_choice'] ?? 'claude',
                'is_manual' => true,
            ];
        }

        // Automated normal cache lookup
        $provider = \Illuminate\Support\Facades\Cache::get('skeeme:active_ai_provider', 'claude');
        $fallbackActive = \Illuminate\Support\Facades\Cache::get('use_deepseek_fallback', false);

        return [
            // If the circuit breaker tripped, force deepseek
            'provider' => $fallbackActive ? 'deepseek' : $provider,
            'is_manual' => false,
        ];
    }

    /**
     * Send an email alert to the admin if a manually forced AI model fails.
     */
    public static function triggerManualFailureAlert(string $provider, string $context, string $errorDetails): void
    {
        try {
            \Illuminate\Support\Facades\Log::critical("Manual Override Model ({$provider}) Failed during {$context}!", ['error' => $errorDetails]);
            \Illuminate\Support\Facades\Mail::raw(
                "Manual AI Override for {$provider} failed during {$context}.\n\nError details:\n{$errorDetails}",
                function ($message) use ($provider) {
                    $message->to('otuturusolomom@gmail.com')
                            ->subject("🚨 AI Alert: Manual " . strtoupper($provider) . " is DOWN")
                            ->from(config('mail.from.address'), config('mail.from.name'));
                }
            );
        } catch (\Throwable $th) {
            // Suppress mail errors to prevent blocking the catch block completely
        }
    }

    public static function getPricingConfig()
    {
        $defaults = [
            'ngn' => [
                'standard' => [
                    'monthly' => 3500, 
                    'yearly' => 25000, 
                    'promoMonthly' => 2600, 
                    'credits' => 6000, 
                    'weekly' => 1500,
                    'monthly_plan_code' => 'PLN_standard_monthly',
                    'yearly_plan_code' => 'PLN_standard_yearly'
                ],
                'elite' => [
                    'monthly' => 5000, 
                    'yearly' => 50000, 
                    'promoMonthly' => 3700, 
                    'credits' => 20000, 
                    'weekly' => 5000,
                    'monthly_plan_code' => 'PLN_elite_monthly',
                    'yearly_plan_code' => 'PLN_elite_yearly'
                ]
            ],
            'usd' => [
                'standard' => ['monthly' => 4.99, 'yearly' => 39.99, 'promoMonthly' => 3.4, 'credits' => 6000, 'weekly' => 1500],
                'elite' => ['monthly' => 9.99, 'yearly' => 79.99, 'promoMonthly' => 6.99, 'credits' => 20000, 'weekly' => 5000]
            ],
            'promos' => [
                'standard_end' => '2026-03-22 23:59:59',
                'elite_end' => '2026-03-15 23:59:59'
            ],
            'credit_packs' => [
                'ngn' => [
                    ['amount' => 200, 'price' => 1500],
                    ['amount' => 500, 'price' => 2800],
                    ['amount' => 1000, 'price' => 4000],
                    ['amount' => 5000, 'price' => 9500]
                ],
                'usd' => [
                    ['amount' => 200, 'price' => 2.00],
                    ['amount' => 500, 'price' => 3.70],
                    ['amount' => 1000, 'price' => 6.00],
                    ['amount' => 5000, 'price' => 15.00]
                ]
            ],
            'rates' => [
                'scan_solve' => 25,
                'quiz_base' => 1,
                'quiz_weight' => 5, // per 500 words
                'flashcard_base' => 1,
                'flashcard_weight' => 5, // per 500 words
                'theory_grading' => 2,
            ]
        ];

        $dbValue = self::get('pricing', []);
        
        return array_replace_recursive($defaults, $dbValue);
    }

    /**
     * Get a setting by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting by key.
     */
    public static function set(string $key, $value, ?string $description = null)
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description
            ]
        );

        if ($key === 'pricing') {
            \Illuminate\Support\Facades\Cache::forget('system_pricing_config');
        }

        return $setting;
    }
}
