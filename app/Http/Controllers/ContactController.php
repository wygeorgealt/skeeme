<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMessage;

class ContactController extends Controller
{
    /**
     * Display the contact form
     */
    public function index()
    {
        return view('contact.index');
    }

    /**
     * Store contact message
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
            'website' => 'nullable|max:0', // Honeypot field - should be empty
        ]);

        // Honeypot check - if filled, it's likely a bot
        if (!empty($validated['website'])) {
            return redirect()->back()->with('success', 'Thank you for your message. We will get back to you soon.');
        }

        // Block suspicious email domains commonly used by spammers
        $suspiciousDomains = [
            'search-skeeme.com',
            'ai-skeeme.com',
            'seo4skeeme.com',
            'seodir.pro',
            'aireg.pro',
            'searchregister.info',
        ];

        $emailDomain = substr(strrchr($validated['email'], "@"), 1);
        if (in_array(strtolower($emailDomain), $suspiciousDomains)) {
            return redirect()->back()->with('success', 'Thank you for your message. We will get back to you soon.');
        }

        // Send the contact message to the support email
        Mail::mailer('resend')->to('otuturusolomom@gmail.com')->send(new ContactMessage($validated));

        return redirect()->back()->with('success', 'Thank you for your message. We will get back to you soon.');
    }
}
