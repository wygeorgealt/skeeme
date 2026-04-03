<?php

namespace App\Console\Commands;

use App\Models\IndividualSubscription;
use App\Models\SystemSetting;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaystackService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptionBilling extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:process-subscription-billing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process trial ends and recurring billing for student subscriptions using dynamic pricing';

    protected PaystackService $paystack;

    public function __construct(PaystackService $paystack)
    {
        parent::__construct();
        $this->paystack = $paystack;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting subscription billing process...');

        // 1. Process Finished Trials
        $this->processTrialEnds();

        // 2. Process Recurring Renewals (Expired but have auth code)
        $this->processRenewals();

        $this->info('Billing process completed.');
    }

    protected function processTrialEnds()
    {
        $subscriptions = IndividualSubscription::where('is_trial', true)
            ->where('trial_ends_at', '<=', now())
            ->whereNotNull('paystack_authorization')
            ->where('auto_renew', true) // Only bill if they haven't cancelled during trial
            ->where('status', 'active')
            ->get();

        $this->info("Found " . $subscriptions->count() . " trials ending.");

        foreach ($subscriptions as $sub) {
            $this->chargeSubscription($sub, "Trial End Replacement");
        }
    }

    protected function processRenewals()
    {
        $subscriptions = IndividualSubscription::where('is_trial', false)
            ->where('expiry_date', '<=', now())
            ->whereNotNull('paystack_authorization')
            ->where('auto_renew', true) // Only bill if they haven't cancelled
            ->where('status', 'active')
            ->get();

        $this->info("Found " . $subscriptions->count() . " active subscriptions due for renewal.");

        foreach ($subscriptions as $sub) {
            $this->chargeSubscription($sub, "Monthly Renewal");
        }
    }

    protected function chargeSubscription(IndividualSubscription $sub, string $reason)
    {
        $user = $sub->user;
        if (!$user || !$user->email) {
            $sub->update(['status' => 'inactive']);
            return;
        }

        $pricing = SystemSetting::getPricingConfig();
        $planKey = strtolower($sub->plan_name);
        $cycle = $sub->billing_cycle;
        
        $amount = $pricing['ngn'][$planKey][$cycle] ?? 0;

        if ($amount <= 0) {
            Log::error("Zero amount detected for dynamic billing", ['sub_id' => $sub->id, 'plan' => $planKey]);
            return;
        }

        $this->info("Charging {$user->email} amount {$amount} for {$sub->plan_name} ({$reason})...");

        try {
            // Create Invoice
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => "Skeeme {$sub->plan_name} ({$cycle})",
                'amount' => $amount,
                'currency' => 'NGN',
                'invoice_date' => now(),
                'due_date' => now()->addDays(1),
                'status' => 'pending',
                'description' => "Recurring charge for {$sub->plan_name} - {$reason}",
            ]);

            // Charge via Paystack Authorization
            $response = $this->paystack->authorizeCharge(
                $sub->paystack_authorization,
                $user->email,
                intval($amount * 100),
                $invoice->invoice_number
            );

            if ($response['status'] && $response['data']['status'] === 'success') {
                // Success!
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'invoice_id' => $invoice->id,
                    'transaction_id' => $response['reference'],
                    'payment_method' => 'paystack',
                    'amount' => $amount,
                    'currency' => 'NGN',
                    'status' => Payment::STATUS_COMPLETED,
                    'paid_at' => now(),
                    'metadata' => json_encode($response['data'])
                ]);

                $invoice->markAsPaid();

                // Extend Subscription
                $duration = $cycle === 'yearly' ? 366 : 31;
                $sub->update([
                    'is_trial' => false,
                    'trial_ends_at' => null,
                    'expiry_date' => now()->addDays($duration),
                    'price' => $amount,
                    'status' => 'active',
                ]);

                $this->info("Successfully billed {$user->email}");

                // TODO: Dispatch SubscriptionRenewedMail
                // Mail::to($user->email)->send(new \App\Mail\SubscriptionRenewedMail($sub, $invoice));
            } else {
                Log::warning("Biling failed for {$user->email}", ['response' => $response]);
                $sub->update(['status' => 'expired']);

                // TODO: Dispatch SubscriptionRenewalFailedMail
                // Mail::to($user->email)->send(new \App\Mail\SubscriptionRenewalFailedMail($sub, $invoice));
            }
        } catch (\Exception $e) {
            Log::error("Subscription Billing Error", [
                'sub_id' => $sub->id,
                'error' => $e->getMessage()
            ]);
            // Don't kill the whole loop
        }
    }
}
