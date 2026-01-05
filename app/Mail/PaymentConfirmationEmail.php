<?php

namespace App\Mail;

use App\Models\Invoice;
use App\Models\School;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public School $school,
        public string $amount,
        public string $paymentDate,
        public string $invoiceNumber
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payment Confirmed - Invoice {$this->invoiceNumber}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-confirmation',
            with: [
                'invoice' => $this->invoice,
                'school' => $this->school,
                'amount' => $this->amount,
                'paymentDate' => $this->paymentDate,
                'invoiceNumber' => $this->invoiceNumber,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath(storage_path("app/invoices/invoice-{$this->invoice->id}.pdf"))
                ->as("Invoice-{$this->invoiceNumber}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
