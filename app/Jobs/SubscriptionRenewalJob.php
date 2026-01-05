<?php

namespace App\Jobs;

use App\Models\Subscription;
use App\Services\PaystackService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SubscriptionRenewalJob implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     */
    public int $maxExceptions = 1;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $retryAfter = 3600; // 1 hour

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(PaystackService $paystackService): void
    {
        Log::info('SubscriptionRenewalJob: Starting auto-renewal process');

        try {
            // Find subscriptions that are expiring within 3 days and have auto_renew enabled
            $expiringSubscriptions = Subscription::where('auto_renew', true)
                ->where('is_active', true)
                ->whereBetween('expiry_date', [
                    now(),
                    now()->addDays(3)
                ])
                ->with(['school', 'payments'])
                ->get();

            Log::info("SubscriptionRenewalJob: Found {$expiringSubscriptions->count()} subscriptions for renewal");

            foreach ($expiringSubscriptions as $subscription) {
                $this->renewSubscription($subscription, $paystackService);
            }

            // Also check for already expired subscriptions with auto_renew that we might have missed
            $overdueSubscriptions = Subscription::where('auto_renew', true)
                ->where('is_active', true)
                ->where('expiry_date', '<', now())
                ->with(['school', 'payments'])
                ->limit(10) // Process max 10 overdue per run
                ->get();

            Log::info("SubscriptionRenewalJob: Found {$overdueSubscriptions->count()} overdue subscriptions");

            foreach ($overdueSubscriptions as $subscription) {
                $this->renewSubscription($subscription, $paystackService);
            }
        } catch (\Exception $e) {
            Log::error('SubscriptionRenewalJob failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Process renewal for a single subscription
     */
    protected function renewSubscription(Subscription $subscription, PaystackService $paystackService): void
    {
        try {
            Log::info("Processing renewal for subscription {$subscription->id}", [
                'school_id' => $subscription->school_id,
                'plan' => $subscription->plan_name,
                'expiry' => $subscription->expiry_date,
            ]);

            $payment = $paystackService->processAutoRenewal($subscription);

            if ($payment && $payment->isCompleted()) {
                Log::info("Subscription {$subscription->id} renewed successfully", [
                    'payment_id' => $payment->id,
                ]);

                // Send renewal confirmation email
                // event(new SubscriptionRenewed($subscription, $payment));
            } else {
                Log::warning("Subscription {$subscription->id} renewal failed or pending", [
                    'subscription_id' => $subscription->id,
                ]);

                // Mark subscription as expired if payment failed and already past due
                if ($subscription->expiry_date->isPast()) {
                    $subscription->update(['is_active' => false]);
                    Log::warning("Subscription {$subscription->id} marked as inactive due to failed renewal");

                    // Send failure notification email
                    // event(new SubscriptionRenewalFailed($subscription));
                }
            }
        } catch (\Exception $e) {
            Log::error("Error renewing subscription {$subscription->id}", [
                'message' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);

            // Don't rethrow - continue processing other subscriptions
        }
    }
}
