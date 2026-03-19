<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
// use App\Mail\DemoRequest; // To be created

class BookDemoController extends Controller
{
    /**
     * Display the book a demo page
     */
    public function index()
    {
        return view('landing.book-demo');
    }

    /**
     * Process demo booking request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'school_name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'nullable|string|max:1000',
        ]);

        // Create the demo request
        \App\Models\DemoRequest::create(array_merge($validated, [
            'ip_address' => $request->ip(),
        ]));

        // TODO: Send email
        // Mail::mailer('resend')->to(config('mail.from.address'))->send(new DemoRequest($validated));

        return redirect()->back()->with('success', 'Thank you for your interest. We will contact you shortly to schedule your demo.');
    }
}
