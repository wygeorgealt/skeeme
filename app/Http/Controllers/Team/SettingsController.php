<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;

class SettingsController extends Controller
{
    public function index() { return view('team.settings.index'); }
    public function update() { /* TODO: Update settings */ }
    public function features() { return view('team.settings.features'); }
    public function toggleFeature() { /* TODO: Toggle feature */ }
}
