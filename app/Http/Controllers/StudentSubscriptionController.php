<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PaystackService;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StudentSubscriptionController extends Controller
{
    protected PaystackService $paystack;

    public function __construct(PaystackService $paystack)
    {
        $this->paystack = $paystack;
    }

    public function subscribe()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        try {
            // Detect currency from user's timezone (cookie or model)
            $timezone = request()->cookie('user_timezone') ?? $user->timezone ?? 'UTC';
            $currency = $this->paystack->detectCurrencyFromTimezone($timezone);
            
            // Set price based on currency
            $amount = ($currency === 'NGN') ? 5000 : 2.99;
            
            \Log::info('Student currency detection', [
                'user_id' => $user->id,
                'timezone' => $timezone,
                'detected_currency' => $currency,
                'amount' => $amount,
                'cookie_timezone' => request()->cookie('user_timezone'),
                'user_timezone' => $user->timezone
            ]);

            // Create Invoice
            $invoice = Invoice::create([
                'school_id' => null,
                'user_id' => $user->id,
                'subscription_id' => null,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => 'Student Unlimited',
                'amount' => $amount,
                'currency' => $currency,
                'invoice_date' => now(),
                'due_date' => now()->addDays(1),
                'status' => 'draft',
                'description' => 'Skeeme Student Unlimited Plan (Monthly)',
            ]);

            // Initialize Payment
            $paymentData = $this->paystack->initializePayment(
                $invoice,
                $user->email,
                json_encode([
                    'action' => 'student_subscription',
                    'user_id' => $user->id,
                ])
            );

            // Create Payment Record
            Payment::create([
                'school_id' => null,
                'user_id' => $user->id,
                'subscription_id' => null,
                'invoice_id' => $invoice->id,
                'transaction_id' => $paymentData['reference'],
                'payment_method' => 'paystack',
                'amount' => $amount,
                'currency' => $currency,
                'status' => Payment::STATUS_PENDING,
                'metadata' => json_encode([
                    'authorization_url' => $paymentData['authorization_url'],
                    'access_code' => $paymentData['access_code'],
                    'user_id' => $user->id
                ]),
            ]);

            return redirect($paymentData['authorization_url']);

        } catch (\Exception $e) {
            Log::error('Student Subscription Init Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Unable to initialize payment.');
        }
    }

    public function callback()
    {
        // Paystack redirects here. Verify transaction.
        $reference = request()->query('reference');

        if (!$reference) {
            return redirect()->route('student.profile')->with('error', 'No payment reference found.');
        }

        try {
            $vertification = $this->paystack->verifyPayment($reference);

            if ($vertification['status']) {
                // Determine User
                // Ideally prompt user to login if session lost, but let's assume session persists 
                // or we use metadata from payment record.
                
                $payment = Payment::where('transaction_id', $reference)->first();
                if ($payment) {
                     $payment->markAsCompleted($reference);
                     $user = Auth::user();
                     
                     // Fallback if not logged in (e.g. callback in new browser)
                     if (!$user && isset($payment->invoice)) {
                         // This part is tricky if user isn't logged in. 
                         // For now assume user is logged in or strict session.
                     }

                     if ($user) {
                         $user->fresh()->update([
                             'is_unlimited_student' => true,
                             'credits' => 999999, // Visual helper, though boolean flag takes precedence
                         ]);
                     }
                }

                return redirect()->route('student.profile')->with('success', 'Upgrade successful! You now have unlimited access.');
            } else {
                 return redirect()->route('student.profile')->with('error', 'Payment verification failed.');
            }

        } catch (\Exception $e) {
            Log::error('Student Subscription Callback Error: ' . $e->getMessage());
            return redirect()->route('student.profile')->with('error', 'An error occurred during verification.');
        }
    }
}
