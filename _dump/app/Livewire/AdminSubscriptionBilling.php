<?php

namespace App\Livewire;

use App\Models\Subscription;
use Livewire\Component;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Traits\HasToastNotifications;

class AdminSubscriptionBilling extends Component
{
    use HasToastNotifications;

    public ?Subscription $subscription = null;
    public ?string $schoolName = null;
    public int $usedLicenses = 0;
    public ?int $availableLicenses = null;
    public int $daysRemaining = 0;
    public bool $isExpired = false;
    public bool $autoRenew = false;
    public string $currency = 'USD';
    public ?string $upgradePlan = null;
    public bool $showPaymentInitiating = false;
    public array $recentInvoices = [];
    public bool $showBillingPeriodModal = false;
    public bool $showEnterpriseModal = false;
    public ?string $selectedBillingPeriod = null;
    public array $billingOptions = [];

    /**
     * Mount the component and load subscription data.
     */
    public function mount(): void
    {
        $user = Auth::user();
        
        // Verify user is admin
        if (!$user->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $school = $user->school;
        
        if (!$school) {
            abort(404, 'School not found');
        }

        $this->schoolName = $school->name;
        $this->subscription = $school->activeSubscription;
        
        // Detect currency based on school timezone
        $this->currency = $this->detectCurrencyFromTimezone($school->timezone ?? 'UTC');

        if ($this->subscription) {
            $this->loadSubscriptionData($school);
        }
    }

    /**
     * Load subscription data from the database.
     */
    private function loadSubscriptionData($school): void
    {
        // Check for Grace Period Expiry (2 Days)
        if ($this->subscription && $this->subscription->isExpired() && !$this->subscription->isFree()) {
             $gracePeriodEnd = $this->subscription->expiry_date->copy()->addDays(2);
             
             if ($gracePeriodEnd->isPast()) {
                 if ($this->performDowngrade()) {
                     $school->refresh(); // Refresh school to get new active subscription
                     $this->subscription = $school->activeSubscription;
                     $this->toastWarning('Subscription expired > 2 days ago. Downgraded to Basic Plan.', 'Plan Changed');
                 }
             }
        }

        $this->usedLicenses = $school->students()->count();
        $this->availableLicenses = $this->subscription->student_limit;
        $this->daysRemaining = $this->subscription->daysRemaining();
        $this->isExpired = $this->subscription->isExpired();
        $this->autoRenew = $this->subscription->auto_renew ?? false;
        
        // Load recent invoices
        $this->recentInvoices = $this->subscription->invoices()
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'date' => $invoice->invoice_date->format('M d, Y'),
                'description' => $invoice->description,
                'amount' => $invoice->amount,
                'currency' => $invoice->currency,
                'status' => $invoice->status,
                'paid_date' => $invoice->paid_date?->format('M d, Y'),
            ])
            ->toArray();
    }

    /**
     * Detect currency from timezone.
     */
    private function detectCurrencyFromTimezone(string $timezone): string
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

    /**
     * Toggle auto-renewal setting.
     */
    public function toggleAutoRenew(): void
    {
        if (!$this->subscription) {
            return;
        }

        $this->subscription->update([
            'auto_renew' => !$this->autoRenew,
        ]);

        $this->autoRenew = !$this->autoRenew;
        $this->dispatch('auto-renew-updated');
        $this->toastSuccess('Auto-renewal setting updated!', 'Success');
    }

    /**
     * Get subscription status color.
     */
    public function getStatusColorProperty(): string
    {
        if (!$this->subscription) {
            return 'red';
        }

        if ($this->isExpired) {
            return 'red';
        }

        if ($this->daysRemaining <= 7) {
            return 'orange';
        }

        return 'green';
    }

    /**
     * Get license usage percentage.
     */
    public function getLicenseUsagePercentageProperty(): float
    {
        if (!$this->availableLicenses) {
            return 0; // Unlimited
        }

        return ($this->usedLicenses / $this->availableLicenses) * 100;
    }

    /**
     * Get license status message.
     */
    public function getLicenseStatusProperty(): string
    {
        if (!$this->availableLicenses) {
            return "Unlimited student licenses";
        }

        return "{$this->usedLicenses} of {$this->availableLicenses} licenses used";
    }

    /**
     * Get subscription status message.
     */
    public function getSubscriptionStatusProperty(): string
    {
        if (!$this->subscription) {
            return 'No active subscription';
        }

        if ($this->subscription->isFree()) {
            return '';
        }

        if ($this->isExpired) {
            return 'Subscription expired';
        }

        if ($this->daysRemaining === 0) {
            return 'Expires today';
        }

        if ($this->daysRemaining === 1) {
            return 'Expires tomorrow';
        }

        return "Expires in {$this->daysRemaining} days";
    }

    /**
     * Show billing period selection modal.
     */
    public function showBillingPeriods(string $planName): void
    {
        if (!$this->subscription) {
            $this->toastError('No active subscription found', 'Error');
            return;
        }

        if (!in_array($planName, ['Pro', 'Enterprise'])) {
            $this->toastError('Invalid plan', 'Error');
            return;
        }

        $this->upgradePlan = $planName;
        $this->billingOptions = $this->subscription->getBillingOptions($planName, $this->currency);
        $this->showBillingPeriodModal = true;
        $this->selectedBillingPeriod = 'monthly'; // Default to monthly
    }

    /**
     * Initiate payment for plan upgrade with selected billing period.
     */
    public function initiatePlanUpgrade(): void
    {
        if (!$this->subscription || !$this->upgradePlan || !$this->selectedBillingPeriod) {
            $this->toastError('Missing required information', 'Error');
            return;
        }

        $this->showPaymentInitiating = true;

        try {
            // Use the PaymentController directly
            $controller = app(\App\Http\Controllers\PaymentController::class);
            
            // Create a request object
            $request = \Illuminate\Http\Request::create(
                route('payments.initiate', $this->subscription->id),
                'POST',
                [
                    'plan_name' => $this->upgradePlan,
                    'billing_period' => $this->selectedBillingPeriod,
                ]
            );
            $request->setUserResolver(fn () => auth()->user());
            
            Log::info('Initiating payment', [
                'plan' => $this->upgradePlan,
                'billing_period' => $this->selectedBillingPeriod,
                'subscription_id' => $this->subscription->id
            ]);
            
            $response = $controller->initiatePlanUpgrade($request, $this->subscription);
            
            if ($response instanceof \Illuminate\Http\JsonResponse) {
                $data = $response->getData(true);
                Log::info('Payment response data', $data);
                
                if ($data['status'] && isset($data['authorization_url'])) {
                    // Store reference in session for later verification
                    session(['paystack_reference' => $data['reference']]);
                    session(['upgrade_plan' => $this->upgradePlan]);
                    session(['billing_period' => $this->selectedBillingPeriod]);
                    
                    Log::info('Redirecting to Paystack', ['url' => $data['authorization_url']]);
                    
                    // Close modal and dispatch redirect event to browser
                    $this->showBillingPeriodModal = false;
                    $this->dispatch('redirect-to-paystack', url: $data['authorization_url']);
                } else {
                    Log::error('Invalid payment response', $data);
                    $this->toastError($data['message'] ?? 'Failed to initialize payment', 'Error');
                    $this->showPaymentInitiating = false;
                }
            }
        } catch (\Exception $e) {
            Log::error('Payment initiation error', [
                'plan' => $this->upgradePlan,
                'billing_period' => $this->selectedBillingPeriod,
                'subscription_id' => $this->subscription->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $this->toastError('Error: ' . $e->getMessage(), 'Error');
            $this->showPaymentInitiating = false;
        }
    }

    /**
     * Close billing period modal.
     */
    public function closeBillingPeriodModal(): void
    {
        $this->showBillingPeriodModal = false;
        $this->upgradePlan = null;
        $this->selectedBillingPeriod = null;
        $this->billingOptions = [];
        $this->showPaymentInitiating = false;
    }

    /**
     * Execute the downgrade to basic plan.
     */
    public function downgradeToBasic()
    {
        if ($this->performDowngrade()) {
            $this->toastSuccess('Successfully downgraded to Basic Plan', 'Success');
            return $this->redirect(request()->header('Referer'), navigate: true);
        }
    }

    /**
     * Internal method to perform downgrade logic
     */
    protected function performDowngrade(): bool
    {
        if (!$this->subscription || !$this->subscription->isPro()) {
            // If called manually, we show error. If auto-called, we just return false.
            // checking context might be needed if we want silent fail for auto.
            return false;
        }

        try {
            // Use SubscriptionService to handle downgrade
            $subscriptionService = app(\App\Services\SubscriptionService::class);
            $subscriptionService->changePlan(
                auth()->user()->school,
                Subscription::PLAN_FREE
            );
            return true;
        } catch (\Exception $e) {
            $this->toastError('Failed to downgrade plan: ' . $e->getMessage(), 'Error');
            Log::error('Downgrade error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Contact Enterprise support (Show Modal).
     */
    public function contactForEnterprise(): void
    {
        $this->showEnterpriseModal = true;
    }

    /**
     * Close Enterprise modal.
     */
    public function closeEnterpriseModal(): void
    {
        $this->showEnterpriseModal = false;
    }

    /**
     * Renew the current subscription.
     */
    /**
     * Renew the subscription (opens billing modal).
     */
    public function renewSubscription(): void
    {
        if (!$this->subscription) {
            $this->toastError('No active subscription to renew', 'Error');
            return;
        }

        // Open billing periods modal for current plan
        $this->showBillingPeriods($this->subscription->plan_name);
    }

    /**
     * Verify payment after Paystack redirect.
     */
    public function verifyPayment(): void
    {
        $reference = session('paystack_reference');
        $upgradePlan = session('upgrade_plan');

        if (!$reference) {
            return;
        }

        try {
            $response = Http::post(route('payments.verify'), [
                'reference' => $reference,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status']) {
                    $this->toastSuccess('Payment successful! Your subscription has been updated.', 'Success');
                    session()->forget(['paystack_reference', 'upgrade_plan']);
                    $this->mount();
                } else {
                    $this->toastError($data['message'] ?? 'Payment verification failed', 'Error');
                }
            } else {
                $this->toastError('Payment verification failed', 'Error');
            }
        } catch (\Exception $e) {
            $this->toastError('Error verifying payment: ' . $e->getMessage(), 'Error');
        }
    }

    /**
     * Redirect to billing portal.
     */
    public function redirectToBillingPortal(): void
    {
        $this->dispatch('open-billing-portal');
    }

    /**
     * Render the component.
     */
    public function render()
    {
        return view('livewire.settings.admin-subscription-billing');
    }
}
