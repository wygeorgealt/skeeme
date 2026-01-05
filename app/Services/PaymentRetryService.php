<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentRetryService
{
    public const RETRY_INTERVAL_HOURS = 24;
    public const MAX_RETRY_ATTEMPTS = 3;
    public const PAYMENT_TIMEOUT_DAYS = 7;

    /**
     * Get failed payments eligible for retry
     */
    public function getRetryablePayments(): array
    {
        return Payment::where('status', 'failed')
            ->where('retry_count', '<', self::MAX_RETRY_ATTEMPTS)
            ->where(function ($query) {
                // First attempt: retry after 24 hours
                $query->orWhere(function ($q) {
                    $q->where('retry_count', 0)
                        ->where('updated_at', '<=', Carbon::now()->subHours(self::RETRY_INTERVAL_HOURS));
                })
                // Second attempt: retry after 48 hours
                ->orWhere(function ($q) {
                    $q->where('retry_count', 1)
                        ->where('updated_at', '<=', Carbon::now()->subHours(self::RETRY_INTERVAL_HOURS * 2));
                })
                // Third attempt: retry after 72 hours
                ->orWhere(function ($q) {
                    $q->where('retry_count', 2)
                        ->where('updated_at', '<=', Carbon::now()->subHours(self::RETRY_INTERVAL_HOURS * 3));
                });
            })
            ->with(['subscription', 'invoice'])
            ->get()
            ->toArray();
    }

    /**
     * Retry a failed payment
     */
    public function retryPayment(Payment $payment): bool
    {
        try {
            if ($payment->retry_count >= self::MAX_RETRY_ATTEMPTS) {
                $this->markPaymentAbandoned($payment);
                return false;
            }

            // Check if payment has expired
            if ($this->isPaymentExpired($payment)) {
                $this->markPaymentAbandoned($payment);
                return false;
            }

            Log::info('Retrying payment', [
                'payment_id' => $payment->id,
                'retry_count' => $payment->retry_count,
                'subscription_id' => $payment->subscription_id,
            ]);

            // Get Paystack service
            $paystackService = app(PaystackService::class);

            // Attempt to verify and process the payment again
            $result = $paystackService->verifyPayment($payment->reference);

            if ($result['status'] && $result['data']['status'] === 'success') {
                // Payment successful
                $retryAttempt = $payment->retry_count + 1;
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'retry_count' => $retryAttempt,
                    'notes' => "Payment successful on retry attempt #{$retryAttempt}",
                ]);

                // Update invoice status
                if ($payment->invoice_id) {
                    Invoice::find($payment->invoice_id)?->update(['status' => 'paid']);
                }

                Log::info('Payment retry successful', [
                    'payment_id' => $payment->id,
                    'subscription_id' => $payment->subscription_id,
                ]);

                return true;
            } else {
                // Payment still pending or failed
                $payment->increment('retry_count');

                Log::warning('Payment retry still pending/failed', [
                    'payment_id' => $payment->id,
                    'retry_count' => $payment->retry_count,
                ]);

                return false;
            }

        } catch (\Exception $e) {
            Log::error('Error retrying payment', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Increment retry count on error
            $payment->increment('retry_count');

            // If max retries exceeded, mark as abandoned
            if ($payment->retry_count >= self::MAX_RETRY_ATTEMPTS) {
                $this->markPaymentAbandoned($payment);
            }

            return false;
        }
    }

    /**
     * Retry all eligible payments
     */
    public function retryAllEligiblePayments(): array
    {
        $retryablePayments = $this->getRetryablePayments();
        $results = [
            'total' => count($retryablePayments),
            'successful' => 0,
            'failed' => 0,
        ];

        foreach ($retryablePayments as $paymentData) {
            $payment = Payment::find($paymentData['id']);
            if ($this->retryPayment($payment)) {
                $results['successful']++;
            } else {
                $results['failed']++;
            }
        }

        Log::info('Payment retry batch completed', $results);

        return $results;
    }

    /**
     * Mark payment as abandoned
     */
    private function markPaymentAbandoned(Payment $payment): void
    {
        $retryCount = $payment->retry_count;
        $payment->update([
            'status' => 'abandoned',
            'notes' => "Payment abandoned after {$retryCount} retry attempts",
        ]);

        // Mark invoice as overdue if applicable
        if ($payment->invoice_id) {
            Invoice::find($payment->invoice_id)?->update(['status' => 'overdue']);
        }

        // Log the abandonment
        Log::warning('Payment marked as abandoned', [
            'payment_id' => $payment->id,
            'subscription_id' => $payment->subscription_id,
            'retry_count' => $payment->retry_count,
        ]);

        // Optionally: Notify admin/school owner
        // You could dispatch an event or send an email here
    }

    /**
     * Check if payment has expired
     */
    private function isPaymentExpired(Payment $payment): bool
    {
        return $payment->created_at->diffInDays(now()) >= self::PAYMENT_TIMEOUT_DAYS;
    }

    /**
     * Get payment retry statistics
     */
    public function getRetryStatistics(): array
    {
        $failedPayments = Payment::where('status', 'failed')->count();
        $abandonedPayments = Payment::where('status', 'abandoned')->count();
        $retriedPayments = Payment::where('status', 'failed')
            ->where('retry_count', '>', 0)
            ->count();

        return [
            'total_failed' => $failedPayments,
            'total_abandoned' => $abandonedPayments,
            'total_retried' => $retriedPayments,
            'recovery_rate' => $failedPayments > 0 ? round((($retriedPayments - $abandonedPayments) / $failedPayments) * 100, 2) : 0,
        ];
    }
}
