<?php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Models\Invoice;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class UpdateSubscriptionOnPayment
{
    protected $subscriptionService;

    /**
     * Create the event listener.
     */
    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentCompleted $event): void
    {
        $payment = $event->payment;
        $school = $payment->school;

        Log::info('Processing subscription update for payment', ['payment_id' => $payment->id]);

        // Check metadata or invoice description to determine if this is a plan change/renewal
        // The invoice description is usually "Upgrade to {Plan} plan ({Period})"
        $invoice = $payment->invoice;
        if (!$invoice) {
            Log::warning('Payment has no linked invoice', ['payment_id' => $payment->id]);
            return;
        }

        // Handle Individual Student Subscriptions
        if ($payment->user_id && $invoice->plan_name === 'Student Unlimited' || str_contains($invoice->plan_name, 'Standard') || str_contains($invoice->plan_name, 'Elite')) {
            $user = $payment->user;
            if ($user && $user->role === 'student') {
                $user->update([
                    'is_unlimited_student' => true,
                    'credits' => min(999999, $user->credits + 5000), // Refill logic
                ]);
                Log::info('Student Subscription Activated', ['user_id' => $user->id]);
                return;
            }
        }

        $planName = $invoice->plan_name;
        
        // If we have a plan name and it's valid
        if ($planName && isset(config('subscriptions.plans')[$planName])) {
            try {
                // If it's the same plan, it's a renewal
                $currentSubscription = $school->activeSubscription;
                
                if ($currentSubscription && $currentSubscription->plan_name === $planName) {
                    // Logic for renewal/extension
                    // We need to calculate start date. If active, start date is expiry date. If expired, start date is now.
                    $startDate = $currentSubscription->expiry_date->isFuture() 
                        ? $currentSubscription->expiry_date 
                        : now();
                    
                    // Determine duration from payment/invoice metadata or amount
                    // We can check payment metadata for 'billing_period'
                    $metadata = file_get_contents($payment->metadata) ? json_decode($payment->metadata, true) : [];
                    $billingPeriod = $metadata['billing_period'] ?? 'monthly';
                    
                    $months = Subscription::BILLING_PERIOD_MONTHS[$billingPeriod] ?? 1;
                    $durationDays = $months * 30; // Approximation, usually handled better in Service
                    
                    // Deactivate old subscription
                    $currentSubscription->update(['is_active' => false]);
                    
                    // Create new subscription
                    $this->subscriptionService->createSubscription($school, $planName, [
                        'start_date' => $startDate,
                        'duration_days' => $durationDays,
                    ]);
                    
                    Log::info('Subscription renewed successfully via payment', ['school_id' => $school->id, 'plan' => $planName]);
                    
                } else {
                    // It's an upgrade or new plan
                    // Calling changePlan
                    $this->subscriptionService->changePlan($school, $planName);
                    Log::info('Subscription upgraded successfully via payment', ['school_id' => $school->id, 'plan' => $planName]);
                }
                
            } catch (\Exception $e) {
                Log::error('Failed to update subscription after payment', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}
