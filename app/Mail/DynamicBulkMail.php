<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DynamicBulkMail extends Mailable
{
    use Queueable, SerializesModels;

    public $headerText;
    public $bodyHtml;
    public $subjectText;
    public $template;
    public $ctaText;
    public $ctaUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        string $subjectText,
        string $headerText,
        string $bodyHtml,
        string $template = 'standard',
        ?string $ctaText = null,
        ?string $ctaUrl = null,
    ) {
        $this->subjectText = $subjectText;
        $this->headerText = $headerText;
        $this->bodyHtml = $bodyHtml;
        $this->template = $template;
        $this->ctaText = $ctaText;
        $this->ctaUrl = $ctaUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectText,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.dynamic_bulk',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
