<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeAdminEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $schoolName
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Skeeme - Let\'s get started!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-admin',
            with: [
                'user' => $this->user,
                'schoolName' => $this->schoolName,
            ],
        );
    }
}
