# Admin Onboarding - Pro/Enterprise Plan Payment Integration

## Overview

The admin onboarding process has been enhanced to include a **billing period chooser and payment gateway integration** when users select Pro or Enterprise plans during the 3-step onboarding flow.

---

## Updated Flow: Pro/Enterprise Plans

### Step 3: Plan Selection (Updated)

When an admin reaches Step 3 and **clicks on a Pro or Enterprise plan card**, the following happens:

```
Admin clicks Pro/Enterprise plan card
        ↓
showBillingPeriodSelection() method called
        ↓
✅ School created in database
✅ User updated with school_id + role='admin'
✅ Temporary subscription created (status='pending_payment')
        ↓
Billing Period Modal opens
        ↓
Admin selects billing period (Monthly/Bi-annual/Annual)
        ↓
Admin clicks "Proceed to Payment"
        ↓
initiatePlanUpgrade() triggered
        ↓
PaymentController.initiatePlanUpgrade() called
        ↓
Payment reference generated
        ↓
Redirected to Paystack payment page
        ↓
After successful payment:
✅ Subscription activated
✅ Billing period set
✅ Redirected to /dashboard
```

---

## Billing Period Options

All plans show **three billing period options**:

### 📅 Monthly Billing
- **Duration**: 1 month
- **Price**: Full monthly rate
- **Example**: $50/month for Pro plan
- **No savings**: Billed every month

### 📅 Bi-Annual (6 Months)
- **Duration**: 6 months
- **Price**: Calculated discount (typically ~10% savings)
- **Example**: $270 for Pro plan (instead of $300)
- **Savings**: Shown in green ("💰 Save $X")

### 📅 Annual Billing (12 Months)
- **Duration**: 12 months
- **Price**: Best value (typically ~15-20% savings)
- **Example**: $510 for Pro plan (instead of $600)
- **Savings**: Shown in green ("💰 Save $X")

**All prices are automatically converted to the school's timezone currency:**
- Africa/Lagos → NGN
- Europe/London → GBP
- America/New_York → USD
- etc.

---

## Component: AdminOnboarding

### New Properties

```php
public $school = null;                              // Temporarily created school
public array $billingOptions = [];                  // Billing period options
public ?string $selectedBillingPeriod = null;      // Currently selected period
public bool $showBillingPeriodModal = false;       // Modal visibility
public bool $showPaymentInitiating = false;        // Payment processing state
public string $currency = 'USD';                    // Detected currency
```

### New Methods

#### `selectPlan($selectedPlan)`
**Called when:** Admin clicks a plan card in Step 3
**Action:**
- If plan is 'free': Goes directly to `complete()`
- If plan is 'pro'/'enterprise': Calls `showBillingPeriodSelection()`

```php
public function selectPlan($selectedPlan)
{
    $this->plan = $selectedPlan;
    
    if ($selectedPlan === 'free') {
        // For free plan, go directly to completion
        $this->complete();
    } else {
        // For pro/enterprise, show billing period modal
        $this->showBillingPeriodSelection();
    }
}
```

#### `showBillingPeriodSelection()`
**Called when:** User selects Pro or Enterprise plan
**Action:**
1. Creates School record
2. Updates User with school_id and role='admin'
3. Creates temporary Subscription (status='pending_payment')
4. Detects currency from timezone
5. Fetches billing options from Subscription model
6. Shows billing period modal

```php
public function showBillingPeriodSelection()
{
    // Create school
    $this->school = School::create([...]);
    
    // Update user
    $user->update([
        'school_id' => $this->school->id,
        'role' => 'admin',
    ]);
    
    // Create temporary subscription
    $subscription = Subscription::create([
        'school_id' => $this->school->id,
        'plan_name' => $this->plan,
        'status' => 'pending_payment',
    ]);
    
    // Get billing options
    $this->billingOptions = $subscription->getBillingOptions(
        ucfirst($this->plan),
        $this->currency
    );
    
    $this->showBillingPeriodModal = true;
}
```

#### `initiatePlanUpgrade()`
**Called when:** Admin clicks "Proceed to Payment"
**Action:**
1. Validates subscription exists
2. Calls PaymentController.initiatePlanUpgrade()
3. Stores reference in session
4. Dispatches 'redirect-to-paystack' event
5. Redirects user to Paystack payment gateway

```php
public function initiatePlanUpgrade()
{
    $subscription = $this->school->subscriptions()->first();
    
    $controller = app(\App\Http\Controllers\PaymentController::class);
    $response = $controller->initiatePlanUpgrade($request, $subscription);
    
    if ($data['status'] && isset($data['authorization_url'])) {
        session([
            'paystack_reference' => $data['reference'],
            'upgrade_plan' => $this->plan,
            'billing_period' => $this->selectedBillingPeriod,
            'onboarding_school_id' => $this->school->id,
        ]);
        
        $this->dispatch('redirect-to-paystack', url: $data['authorization_url']);
    }
}
```

#### `closeBillingPeriodModal()`
**Called when:** Admin clicks "Cancel" or backdrop
**Action:**
1. Hides modal
2. **Deletes the temporarily created school**
3. **Reverts user changes**

```php
public function closeBillingPeriodModal()
{
    // Clean up if user cancels
    if ($this->school) {
        $user = Auth::user();
        $user->update([
            'school_id' => null,
            'role' => null,
        ]);
        $this->school->delete();
        $this->school = null;
    }
    
    $this->showBillingPeriodModal = false;
}
```

#### `detectCurrencyFromTimezone($timezone)`
**Called when:** Billing period modal opens
**Purpose:** Detect the user's preferred currency based on their selected school timezone
**Returns:** Currency code (NGN, USD, GBP, EUR, etc.)

---

## View: admin-onboarding.blade.php (Updated)

### Step 3 - Plan Selection

**Plan cards are now buttons** (not radio inputs):
- **Each card is clickable** (entire card, not just the radio button)
- **On click**: Triggers `selectPlan($planName)`
- **Free plan**: Immediately completes onboarding
- **Pro/Enterprise**: Opens billing period modal

```blade
<button type="button" wire:click="selectPlan('pro')"
        class="w-full text-left p-4 border-2 rounded-lg transition">
    <div class="flex items-start justify-between">
        <div class="flex-1">
            <h3 class="font-bold">Pro Plan <span class="badge">14-day trial</span></h3>
            <!-- Features list -->
        </div>
        <div class="text-right">
            <span class="text-2xl font-bold">$50/mo</span>
            <p class="text-xs text-purple-600">Choose billing period →</p>
        </div>
    </div>
</button>
```

### Billing Period Modal

Appears after Pro/Enterprise plan selection:

**Design matches** the AdminSubscriptionBilling modal:
- Fixed position overlay with backdrop
- Semi-transparent dark background
- Centered modal card
- Sticky header with close button
- Scrollable content area
- Footer with Cancel/Proceed buttons

**Modal displays:**
1. **Header**: "Choose Your Billing Period"
2. **Description**: "Choose your billing period and save with longer commitments"
3. **Billing Period Cards** (3 options):
   - 📅 Monthly
   - 📅 Bi-Annual
   - 📅 Annual
4. **For each period:**
   - Period name and duration
   - Monthly rate breakdown
   - Total price (highlighted)
   - Savings amount (if applicable, in green)
5. **Footer buttons:**
   - Cancel (closes modal, reverts changes)
   - Proceed to Payment (initiates payment)

```blade
<button type="button" 
        wire:click="$set('selectedBillingPeriod', 'monthly')"
        class="w-full text-left p-4 border-2 rounded-lg {{ $selectedBillingPeriod === 'monthly' ? 'border-purple-600 bg-purple-50' : 'border-gray-200' }}">
    <div class="flex items-start justify-between">
        <div>
            <h4 class="font-semibold">📅 Monthly Billing</h4>
            <p class="text-sm text-gray-600">1 month @ $50.00/month</p>
        </div>
        <div class="text-right">
            <div class="text-2xl font-bold">$50.00</div>
        </div>
    </div>
</button>
```

### Payment Processing

When user clicks "Proceed to Payment":
1. Shows spinner: "⟳ Processing..."
2. Button disabled during processing
3. After Paystack redirect is initiated:
   - Modal closes
   - User redirected to Paystack payment page
   - Session stores payment reference

---

## Database Changes

### Subscription States During Flow

**Before payment:**
```sql
status = 'pending_payment'
-- School exists, Subscription exists, but not active
```

**After successful payment:**
```sql
status = 'active'
expires_at = based on billing period
-- Subscription activated with correct billing period
```

**If user cancels:**
```sql
-- School deleted (via closeBillingPeriodModal)
-- User school_id reset to NULL
-- Subscription deleted (cascade)
```

---

## Security & Validation

### Server-Side Validation
✅ Plan must be 'pro' or 'enterprise' (not free)
✅ Billing period must be valid (monthly/biannual/annual)
✅ Subscription must exist and belong to user's school
✅ PaymentController validates all data

### Client-Side Validation
✅ Can only proceed if billing period selected
✅ Cannot spam payment button (disabled during processing)
✅ Modal closes on backdrop click (safe cancel)

### Payment Security
✅ Uses existing PaymentController.initiatePlanUpgrade()
✅ Paystack reference stored in session (server-side)
✅ Payment verification via PaymentController.verifyPayment()
✅ No sensitive data in URL parameters

---

## User Experience Flow

### Scenario 1: User selects Free plan
```
Step 3: Free plan button clicked
  ↓
selectPlan('free') called
  ↓
complete() triggered immediately
  ↓
✅ School + Subscription created
✅ User updated
✅ Redirected to /dashboard
```

### Scenario 2: User selects Pro plan
```
Step 3: Pro plan button clicked
  ↓
selectPlan('pro') called
  ↓
showBillingPeriodSelection() executed
  ↓
✅ Temp School + Subscription created
✅ Modal opens
  ↓
User selects billing period
  ↓
User clicks "Proceed to Payment"
  ↓
initiatePlanUpgrade() called
  ↓
PaymentController initiates Paystack payment
  ↓
User redirected to Paystack (securely)
  ↓
After payment verification:
✅ Subscription activated
✅ Redirected to /dashboard
```

### Scenario 3: User cancels
```
Step 3: Pro plan button clicked
  ↓
Modal opens
  ↓
User clicks "Cancel" or backdrop
  ↓
closeBillingPeriodModal() called
  ↓
✅ School deleted
✅ Subscription deleted
✅ User changes reverted
✅ Modal closes
  ↓
User still on Step 3 (can select different plan)
```

---

## Testing Checklist

### Free Plan Path
- [ ] Click Free plan card
- [ ] No modal appears
- [ ] Redirected directly to /dashboard
- [ ] School created
- [ ] Free subscription created (expires_at = NULL)

### Pro Plan Path
- [ ] Click Pro plan card
- [ ] Billing period modal opens
- [ ] Modal shows 3 billing options (Monthly, Bi-annual, Annual)
- [ ] Currency converted based on timezone
- [ ] Savings amounts shown correctly
- [ ] Select each billing period
- [ ] Prices update correctly
- [ ] Click "Proceed to Payment"
- [ ] Redirected to Paystack
- [ ] After payment, subscription activated
- [ ] Redirected to /dashboard

### Enterprise Plan Path
- [ ] Same as Pro plan
- [ ] Verify currency conversion works
- [ ] Verify discount calculations correct

### Cancel Flow
- [ ] Click Pro plan card
- [ ] Modal opens
- [ ] Click "Cancel" button
- [ ] Modal closes
- [ ] School NOT in database (deleted)
- [ ] User can select different plan

### Error Handling
- [ ] Invalid billing period selected
- [ ] Payment fails at Paystack
- [ ] Network error during payment
- [ ] Session expires before payment

---

## API Endpoints Called

### During Payment Initiation
```
POST /payments/initiate/{subscription}
- Payload: plan_name, billing_period
- Response: {status, authorization_url, reference}
```

### After Payment (Handled by Paystack Callback)
```
POST /payments/verify
- Payload: reference
- Response: {status, message}
```

---

## Session Data Stored

```php
session([
    'paystack_reference' => 'some_reference_123',      // Payment ref
    'upgrade_plan' => 'pro',                           // Selected plan
    'billing_period' => 'monthly',                     // Billing period
    'onboarding_school_id' => 1,                       // School ID
]);
```

---

## Important Notes

1. **School created early**: School is created when user opens billing modal (not after payment)
   - Benefit: Shows user which school is being set up
   - Risk: If payment fails, school exists but subscription isn't active
   - Mitigation: User can retry or contact support

2. **Temporary Subscription**: Subscription starts as 'pending_payment' until payment verified
   - Prevents accidental activation
   - Clear state for support team

3. **Currency Auto-Detection**: Based on school timezone selected in Step 2
   - If timezone changes → Currency changes
   - Prevents manual currency selection (simpler UX)

4. **Billing Options**: Fetched from Subscription model's `getBillingOptions()` method
   - Calculates discounts automatically
   - Formats prices per currency

5. **Redirect Safety**: Uses Livewire's dispatch + JavaScript event listener
   - Prevents timing issues
   - Works even if component re-renders

---

## Future Enhancements

1. **Coupon/Discount Codes**: Add field to apply discount before payment
2. **Invoice Display**: Show itemized invoice before confirming payment
3. **Plan Comparison**: Side-by-side comparison of all plans
4. **Billing History**: Show past invoices after first successful payment
5. **Auto-renewal Preference**: Let users set auto-renewal during onboarding
6. **Contact Support Button**: In billing modal for enterprise questions

---

**Status**: ✅ IMPLEMENTATION COMPLETE

Plan selection cards now trigger billing period modals for Pro/Enterprise plans, matching the design pattern from AdminSubscriptionBilling page.

