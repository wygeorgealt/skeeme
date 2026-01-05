<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LandingController extends Controller
{
    public function index()
    {
        return view('landing.index');
    }

    public function setCurrency(Request $request)
    {
        $currency = $request->input('currency', 'naira');
        session(['currency' => $currency]);
        
        return response()->json(['success' => true]);
    }
}