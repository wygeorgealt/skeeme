<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UpgradeConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $planName;
    public $nextBillingDate;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $planName, string $nextBillingDate = null)
    {
        $this->user = $user;
        $this->planName = $planName;
        $this->nextBillingDate = $nextBillingDate ?? now()->addMonth()->format('F d, Y');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Congratulations! Your ' . $this->planName . ' Upgrade is Confirmed 🚀',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.upgrade_confirmation',
            with: [
                'user' => $this->user,
                'planName' => $this->planName,
                'nextBillingDate' => $this->nextBillingDate,
            ],
        );
    }
}
