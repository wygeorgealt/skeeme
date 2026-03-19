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
        return response()->json(SystemSetting::getPricingConfig());
    }
}
