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
        ]);

        // Send the contact message to the support email
        Mail::to(config('mail.from.address'))->send(new ContactMessage($validated));

        return redirect()->back()->with('success', 'Thank you for your message. We will get back to you soon.');
    }
}
