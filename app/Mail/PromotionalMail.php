<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PromotionalMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $viewName;
    public $customSubject;
    public $data;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $viewName, string $customSubject, array $data = [])
    {
        $this->user = $user;
        $this->viewName = $viewName;
        $this->customSubject = $customSubject;
        
        // Mock data for templates if not provided
        $this->data = array_merge([
            'sessionsCount' => 12,
            'creditsSpent' => 48,
            'streakCount' => 5,
            'topActivity' => 'Flashcard Mastery',
            'surveyUrl' => 'https://skeeme.ng/feedback',
            'planName' => 'Skeeme Master Pro',
            'nextBillingDate' => now()->addMonth()->format('F d, Y'),
            'code' => '482910',
            'name' => $user->name,
        ], $data);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->customSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.' . $this->viewName,
            with: array_merge(['user' => $this->user], $this->data),
        );
    }
}
