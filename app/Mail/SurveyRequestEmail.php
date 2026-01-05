<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SurveyRequestEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $surveyTitle,
        public string $surveyDescription,
        public string $surveyUrl,
        public string $recipientType = 'both',
        public string $estimatedTime = '5 minutes'
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your feedback matters - Take our survey',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.survey-request',
            with: [
                'user' => $this->user,
                'surveyTitle' => $this->surveyTitle,
                'surveyDescription' => $this->surveyDescription,
                'surveyUrl' => $this->surveyUrl,
                'recipientType' => $this->recipientType,
                'estimatedTime' => $this->estimatedTime,
            ],
        );
    }
}
