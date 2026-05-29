<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentWelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Skeeme — Your AI Study Partner Awaits 🎉',
            from: config('mail.from.address'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-welcome',
            with: [
                'user' => $this->user,
                'firstName' => explode(' ', $this->user->name ?? 'Student')[0],
            ],
        );
    }
}
