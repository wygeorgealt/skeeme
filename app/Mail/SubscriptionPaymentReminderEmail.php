<?php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionPaymentReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Subscription $subscription,
        public int $daysRemaining,
        public string $planName,
        public string $renewalAmount
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Skeeme subscription renews soon',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-payment-reminder',
            with: [
                'subscription' => $this->subscription,
                'daysRemaining' => $this->daysRemaining,
                'planName' => $this->planName,
                'renewalAmount' => $this->renewalAmount,
            ],
        );
    }
}
