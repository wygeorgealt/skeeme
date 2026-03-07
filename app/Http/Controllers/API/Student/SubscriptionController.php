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

        // Pricing logic (Sync with App/Models/IndividualSubscription)
        // Hardcoded for simplicity in this bridge, should ideally refer to a Config/Service
        $pricing = [
            'standard' => ['monthly' => 3500, 'yearly' => 25000],
            'elite'    => ['monthly' => 5000, 'yearly' => 50000],
        ];

        $amount = $pricing[$plan][$cycle];
        $currency = 'NGN'; // Default to NGN as per Paystack request for local students

        try {
            // 1. Create Invoice
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => "Skeeme " . ucfirst($plan) . " ($cycle)",
                'amount' => $amount,
                'currency' => $currency,
                'invoice_date' => now(),
                'due_date' => now()->addDays(1),
                'status' => 'pending',
                'description' => "Subscription to Skeeme ".ucfirst($plan)." ($cycle)",
            ]);

            // 2. Initialize Paystack
            $paymentData = $this->paystack->initializePayment(
                $invoice,
                $user->email,
                json_encode([
                    'type' => 'student_subscription',
                    'user_id' => $user->id,
                    'plan' => $plan,
                    'cycle' => $cycle
                ])
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
                'message' => 'Failed to initialize payment.',
                'error' => $e->getMessage(), // Surface error for war-room debugging
                'debug' => true
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
            return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Diagnostic endpoint for System Health.
     */
    public function debug()
    {
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
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
