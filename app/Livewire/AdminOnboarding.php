<?php

namespace App\Livewire;

use App\Models\User;
use App\Models\School;
use App\Models\Subscription;
use Livewire\Component;
use Livewire\Attributes\Layout;
use Livewire\WithFileUploads;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

#[Layout('layouts.blank')]
class AdminOnboarding extends Component
{
    use \Livewire\WithFileUploads;

    public $step = 1;
    public $schoolName = '';
    public $firstName = '';
    public $lastName = '';
    public $phoneNumber = '';
    public $countryCode = '+234';
    public $academicYear = '';
    public $timezone = 'Africa/Lagos';
    public $theme = 'light';
    public $address = '';
    public $logo = null;
    public $plan = 'free';
    public $school = null;
    public array $billingOptions = [];
    public ?string $selectedBillingPeriod = null;
    public bool $showBillingPeriodModal = false;
    public bool $showPaymentInitiating = false;
    public string $currency = 'USD';

    protected $rules = [
        'schoolName' => ['required', 'string', 'max:255'],
        'firstName' => ['required', 'string', 'max:100'],
        'lastName' => ['required', 'string', 'max:100'],
        'phoneNumber' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
        'countryCode' => ['required', 'string', 'max:5'],
        'academicYear' => ['required', 'string', 'max:20'],
        'timezone' => ['required', 'string'],
        'theme' => ['required', 'in:light,dark'],
        'address' => ['nullable', 'string', 'max:500'],
        'logo' => ['nullable', 'image', 'max:5120'],
        'plan' => ['required', 'in:free,pro,enterprise'],
    ];

    public function mount()
    {
        // Redirect if not authenticated or already has school
        if (!Auth::check() || Auth::user()->school_id) {
            return redirect()->route('dashboard');
        }

        // Check if user selected admin role
        $role = Session::get('registration_role');
        if ($role !== 'admin') {
            return redirect()->route('role-selection');
        }

        // Pre-fill from user record if available
        $user = Auth::user();
        $this->firstName = $user->first_name ?? $user->name;
        $this->lastName = $user->last_name ?? '';
        
        // If name was split or something, ensure first name isn't the full name
        if (empty($this->lastName) && str_contains($this->firstName, ' ')) {
            $parts = explode(' ', $this->firstName, 2);
            $this->firstName = $parts[0];
            $this->lastName = $parts[1] ?? '';
        }
    }

    public function nextStep()
    {
        Log::info('nextStep called', [
            'step' => $this->step,
            'schoolName' => $this->schoolName,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'academicYear' => $this->academicYear,
            'timezone' => $this->timezone,
            'theme' => $this->theme,
        ]);

        try {
            // Validate current step
            if ($this->step === 1) {
                $validated = $this->validate([
                    'schoolName' => $this->rules['schoolName'],
                    'firstName' => $this->rules['firstName'],
                    'lastName' => $this->rules['lastName'],
                ], [
                    'schoolName.required' => 'School name is required',
                    'firstName.required' => 'First name is required',
                    'lastName.required' => 'Last name is required',
                ]);
                Log::info('Step 1 validation passed', $validated);
            } elseif ($this->step === 2) {
                $validated = $this->validate([
                    'academicYear' => $this->rules['academicYear'],
                    'timezone' => $this->rules['timezone'],
                    'theme' => $this->rules['theme'],
                    'address' => $this->rules['address'],
                    'logo' => $this->rules['logo'],
                ], [
                    'academicYear.required' => 'Academic year is required',
                    'timezone.required' => 'Timezone is required',
                    'theme.required' => 'Theme preference is required',
                    'theme.in' => 'Theme must be either light or dark',
                ]);
                Log::info('Step 2 validation passed', $validated);
            }

            $this->step++;
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation error in nextStep', [
                'step' => $this->step,
                'errors' => $e->errors(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error in nextStep', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    public function previousStep()
    {
        if ($this->step > 1) {
            $this->step--;
        }
    }

    public function complete()
    {
        $this->validate([
            'plan' => $this->rules['plan'],
        ]);

        $user = Auth::user();

        // Handle logo upload
        $logoPath = null;
        if ($this->logo) {
            $logoPath = $this->logo->store('logos', 'public');
        }

        // Create school
        $school = School::create([
            'name' => $this->schoolName,
            'admin_id' => $user->id,
            'academic_year' => $this->academicYear,
            'timezone' => $this->timezone,
            'theme' => $this->theme,
            'phone' => $this->countryCode . $this->phoneNumber,
            'address' => $this->address,
            'logo_path' => $logoPath,
        ]);

        // Update user
        $user->update([
            'name' => "{$this->firstName} {$this->lastName}",
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'phone_number' => $this->countryCode . $this->phoneNumber,
            'school_id' => $school->id,
            'role' => 'admin',
        ]);

        // Create subscription based on plan (only for free)
        if ($this->plan === 'free') {
            Subscription::create([
                'school_id' => $school->id,
                'plan_name' => 'Free/Basic Plan',
                'student_limit' => 150,
                'price' => 0,
                'start_date' => now(),
                'expiry_date' => now()->addYears(100), // Lifetime free plan
                'is_active' => true,
                'auto_renew' => false,
            ]);
        }

        Session::forget('registration_role');

        return redirect()->route('dashboard')->with('success', 'Welcome to Skeeme! Your school has been set up.');
    }

    public function updated($propertyName)
    {
        if (in_array($propertyName, ['firstName', 'lastName', 'academicYear'])) {
            Log::debug("Property updated: {$propertyName}", [
                'value' => $this->$propertyName,
                'step' => $this->step
            ]);
        }
    }

    public function selectPlan($selectedPlan)
    {
        $this->plan = $selectedPlan;
        
        try {
            if ($selectedPlan === 'free') {
                $this->complete();
            } elseif ($selectedPlan === 'pro') {
                $this->showBillingPeriodSelection();
            }
        } catch (\Exception $e) {
            Log::error('Plan selection failed', ['plan' => $selectedPlan, 'error' => $e->getMessage()]);
            // Use a toast or session flash if available, or just dispatch an alert
            $this->js("alert('Something went wrong selecting the plan: " . addslashes($e->getMessage()) . "')");
        }
    }

    public function showBillingPeriodSelection()
    {
        if ($this->plan !== 'pro') {
            return;
        }

        $user = Auth::user();

        // Prevent duplicate school creation if user clicks back/forth
        if (!$this->school) {
            // Check if user already has a partial school linked (safety check)
            if ($user->school_id) {
                 $this->school = School::find($user->school_id);
            }
            
            if (!$this->school) {
                $logoPath = $this->logo ? $this->logo->store('logos', 'public') : null;

                $this->school = School::create([
                    'name' => $this->schoolName,
                    'admin_id' => $user->id,
                    'academic_year' => $this->academicYear,
                    'timezone' => $this->timezone,
                    'theme' => $this->theme,
                    'phone' => $this->countryCode . $this->phoneNumber,
                    'address' => $this->address,
                    'logo_path' => $logoPath,
                ]);

                $user->update([
                    'name' => "{$this->firstName} {$this->lastName}",
                    'first_name' => $this->firstName,
                    'last_name' => $this->lastName,
                    'phone_number' => $this->countryCode . $this->phoneNumber,
                    'school_id' => $this->school->id,
                    'role' => 'admin',
                ]);
            }
        }

        // Create temp subscription if not exists
        $subscription = $this->school->subscriptions()->where('plan_name', 'Pro')->first();
        if (!$subscription) {
            $subscription = Subscription::create([
                'school_id' => $this->school->id,
                'plan_name' => 'Pro',
                'student_limit' => null,
                'price' => 39.00,
                'start_date' => now(),
                'expiry_date' => now()->addDays(14),
                'is_active' => false,
                'auto_renew' => true,
            ]);
        }

        $this->currency = $this->detectCurrencyFromTimezone($this->timezone);

        $this->billingOptions = $subscription->getBillingOptions(
            ucfirst($this->plan),
            $this->currency
        );
        
        $this->selectedBillingPeriod = 'monthly';
        $this->showBillingPeriodModal = true;
    }

    public function closeBillingPeriodModal()
    {
        $this->showBillingPeriodModal = false;
        $this->selectedBillingPeriod = null;
        
        // Delete the school and user updates if user cancels
        if ($this->school) {
            $user = Auth::user();
            $user->update([
                'school_id' => null,
                'role' => null,
                'first_name' => null,
                'last_name' => null,
                'phone_number' => null,
            ]);
            $this->school->delete();
            $this->school = null;
        }
    }

    public function initiatePlanUpgrade()
    {
        if (!$this->school || !$this->plan || !$this->selectedBillingPeriod) {
            return;
        }

        $this->showPaymentInitiating = true;

        try {
            $subscription = $this->school->subscriptions()->first();
            
            if (!$subscription) {
                throw new \Exception('Subscription not found');
            }

            // Create payment request
            $controller = app(\App\Http\Controllers\PaymentController::class);
            
            $request = \Illuminate\Http\Request::create(
                route('payments.initiate', $subscription->id),
                'POST',
                [
                    'plan_name' => ucfirst($this->plan),
                    'billing_period' => $this->selectedBillingPeriod,
                ]
            );
            $request->setUserResolver(fn () => Auth::user());
            
            Log::info('Initiating payment during onboarding', [
                'plan' => $this->plan,
                'billing_period' => $this->selectedBillingPeriod,
                'subscription_id' => $subscription->id
            ]);
            
            $response = $controller->initiatePlanUpgrade($request, $subscription);
            
            if ($response instanceof \Illuminate\Http\JsonResponse) {
                $data = $response->getData(true);
                
                if ($data['status'] && isset($data['authorization_url'])) {
                    // Store reference and data in session
                    session([
                        'paystack_reference' => $data['reference'],
                        'upgrade_plan' => $this->plan,
                        'billing_period' => $this->selectedBillingPeriod,
                        'onboarding_school_id' => $this->school->id,
                    ]);
                    
                    Log::info('Redirecting to Paystack during onboarding', ['url' => $data['authorization_url']]);
                    
                    // Close modal and dispatch redirect
                    $this->showBillingPeriodModal = false;
                    $this->dispatch('redirect-to-paystack', url: $data['authorization_url']);
                } else {
                    Log::error('Invalid payment response during onboarding', $data);
                    $this->showPaymentInitiating = false;
                }
            }
        } catch (\Exception $e) {
            Log::error('Payment initiation error during onboarding', [
                'plan' => $this->plan,
                'billing_period' => $this->selectedBillingPeriod,
                'error' => $e->getMessage(),
            ]);
            $this->showPaymentInitiating = false;
        }
    }

    public function detectCurrencyFromTimezone(string $timezone): string
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

    public function getTimezoneOptions()
    {
        return [
            'Africa/Lagos' => 'West Africa (GMT+1)',
            'Africa/Cairo' => 'Egypt (GMT+2)',
            'Africa/Johannesburg' => 'South Africa (GMT+2)',
            'Europe/London' => 'London (GMT)',
            'Europe/Paris' => 'Paris (GMT+1)',
            'America/New_York' => 'New York (EST)',
            'America/Chicago' => 'Chicago (CST)',
            'Asia/Dubai' => 'Dubai (GST)',
            'Asia/Singapore' => 'Singapore (SGT)',
            'Australia/Sydney' => 'Sydney (AEDT)',
        ];
    }

    public function getCountryCodeOptions()
    {
        return [
            '+1' => 'US (+1)',
            '+44' => 'UK (+44)',
            '+234' => 'Nigeria (+234)',
            '+233' => 'Ghana (+233)',
            '+254' => 'Kenya (+254)',
            '+27' => 'South Africa (+27)',
            '+20' => 'Egypt (+20)',
            '+971' => 'UAE (+971)',
            '+65' => 'Singapore (+65)',
            '+61' => 'Australia (+61)',
        ];
    }

    public function render()
    {
        return view('livewire.admin-onboarding', [
            'timezones' => $this->getTimezoneOptions(),
            'countryCodes' => $this->getCountryCodeOptions(),
            'billingOptions' => $this->billingOptions,
            'selectedBillingPeriod' => $this->selectedBillingPeriod,
            'showBillingPeriodModal' => $this->showBillingPeriodModal,
            'showPaymentInitiating' => $this->showPaymentInitiating,
            'currency' => $this->currency,
        ]);
    }
}
