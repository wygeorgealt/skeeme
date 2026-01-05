<?php

namespace App\Http\Controllers\Team\Communications;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function index()
    {
        return view('team.emails.index');
    }

    public function send(Request $request)
    {
        // Process email sending logic here
        return redirect()->back()->with('success', 'Email sent successfully');
    }
}
