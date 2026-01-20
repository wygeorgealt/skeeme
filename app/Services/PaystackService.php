<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected ?string $baseUrl;
    protected ?string $secretKey;
    protected ?string $publicKey;

    public function __construct()
    {
        $this->baseUrl = config('services.paystack.base_url');
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
    }

    /**
     * Initialize payment for a subscription
     */
    public function initializePayment(
        Invoice $invoice,
        string $email,
        string $metadata = null
    ): array {
        try {
            // Convert amount to the smallest unit (kobo for most currencies)
            // Paystack expects amount in smallest unit without decimals
            // The amount in invoice is already in the correct currency
            // For most currencies: multiply by 100 to get smallest unit (kobo/cents)
            $amountInSmallestUnit = intval(round($invoice->amount * 100));
            
            if ($amountInSmallestUnit <= 0) {
                throw new \Exception('Invalid amount: must be greater than zero');
            }

            // Paystack uses currency code, but for Nigerian accounts, use NGN
            // For other currencies, you may need to adjust based on your Paystack account
            $currency = strtoupper($invoice->currency);

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying() // Disable SSL verification for test environments
            ->post(($this->baseUrl ?? 'https://api.paystack.co') . "/transaction/initialize", [
                'email' => $email,
                'amount' => $amountInSmallestUnit,
                'currency' => $currency,
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'school_id' => $invoice->school_id,
                    'subscription_id' => $invoice->subscription_id,
                    'plan_name' => $invoice->plan_name,
                    'invoice_number' => $invoice->invoice_number,
                    'custom_metadata' => $metadata,
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Paystack initialization failed', [
                    'invoice_id' => $invoice->id,
                    'amount' => $amountInSmallestUnit,
                    'currency' => $currency,
                    'response' => $response->json(),
                ]);
                throw new \Exception('Failed to initialize payment: ' . $response->body());
            }

            $data = $response->json();

            if (!$data['status']) {
                throw new \Exception($data['message'] ?? 'Payment initialization failed');
            }

            // Store authorization URL in payment record if exists
            if (isset($data['data']['authorization_url'])) {
                // Will be stored when payment record is created
            }

            return [
                'status' => true,
                'authorization_url' => $data['data']['authorization_url'] ?? null,
                'access_code' => $data['data']['access_code'] ?? null,
                'reference' => $data['data']['reference'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Paystack service error', [
                'message' => $e->getMessage(),
                'invoice_id' => $invoice->id,
            ]);
            throw $e;
        }
    }

    /**
     * Verify payment using reference
     */
    public function verifyPayment(string $reference): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
            ])->withoutVerifying()
            ->get(($this->baseUrl ?? 'https://api.paystack.co') . "/transaction/verify/{$reference}");

            if (!$response->successful()) {
                Log::error('Paystack verification failed', [
                    'reference' => $reference,
                    'response' => $response->json(),
                ]);
                throw new \Exception('Failed to verify payment');
            }

            $data = $response->json();

            return [
                'status' => $data['status'] ?? false,
                'message' => $data['message'] ?? null,
                'data' => $data['data'] ?? [],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack verification error', [
                'message' => $e->getMessage(),
                'reference' => $reference,
            ]);
            throw $e;
        }
    }

    /**
     * Create payment record from Paystack response
     */
    public function createPaymentFromResponse(
        array $paystackData,
        Invoice $invoice
    ): Payment {
        $payment = Payment::create([
            'school_id' => $invoice->school_id,
            'subscription_id' => $invoice->subscription_id,
            'invoice_id' => $invoice->id,
            'transaction_id' => $paystackData['reference'] ?? null,
            'payment_method' => 'paystack',
            'amount' => $invoice->amount,
            'currency' => $paystackData['currency'] ?? $invoice->currency,
            'status' => $this->mapPaystackStatus($paystackData['status'] ?? 'pending'),
            'metadata' => json_encode([
                'authorization_code' => $paystackData['authorization']['authorization_code'] ?? null,
                'bin' => $paystackData['authorization']['bin'] ?? null,
                'last_four' => $paystackData['authorization']['last_4'] ?? null,
                'customer_code' => $paystackData['customer']['customer_code'] ?? null,
            ]),
            'paid_at' => $paystackData['paid_at'] ? \Carbon\Carbon::parse($paystackData['paid_at']) : null,
        ]);

        return $payment;
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
     * Authorize a charge using customer authorization code
     */
    public function authorizeCharge(
        string $authorizationCode,
        string $email,
        int $amount,
        string $reference = null
    ): array {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying()
            ->post(($this->baseUrl ?? 'https://api.paystack.co') . "/transaction/charge_authorization", [
                'authorization_code' => $authorizationCode,
                'email' => $email,
                'amount' => $amount, // In kobo
                'reference' => $reference ?? $this->generateReference(),
            ]);

            if (!$response->successful()) {
                Log::error('Paystack charge authorization failed', [
                    'response' => $response->json(),
                ]);
                throw new \Exception('Failed to charge: ' . ($response->json()['message'] ?? 'Unknown error'));
            }

            $data = $response->json();

            if (!$data['status']) {
                throw new \Exception($data['message'] ?? 'Authorization charge failed');
            }

            return [
                'status' => true,
                'data' => $data['data'] ?? [],
                'reference' => $data['data']['reference'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Paystack authorization charge error', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get customer by code
     */
    public function getCustomer(string $customerCode): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
            ])->withoutVerifying()
            ->get(($this->baseUrl ?? 'https://api.paystack.co') . "/customer/{$customerCode}");

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch customer');
            }

            return $response->json()['data'] ?? [];
        } catch (\Exception $e) {
            Log::error('Paystack get customer error', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $signature, string $body): bool
    {
        $hash = hash_hmac('sha512', $body, $this->secretKey);
        return $hash === $signature;
    }

    /**
     * Generate unique reference for payment
     */
    public function generateReference(): string
    {
        return 'PS-' . time() . '-' . mt_rand(1000, 9999);
    }

    /**
     * Create a subscription plan on Paystack (optional - for recurring billing)
     */
    public function createSubscriptionPlan(
        string $planName,
        int $amountInKobo,
        string $interval = 'monthly',
        string $description = null
    ): array {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->secretKey}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying()
            ->post(($this->baseUrl ?? 'https://api.paystack.co') . "/plan", [
                'name' => $planName,
                'description' => $description,
                'amount' => $amountInKobo,
                'interval' => $interval,
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to create plan');
            }

            $data = $response->json();

            if (!$data['status']) {
                throw new \Exception($data['message'] ?? 'Plan creation failed');
            }

            return [
                'status' => true,
                'plan_code' => $data['data']['plan_code'] ?? null,
                'data' => $data['data'] ?? [],
            ];
        } catch (\Exception $e) {
            Log::error('Paystack create plan error', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Process auto-renewal for a subscription
     */
    public function processAutoRenewal(Subscription $subscription): ?Payment
    {
        try {
            // Get the last successful payment to get authorization code
            $lastPayment = $subscription->payments()
                ->where('status', Payment::STATUS_COMPLETED)
                ->latest()
                ->first();

            if (!$lastPayment) {
                Log::warning('No completed payment found for auto-renewal', [
                    'subscription_id' => $subscription->id,
                ]);
                return null;
            }

            $metadata = json_decode($lastPayment->metadata, true);
            $authorizationCode = $metadata['authorization_code'] ?? null;

            if (!$authorizationCode) {
                Log::warning('No authorization code found for auto-renewal', [
                    'payment_id' => $lastPayment->id,
                ]);
                return null;
            }

            // Create new invoice
            $invoice = Invoice::create([
                'school_id' => $subscription->school_id,
                'subscription_id' => $subscription->id,
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'plan_name' => $subscription->plan_name,
                'amount' => $subscription->price,
                'currency' => 'USD',
                'invoice_date' => now(),
                'due_date' => now()->addDays(3),
                'status' => 'draft',
                'description' => 'Auto-renewal for ' . $subscription->plan_name,
            ]);

            // Charge using authorization code
            $chargeResponse = $this->authorizeCharge(
                $authorizationCode,
                $subscription->school->email ?? 'noemail@example.com',
                intval($subscription->price * 100),
                $this->generateReference()
            );

            if ($chargeResponse['status']) {
                $paystackData = $chargeResponse['data'];
                $payment = $this->createPaymentFromResponse($paystackData, $invoice);

                if ($payment->isCompleted()) {
                    // Update subscription expiry
                    $subscription->update([
                        'expiry_date' => now()->addDays(30),
                        'start_date' => now(),
                        'is_active' => true,
                    ]);

                    Log::info('Auto-renewal successful', [
                        'subscription_id' => $subscription->id,
                        'payment_id' => $payment->id,
                    ]);

                    return $payment;
                }
            }

            $payment = $this->createPaymentFromResponse(
                ['status' => 'failed', 'reference' => $chargeResponse['reference'] ?? null],
                $invoice
            );
            $payment->markAsFailed('Auto-renewal charge failed');

            return null;
        } catch (\Exception $e) {
            Log::error('Auto-renewal error', [
                'subscription_id' => $subscription->id,
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Detect currency from timezone
     */
    public function detectCurrencyFromTimezone(?string $timezone): string
    {
        $timezoneToRegion = [
            'Africa/Lagos' => 'NGN',
            'Africa/Accra' => 'GHS',
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
            'UTC' => 'NGN', // Fallback for Nigerian test environments where UTC is reported
        ];

        return $timezoneToRegion[$timezone] ?? 'USD';
    }
}
