<?php

namespace App\Http\Controllers\Team\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function index()
    {
        return view('team.settings.system.index');
    }

    public function update(Request $request)
    {
        // Process system settings update logic here
        return redirect()->back()->with('success', 'System settings updated successfully');
    }
}
