<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected PaystackService $paystack;

    public function __construct(PaystackService $paystack)
    {
        $this->paystack = $paystack;
    }

    /**
     * Initialize payment for upgrading subscription
     */
    public function initiatePlanUpgrade(Request $request, Subscription $subscription)
    {
        // Verify subscription belongs to authenticated user's school
        if ($subscription->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'plan_name' => 'required|in:Pro,Enterprise',
            'billing_period' => 'required|in:monthly,biannual,annual',
        ]);

        try {
            // Detect currency from school timezone
            $school = $subscription->school;
            $timezone = $school->timezone ?? 'UTC';
            $currency = $this->detectCurrencyFromTimezone($timezone);
            
            \Log::info('Timezone and currency detection', [
                'school_id' => $school->id,
                'timezone' => $timezone,
                'detected_currency' => $currency,
            ]);
            
            // Get the plan details for the target plan
            $planName = $request->plan_name;
            $billingPeriod = $request->billing_period;
            
            // Calculate billing total with discount
            $billingTotal = $subscription->calculateBillingTotal($planName, $currency, $billingPeriod);
            
            if (isset($billingTotal['error'])) {
                throw new \Exception($billingTotal['error']);
            }
            
            $totalAmount = $billingTotal['total'];
            
            if ($totalAmount <= 0) {
                throw new \Exception("Invalid billing total: $totalAmount");
            }
            
            // Create invoice for upgrade
            $invoice = Invoice::create([
                'school_id' => $subscription->school_id,
                'subscription_id' => $subscription->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => $request->plan_name,
                'amount' => $totalAmount,
                'currency' => $currency,
                'invoice_date' => now(),
                'due_date' => now()->addDays(7),
                'status' => 'draft',
                'description' => "Upgrade to {$request->plan_name} plan ({$billingPeriod})",
            ]);

            // Initialize payment with Paystack
            \Log::info('Payment details', [
                'plan' => $planName,
                'billing_period' => $billingPeriod,
                'months' => $billingTotal['months'],
                'monthly_price' => $billingTotal['monthly_price'],
                'subtotal' => $billingTotal['subtotal'],
                'discount' => $billingTotal['discount'],
                'total_amount' => $totalAmount,
                'currency' => $currency,
                'invoice_id' => $invoice->id,
            ]);

            $paymentData = $this->paystack->initializePayment(
                $invoice,
                auth()->user()->email,
                json_encode([
                    'action' => 'upgrade_plan',
                    'new_plan' => $request->plan_name,
                    'billing_period' => $billingPeriod,
                    'months' => $billingTotal['months'],
                ])
            );

            // Create payment record
            $payment = Payment::create([
                'school_id' => $subscription->school_id,
                'subscription_id' => $subscription->id,
                'invoice_id' => $invoice->id,
                'transaction_id' => $paymentData['reference'],
                'payment_method' => 'paystack',
                'amount' => $invoice->amount,
                'currency' => $invoice->currency,
                'status' => Payment::STATUS_PENDING,
                'metadata' => json_encode([
                    'authorization_url' => $paymentData['authorization_url'],
                    'access_code' => $paymentData['access_code'],
                    'billing_period' => $billingPeriod,
                ]),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Payment initialized',
                'authorization_url' => $paymentData['authorization_url'],
                'reference' => $paymentData['reference'],
            ]);
        } catch (\Exception $e) {
            Log::error('Payment initialization failed', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to initialize payment: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Verify payment and update subscription
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        try {
            $verificationResult = $this->paystack->verifyPayment($request->reference);

            if (!$verificationResult['status']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Payment verification failed',
                ], 400);
            }

            $paystackData = $verificationResult['data'];

            // Find payment by transaction ID
            $payment = Payment::where('transaction_id', $request->reference)->first();

            if (!$payment) {
                Log::warning('Payment record not found for verification', [
                    'reference' => $request->reference,
                ]);
                return response()->json([
                    'status' => false,
                    'message' => 'Payment record not found',
                ], 404);
            }

            // Update payment with Paystack data
            $payment->update([
                'status' => $this->mapPaystackStatus($paystackData['status']),
                'paid_at' => $paystackData['paid_at'] ? \Carbon\Carbon::parse($paystackData['paid_at']) : null,
                'metadata' => json_encode([
                    'authorization_code' => $paystackData['authorization']['authorization_code'] ?? null,
                    'customer_code' => $paystackData['customer']['customer_code'] ?? null,
                    'last_4' => $paystackData['authorization']['last_4'] ?? null,
                    'card_type' => $paystackData['authorization']['card_type'] ?? null,
                ]),
            ]);

            // If payment is completed, mark invoice as paid
            if ($payment->isCompleted()) {
                $payment->markAsCompleted($request->reference);

                // TODO: Update subscription plan if this is an upgrade
                // Check invoice metadata to see if it's for a plan upgrade

                return response()->json([
                    'status' => true,
                    'message' => 'Payment verified and processed',
                    'payment_id' => $payment->id,
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Payment status: ' . $paystackData['status'],
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment verification error', [
                'reference' => $request->reference,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Verification error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Paystack webhook handler
     */
    public function webhook(Request $request)
    {
        $signature = $request->header('X-Paystack-Signature');

        if (!$signature || !$this->paystack->verifyWebhookSignature($signature, $request->getContent())) {
            Log::warning('Invalid webhook signature');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        try {
            $event = $request->json('event');
            $data = $request->json('data');

            switch ($event) {
                case 'charge.success':
                    $this->handleChargeSuccess($data);
                    break;
                case 'charge.failed':
                    $this->handleChargeFailed($data);
                    break;
                case 'subscription.create':
                    $this->handleSubscriptionCreate($data);
                    break;
                case 'subscription.disable':
                    $this->handleSubscriptionDisable($data);
                    break;
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Webhook processing error', [
                'error' => $e->getMessage(),
                'event' => $event ?? 'unknown',
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    /**
     * Handle successful charge from webhook
     */
    protected function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'];

        $payment = Payment::where('transaction_id', $reference)->first();
        if ($payment) {
            $payment->markAsCompleted($reference);
            Log::info('Payment completed via webhook', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle failed charge from webhook
     */
    protected function handleChargeFailed(array $data): void
    {
        $reference = $data['reference'];

        $payment = Payment::where('transaction_id', $reference)->first();
        if ($payment) {
            $payment->markAsFailed($data['gateway_response'] ?? 'Payment failed');
            Log::warning('Payment failed via webhook', ['payment_id' => $payment->id]);
        }
    }

    /**
     * Handle subscription creation from webhook
     */
    protected function handleSubscriptionCreate(array $data): void
    {
        Log::info('Subscription created via webhook', $data);
    }

    /**
     * Handle subscription disable from webhook
     */
    protected function handleSubscriptionDisable(array $data): void
    {
        Log::info('Subscription disabled via webhook', $data);
    }

    /**
     * Map Paystack status to our payment status
     */
    protected function mapPaystackStatus(string $paystackStatus): string
    {
        $mapping = [
            'success' => Payment::STATUS_COMPLETED,
            'pending' => Payment::STATUS_PENDING,
            'abandoned' => Payment::STATUS_FAILED,
            'failed' => Payment::STATUS_FAILED,
        ];

        return $mapping[$paystackStatus] ?? Payment::STATUS_PENDING;
    }

    /**
     * Detect currency from timezone
     */
    protected function detectCurrencyFromTimezone(string $timezone): string
    {
        $timezoneToRegion = [
            'Africa/Lagos' => 'NGN',
            'Africa/Cairo' => 'EGP',
            'Africa/Johannesburg' => 'ZAR',
            'Africa/Nairobi' => 'KES',
            'Europe/London' => 'GBP',
            'Europe/Paris' => 'EUR',
            'Europe/Berlin' => 'EUR',
            'Asia/Dubai' => 'AED',
            'Asia/Singapore' => 'SGD',
            'America/New_York' => 'USD',
            'America/Los_Angeles' => 'USD',
            'America/Toronto' => 'CAD',
        ];

        return $timezoneToRegion[$timezone] ?? 'USD';
    }
}
