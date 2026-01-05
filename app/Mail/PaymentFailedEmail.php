<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $attemptedAmount,
        public string $planName,
        public string $failureReason,
        public string $retryUrl
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment failed - Action required',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-failed',
            with: [
                'user' => $this->user,
                'attemptedAmount' => $this->attemptedAmount,
                'planName' => $this->planName,
                'failureReason' => $this->failureReason,
                'retryUrl' => $this->retryUrl,
            ],
        );
    }
}
