<?php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UpgradeConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Subscription $subscription,
        public string $planName = '',
        public string $billingPeriod = 'monthly'
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Upgrade Confirmation - Skeeme {$this->planName} Plan",
            from: config('mail.from.address'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.upgrade-confirmation',
            with: [
                'subscription' => $this->subscription,
                'planName' => $this->planName,
                'billingPeriod' => $this->billingPeriod,
            ],
        );
    }
}
