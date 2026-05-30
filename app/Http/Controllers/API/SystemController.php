<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;

class SystemController extends Controller
{
    /**
     * Get dynamic pricing and promotional constraints live from settings
     */
    public function getPricing()
    {
        // Cache the pricing config for 1 hour (3600 seconds)
        // This is highly cacheable and doesn't change often
        $pricingConfig = \Illuminate\Support\Facades\Cache::remember('system_pricing_config', 3600, function () {
            return SystemSetting::getPricingConfig();
        });

        return response()->json($pricingConfig)
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * App version gate for mobile.
     * Returns the minimum required client version and the Play Store URL.
     */
    public function getAppVersion()
    {
        $playStoreUrl = 'https://play.google.com/store/apps/details?id=com.skeeme.app';

        $appJsonPath = base_path('student-app/app.json');

        $minVersion = '0.0.0';
        try {
            if (file_exists($appJsonPath)) {
                $raw = file_get_contents($appJsonPath);
                $parsed = json_decode($raw, true);

                // expo.version is the source of truth (student-app/app.json)
                $minVersion = $parsed['expo']['version'] ?? $minVersion;
            }
        } catch (\Throwable $e) {
            // Keep fallback minVersion
        }

        return response()->json([
            'min_version' => $minVersion,
            'play_store_url' => $playStoreUrl,
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
