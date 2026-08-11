<?php

namespace App\Http\Controllers\Team\Content;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChangelogController extends Controller
{
    public function index()
    {
        return view('team.content.changelog.index');
    }

    public function store(Request $request)
    {
        // Process changelog entry creation logic here
        return redirect()->back()->with('success', 'Changelog entry created successfully');
    }
}
