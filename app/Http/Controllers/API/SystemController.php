<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

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
}
