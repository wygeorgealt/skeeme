<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Services\InvoicePdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class InvoiceEmail extends Mailable
{
    use Queueable, SerializesModels;

    private string $emailSubject;
    private string $emailRecipient;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invoice $invoice,
        string $recipientEmail = '',
        string $subject = '',
        public bool $includePaymentLink = false
    ) {
        $this->emailRecipient = $recipientEmail ?: $invoice->school->email;
        $this->emailSubject = $subject ?: "Invoice {$invoice->invoice_number} - Skeeme";
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailSubject,
            from: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'invoice' => $this->invoice,
                'school' => $this->invoice->school,
                'paymentLink' => $this->includePaymentLink ? route('settings.subscription-billing') : null,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        try {
            $pdfService = app(InvoicePdfService::class);
            $filePath = $pdfService->getFilePath($this->invoice);

            return [
                Attachment::fromPath($filePath)
                    ->as('Invoice-' . $this->invoice->invoice_number . '.pdf')
                    ->withMime('application/pdf'),
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to attach invoice PDF', [
                'invoice_id' => $this->invoice->id,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }
}
