<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    /**
     * Handle incoming Paystack webhooks
     */
    public function handle(Request $request)
    {
        // 1. Verify Signature (Security)
        if (!$this->isSignatureValid($request)) {
            Log::warning('Paystack Webhook: Invalid Signature');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        Log::info('Paystack Webhook Received', ['event' => $event, 'reference' => $data['reference'] ?? 'N/A']);

        // 2. Route Events
        if ($event === 'charge.success') {
            return $this->handleChargeSuccess($data);
        }

        return response()->json(['status' => 'ignored']);
    }

    /**
     * Process successful charge
     */
    protected function handleChargeSuccess(array $data)
    {
        $reference = $data['reference'];
        $payment = Payment::where('transaction_id', $reference)->first();

        if (!$payment) {
            Log::error('Paystack Webhook: Payment record not found', ['reference' => $reference]);
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->isCompleted()) {
            return response()->json(['status' => 'already_processed']);
        }

        // Capture authorization code for future recurring billing
        $authData = $data['authorization'] ?? [];
        $currentMetadata = is_array($payment->metadata) ? $payment->metadata : json_decode($payment->metadata ?? '[]', true);
        
        $payment->metadata = array_merge($currentMetadata, [
            'authorization_code' => $authData['authorization_code'] ?? null,
            'last_4' => $authData['last_4'] ?? null,
            'brand' => $authData['brand'] ?? null,
            'reusable' => $authData['reusable'] ?? false,
        ]);
        $payment->save();

        // Mark as completed - this triggers the UpdateSubscriptionOnPayment listener
        $payment->markAsCompleted($reference);

        Log::info('Paystack Webhook: Successfully processed charge', ['reference' => $reference]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Verify Paystack signature
     */
    protected function isSignatureValid(Request $request)
    {
        $paystackSignature = $request->header('x-paystack-signature');
        if (!$paystackSignature) return false;

        $computedSignature = hash_hmac('sha512', $request->getContent(), config('services.paystack.secret_key'));
        
        return hash_equals($paystackSignature, $computedSignature);
    }
}
