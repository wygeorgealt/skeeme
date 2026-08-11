<?php

namespace App\Mail;

use App\Models\User;
use App\Models\School;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LecturerApprovalNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $lecturer,
        public School $school,
        public string $adminName,
        public string $firstLoginUrl
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're approved! Welcome to {$this->school->name} on Skeeme",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.lecturer-approval-notification',
            with: [
                'lecturer' => $this->lecturer,
                'school' => $this->school,
                'adminName' => $this->adminName,
                'firstLoginUrl' => $this->firstLoginUrl,
            ],
        );
    }
}
