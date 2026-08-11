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

class InvoiceGeneratedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public School $school,
        public string $invoiceNumber,
        public string $dueDate,
        public string $amount
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Invoice Generated - {$this->invoiceNumber}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-generated',
            with: [
                'invoice' => $this->invoice,
                'school' => $this->school,
                'invoiceNumber' => $this->invoiceNumber,
                'dueDate' => $this->dueDate,
                'amount' => $this->amount,
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
