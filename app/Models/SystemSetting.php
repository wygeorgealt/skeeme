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

    public static function getPricingConfig()
    {
        return self::get('pricing', [
            'ngn' => [
                'standard' => ['monthly' => 3500, 'yearly' => 25000, 'promoMonthly' => 2600],
                'elite' => ['monthly' => 5000, 'yearly' => 50000, 'promoMonthly' => 3700]
            ],
            'usd' => [
                'standard' => ['monthly' => 4.99, 'yearly' => 39.99, 'promoMonthly' => 3.4],
                'elite' => ['monthly' => 9.99, 'yearly' => 79.99, 'promoMonthly' => 6.99]
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
            ]
        ]);
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
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description
            ]
        );
    }
}
