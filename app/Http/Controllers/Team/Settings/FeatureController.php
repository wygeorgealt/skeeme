<?php

namespace App\Http\Controllers\Team\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FeatureController extends Controller
{
    public function index()
    {
        return view('team.settings.features.index');
    }

    public function toggle(Request $request)
    {
        // Process feature toggle logic here
        return redirect()->back()->with('success', 'Feature toggled successfully');
    }
}
