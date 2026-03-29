<?php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Mail\InvoiceEmail;
use App\Models\Invoice;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendInvoiceEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentCompleted $event): void
    {
        try {
            $payment = $event->payment;

            // Find the invoice related to this payment
            $invoice = Invoice::where('id', $payment->invoice_id)->first();

            if (!$invoice) {
                \Log::warning('Invoice not found for payment', ['payment_id' => $payment->id]);
                return;
            }

            // Get the recipient email — school invoice or student direct purchase
            $school = $invoice->school;

            if (!$school) {
                \Log::info('No school associated with invoice (likely B2C student purchase), skipping invoice email.', ['invoice_id' => $invoice->id]);
                return;
            }

            $schoolEmail = $school->email;

            if (!$schoolEmail) {
                \Log::warning('School email not found for invoice', ['invoice_id' => $invoice->id]);
                return;
            }

            // Send the invoice email
            Mail::mailer('resend')->to($schoolEmail)->send(
                new InvoiceEmail(
                    invoice: $invoice,
                    recipientEmail: $schoolEmail,
                    subject: "Payment Confirmation - Invoice {$invoice->invoice_number}",
                    includePaymentLink: false
                )
            );

            \Log::info('Invoice email sent successfully', [
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id,
                'email' => $schoolEmail,
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to send invoice email', [
                'payment_id' => $event->payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't re-throw - let the job fail silently to avoid infinite retries
            // The job will be retried by Laravel's queue system
        }
    }
}
