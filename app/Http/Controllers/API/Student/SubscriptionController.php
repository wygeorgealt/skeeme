<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SubscriptionController extends Controller
{
    protected PaystackService $paystack;

    public function __construct(PaystackService $paystack)
    {
        $this->paystack = $paystack;
    }

    /**
     * Initialize a subscription checkout.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:standard,elite',
            'cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = $request->plan;
        $cycle = $request->cycle;
        $isTrial = $request->boolean('is_trial', false);

        // Dynamic Pricing
        $pricing = \App\Models\SystemSetting::getPricingConfig();
        // Validate trial eligibility: Only Elite Monthly is allowed a trial
        $isTrial = $request->boolean('is_trial', false);
        $currency = 'NGN'; 
        if ($isTrial && ($plan !== 'elite' || $cycle !== 'monthly')) {
            return response()->json(['message' => 'Trial is only available for the Elite Monthly plan.'], 400);
        }

        if ($isTrial) {
            $amount = $pricing['ngn']['verification_amount'] ?? 100; 
        } else {
            if (isset($pricing['promos'][$plan . '_end']) && $cycle === 'monthly' && now()->lt(\Illuminate\Support\Carbon::parse($pricing['promos'][$plan . '_end']))) {
                $amount = $pricing['ngn'][$plan]['promoMonthly'];
            } else {
                $amount = $pricing['ngn'][$plan][$cycle];
            }
        }

        try {
            // 1. Create Invoice
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => "Skeeme " . ucfirst($plan) . " ($cycle)" . ($isTrial ? " [Trial]" : ""),
                'amount' => $amount,
                'currency' => $currency,
                'invoice_date' => now(),
                'due_date' => now()->addDays(1),
                'status' => 'pending',
                'description' => $isTrial ? "Card verification for 3rd-Day Free Trial" : "Subscription to Skeeme ".ucfirst($plan)." ($cycle)",
            ]);

            // 2. Initialize Paystack
            // We DO NOT pass planCode or startDate here because we want to control the amount 
            // from our admin dashboard (Paystack Plans have static amounts).
            // Define payment channels: For trials, we MUST have a card for future billing
            $channels = $isTrial ? ['card'] : ['card', 'bank', 'ussd', 'qr', 'transfer'];

            $paymentData = $this->paystack->initializePayment(
                $invoice,
                $user->email,
                json_encode([
                    'type' => 'student_subscription',
                    'user_id' => $user->id,
                    'plan' => $plan,
                    'cycle' => $cycle,
                    'is_trial' => $isTrial,
                    'intended_amount' => $pricing['ngn'][$plan][$cycle]
                ]),
                null,
                null,
                $channels
            );

            // 3. Create Payment Record (Pending)
            Payment::create([
                'user_id' => $user->id,
                'invoice_id' => $invoice->id,
                'transaction_id' => $paymentData['reference'],
                'payment_method' => 'paystack',
                'amount' => $amount,
                'currency' => $currency,
                'status' => Payment::STATUS_PENDING,
                'metadata' => json_encode([
                    'authorization_url' => $paymentData['authorization_url'],
                    'plan' => $plan,
                    'cycle' => $cycle
                ])
            ]);

            return response()->json([
                'status' => 'success',
                'authorization_url' => $paymentData['authorization_url'],
                'reference' => $paymentData['reference']
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription Initialization Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to initialize payment. Please check your internet connection or contact support.'
            ], 500);
        }
    }

    /**
     * Verify payment status via polling or callback.
     */
    public function verify(Request $request, $reference)
    {
        $payment = Payment::where('transaction_id', $reference)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment record not found.'], 404);
        }

        // If already completed by webhook, just return success
        if ($payment->isCompleted()) {
            return response()->json([
                'status' => 'success',
                'user' => $request->user()->fresh()
            ]);
        }

        try {
            // Verify with Paystack API
            $verification = $this->paystack->verifyPayment($reference);

            if ($verification['status'] && $verification['data']['status'] === 'success') {
                // Capture authorization code for future recurring billing or trial end
                $authData = $verification['data']['authorization'] ?? [];
                $currentMetadata = is_array($payment->metadata) ? $payment->metadata : json_decode($payment->metadata ?? '[]', true);
                
                $authorizationCode = $authData['authorization_code'] ?? null;
                $encryptedAuthCode = $authorizationCode ? \Illuminate\Support\Facades\Crypt::encryptString($authorizationCode) : null;

                $payment->metadata = array_merge($currentMetadata, [
                    'authorization_code' => $encryptedAuthCode,
                    'last_4' => $authData['last_4'] ?? null,
                    'brand' => $authData['brand'] ?? null,
                ]);
                $payment->save();

                $payment->markAsCompleted($reference);
                
                return response()->json([
                    'status' => 'success',
                    'user' => $request->user()->fresh()
                ]);
            }

            return response()->json([
                'status' => 'pending',
                'message' => 'Payment is still processing or was abandoned.'
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription Verification Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error', 
                'message' => 'Could not verify your payment. Please contact support if your credits do not appear.'
            ], 500);
        }
    }

    /**
     * Diagnostic endpoint for System Health.
     */
    public function debug()
    {
        if (!app()->environment(['local', 'staging'])) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        try {
            // Check default cache store
            Cache::put('health_check', true, 10);
            $cacheOk = Cache::get('health_check');
            
            return response()->json([
                'status' => 'Healthy',
                'cache' => $cacheOk ? 'Working' : 'Failed',
                'cache_driver' => config('cache.default'),
                'queue_driver' => config('queue.default'),
                'env' => config('app.env'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'System diagnostics unavailable.'], 500);
        }
    }

    /**
     * Initialize a single credit pack checkout.
     */
    public function checkoutCredits(Request $request)
    {
        $request->validate([
            'amount' => 'required|in:200,500,1000,5000',
        ]);

        $user = $request->user();
        $amountCredits = (int) $request->amount;

        $pricing = \App\Models\SystemSetting::getPricingConfig();
        $pack = collect($pricing['credit_packs']['ngn'])->firstWhere('amount', $amountCredits);

        if (!$pack) {
            return response()->json(['message' => 'Invalid credit pack disabled by admin.'], 400);
        }
        
        $price = $pack['price'];
        $currency = 'NGN'; 

        try {
            // 1. Create Invoice
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => "Skeeme Credit Pack ($amountCredits)",
                'amount' => $price,
                'currency' => $currency,
                'invoice_date' => now(),
                'due_date' => now()->addDays(1),
                'status' => 'pending',
                'description' => "Purchase of $amountCredits Skeeme Credits",
            ]);

            // 2. Initialize Paystack
            $paymentData = $this->paystack->initializePayment(
                $invoice,
                $user->email,
                json_encode([
                    'type' => 'credit_pack',
                    'user_id' => $user->id,
                    'credits' => $amountCredits
                ])
            );

            // 3. Create Payment Record (Pending)
            Payment::create([
                'user_id' => $user->id,
                'invoice_id' => $invoice->id,
                'transaction_id' => $paymentData['reference'],
                'payment_method' => 'paystack',
                'amount' => $price,
                'currency' => $currency,
                'status' => Payment::STATUS_PENDING,
                'metadata' => json_encode([
                    'authorization_url' => $paymentData['authorization_url'],
                    'credits' => $amountCredits
                ])
            ]);

            return response()->json([
                'status' => 'success',
                'authorization_url' => $paymentData['authorization_url'],
                'reference' => $paymentData['reference']
            ]);

        } catch (\Exception $e) {
            Log::error('Credit Pack Initialization Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to initialize payment.'
            ], 500);
        }
    }

    /**
     * Verify payment status for credit packs via polling.
     */
    public function verifyCredits(Request $request, $reference)
    {
        $payment = Payment::where('transaction_id', $reference)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment record not found.'], 404);
        }

        // If already completed by webhook, just return success
        if ($payment->isCompleted()) {
            return response()->json([
                'status' => 'success',
                'user' => $request->user()->fresh()
            ]);
        }

        try {
            $verification = $this->paystack->verifyPayment($reference);

            if ($verification['status'] && $verification['data']['status'] === 'success') {
                $payment->markAsCompleted($reference);
                
                $meta = json_decode($payment->metadata, true);
                if (isset($meta['credits'])) {
                    $request->user()->increment('credits', (int) $meta['credits']);
                }
                
                return response()->json([
                    'status' => 'success',
                    'user' => $request->user()->fresh()
                ]);
            }

            return response()->json([
                'status' => 'pending',
                'message' => 'Payment is still processing.'
            ]);
        } catch (\Exception $e) {
            Log::error('Credit Verification Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error', 
                'message' => 'Could not verify your payment. Please contact support if your credits do not appear.'
            ], 500);
        }
    }
    /**
     * Cancel the auto-renewal of a subscription.
     */
    public function cancel(Request $request)
    {
        $user = $request->user();
        $subscription = \App\Models\IndividualSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found to cancel.'], 404);
        }

        if (!$subscription->auto_renew) {
            return response()->json(['message' => 'Subscription is already set to expire without renewal.'], 400);
        }

        $subscription->update(['auto_renew' => false]);

        return response()->json([
            'status' => 'success',
            'message' => 'Auto-renewal has been disabled. Your benefits will continue until ' . $subscription->expiry_date->format('M d, Y') . '.',
            'subscription' => $subscription
        ]);
    }
}
