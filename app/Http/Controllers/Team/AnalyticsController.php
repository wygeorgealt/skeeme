<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;

class AnalyticsController extends Controller
{
    public function index() { return view('team.analytics.index'); }
    public function userGrowth() { return view('team.analytics.user-growth'); }
    public function revenue() { return view('team.analytics.revenue'); }
    public function apiUsage() { return view('team.analytics.api-usage'); }
    public function export() { /* TODO: Export analytics */ }
}
