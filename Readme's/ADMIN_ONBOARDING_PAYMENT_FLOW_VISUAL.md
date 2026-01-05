# Admin Onboarding - Pro/Enterprise Payment Flow (Visual Guide)

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ADMIN ONBOARDING - COMPLETE FLOW                       │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: SCHOOL & PERSONAL INFO
┌──────────────────────────┐
│ 🏫 School Name           │
│ 👤 First Name            │
│ 👤 Last Name             │
│                          │
│ [Previous] [Next Step]   │
└──────────────────────────┘
        ↓

STEP 2: CONFIGURATION
┌──────────────────────────┐
│ 📆 Academic Year         │
│ 🌍 Timezone (10+ options)│
│ 🎨 Theme (Light/Dark)    │
│                          │
│ [Previous] [Next Step]   │
└──────────────────────────┘
        ↓

STEP 3: PLAN SELECTION
┌─────────────────────────────────────────┐
│  📊 FREE PLAN              [Click]     │
│  ✓ Basic features                      │
│  ✓ Up to 50 students                   │
│  ────────────────────────────────────── │
│                                     Free│
└─────────────────────────────────────────┘
        ↓
    [User clicks FREE]
        ↓
    complete()
        ↓
    ✅ School created
    ✅ Free subscription created
    ✅ User updated (role='admin')
        ↓
    🎯 REDIRECT TO DASHBOARD
        

┌─────────────────────────────────────────┐
│  💎 PRO PLAN           [Click]         │
│  ✓ Advanced analytics                  │
│  ✓ Unlimited students                  │
│  14-day trial badge                    │
│  ────────────────────────────────────── │
│                                  $50/mo │
│                    Choose billing → →  │
└─────────────────────────────────────────┘
        ↓
    [User clicks PRO]
        ↓
    showBillingPeriodSelection()
        ↓
    ✅ School created (temp)
    ✅ Subscription created (pending_payment)
    ✅ Currency detected from timezone
    ✅ Billing options fetched
        ↓


    ╔═══════════════════════════════════════════╗
    ║   💳 BILLING PERIOD MODAL OPENS          ║
    ╚═══════════════════════════════════════════╝
    
    Choose Your Billing Period
    ───────────────────────────────────────────
    
    ┌─────────────────────────────────────────┐
    │ 📅 Monthly Billing                      │
    │ 1 month @ $50.00/month                  │
    │ ═══════════════════════════════════════ │
    │                              $50.00    │ ← Selected
    └─────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────┐
    │ 📅 Bi-Annual (6 Months)                 │
    │ 6 months @ $45.00/month                 │
    │ ═══════════════════════════════════════ │
    │                              $270.00   │
    │                     💰 Save $30.00     │
    └─────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────┐
    │ 📅 Annual Billing (12 Months)           │
    │ 12 months @ $42.50/month                │
    │ ═══════════════════════════════════════ │
    │                              $510.00   │
    │                     💰 Save $90.00     │
    └─────────────────────────────────────────┘
    
    [Cancel]  [Proceed to Payment →]
        ↓
    
    USER CLICKS \"Proceed to Payment\"
        ↓
    initiatePlanUpgrade()
        ↓
    PaymentController.initiatePlanUpgrade()
        ↓
    Paystack API called
        ↓
    Authorization URL generated
        ↓
    Payment reference stored in session
        ↓
    🚀 REDIRECTED TO PAYSTACK PAYMENT GATEWAY
        ↓
    ┌────────────────────────────────────┐
    │     🔒 PAYSTACK SECURE PAYMENT     │
    │                                    │
    │  [Card Number]                     │
    │  [Expiry] [CVV]                    │
    │  [Cardholder Name]                 │
    │                                    │
    │  [Pay $270 NGN] [Cancel]           │
    └────────────────────────────────────┘
        ↓
    
    USER COMPLETES PAYMENT
        ↓
    Paystack callback to /webhooks/paystack
        ↓
    PaymentController.webhook() processes
        ↓
    Payment verified
        ↓
    ✅ Subscription status → 'active'
    ✅ Expires_at set (based on period)
    ✅ Billing period stored
        ↓
    🎯 REDIRECT TO DASHBOARD
        ↓
    ✅ School active
    ✅ Pro subscription active
    ✅ User is admin


    USER CANCELS (Via Cancel or Backdrop)
        ↓
    closeBillingPeriodModal()
        ↓
    ❌ School deleted
    ❌ Subscription deleted
    ❌ User changes reverted
        ↓
    Modal closes
        ↓
    User still on Step 3 (can select different plan)


┌─────────────────────────────────────────┐
│  🚀 ENTERPRISE PLAN        [Click]     │
│  ✓ Custom integrations                 │
│  ✓ Dedicated support                   │
│  14-day trial badge                    │
│  ────────────────────────────────────── │
│                                 Custom  │
│                    Choose billing → →  │
└─────────────────────────────────────────┘
        ↓
    [Same flow as PRO plan]
```

---

## Component State Diagram

```
┌──────────────────────────────────────────────────────────────┐
│           AdminOnboarding Component States                   │
└──────────────────────────────────────────────────────────────┘

Initial State:
┌─────────────────────────┐
│ step = 1                │
│ plan = 'free'           │
│ school = null           │
│ showBillingPeriodModal  │
│   = false               │
│ selectedBillingPeriod   │
│   = null                │
└─────────────────────────┘
        │
        │ Step 1 → Step 2 → Step 3
        ↓

On Step 3 (selectPlan('pro')):
┌─────────────────────────┐
│ step = 3                │
│ plan = 'pro'            │
│ school = School obj ✅  │
│ billingOptions = {...}  │
│ selectedBillingPeriod   │
│   = 'monthly'           │
│ showBillingPeriodModal  │
│   = true ✅             │
│ currency = 'NGN'        │
└─────────────────────────┘
        │
        ├─→ User clicks Cancel
        │        │
        │        ↓
        │   closeBillingPeriodModal()
        │        │
        │        ↓
        │   ┌─────────────────────────┐
        │   │ school = null (deleted) │
        │   │ modal = false           │
        │   │ selectedBillingPeriod   │
        │   │   = null (reset)        │
        │   └─────────────────────────┘
        │        │
        │        ↓
        │   User back on Step 3
        │
        └─→ User clicks "Proceed to Payment"
                 │
                 ↓
            initiatePlanUpgrade()
                 │
                 ↓
            showPaymentInitiating = true
                 │
                 ↓
            PaymentController called
                 │
                 ↓
            ┌──────────────────────────┐
            │ paystack_reference       │
            │ stored in session        │
            │ upgrade_plan = 'pro'     │
            │ billing_period = 'monthly│
            │ onboarding_school_id = 1 │
            └──────────────────────────┘
                 │
                 ↓
            redirect('paystack_url')
                 │
                 ↓
            🚀 PAYSTACK GATEWAY
```

---

## Modal Interaction Flow

```
┌──────────────────────────────────────────────────────┐
│      Billing Period Modal Interaction Map            │
└──────────────────────────────────────────────────────┘

Modal Opens
    │
    ├─→ [Close Button (×)]
    │   │
    │   ├─→ closeBillingPeriodModal()
    │   └─→ Modal closes
    │
    ├─→ [Backdrop Click]
    │   │
    │   ├─→ wire:click=\"closeBillingPeriodModal\"
    │   └─→ Modal closes
    │
    ├─→ [Cancel Button]
    │   │
    │   ├─→ closeBillingPeriodModal()
    │   └─→ Modal closes
    │
    └─→ [Select Billing Period]
        │
        ├─→ wire:click=\"\$set('selectedBillingPeriod', 'monthly')\"
        │   │
        │   └─→ ┌──────────────────────────┐
        │       │ selectedBillingPeriod    │
        │       │   = 'monthly'            │
        │       │ Button highlights Purple │
        │       └──────────────────────────┘
        │
        ├─→ wire:click=\"\$set('selectedBillingPeriod', 'biannual')\"
        │   │
        │   └─→ ┌──────────────────────────┐
        │       │ selectedBillingPeriod    │
        │       │   = 'biannual'           │
        │       │ Button highlights Purple │
        │       │ Discount shown in green  │
        │       └──────────────────────────┘
        │
        └─→ wire:click=\"\$set('selectedBillingPeriod', 'annual')\"
            │
            └─→ ┌──────────────────────────┐
                │ selectedBillingPeriod    │
                │   = 'annual'             │
                │ Button highlights Purple │
                │ Max discount shown       │
                └──────────────────────────┘

        [Proceed to Payment] Button
            │
            ├─→ Initially: Enabled & Clickable
            │
            ├─→ onClick: showPaymentInitiating = true
            │   │
            │   └─→ ⟳ Processing...
            │       └─→ Button Disabled
            │
            └─→ After redirect: User leaves page
```

---

## Database State Changes

```
┌─────────────────────────────────────────────────────┐
│     Database State During Payment Flow              │
└─────────────────────────────────────────────────────┘

BEFORE PAYMENT:
┌──────────────────┐
│ schools table:   │
│ id: 1            │
│ name: 'My School'│
│ admin_id: 5      │
└──────────────────┘

┌─────────────────────────────────┐
│ subscriptions table:             │
│ id: 1                            │
│ school_id: 1                     │
│ plan_name: 'pro'                 │
│ status: 'pending_payment'  ❌    │
│ expires_at: NULL                 │
│ billing_period: NULL             │
└─────────────────────────────────┘

┌──────────────────┐
│ users table:     │
│ id: 5            │
│ role: 'admin'    │
│ school_id: 1     │
│ status: 'active' │
└──────────────────┘


AFTER SUCCESSFUL PAYMENT:
┌──────────────────┐
│ schools table:   │
│ (unchanged)      │
│ id: 1            │
│ admin_id: 5      │
└──────────────────┘

┌─────────────────────────────────┐
│ subscriptions table:             │
│ id: 1                            │
│ school_id: 1                     │
│ plan_name: 'pro'                 │
│ status: 'active'          ✅     │
│ expires_at: 2025-12-31           │
│ billing_period: 'monthly'        │
│ trial_ends_at: 2025-12-15        │
└─────────────────────────────────┘

┌──────────────────┐
│ invoices table:  │
│ subscription_id:1│
│ amount: $50      │
│ status: 'paid'   │
│ reference: 'pst_│
│   reference123'  │
└──────────────────┘


IF USER CANCELS:
┌──────────────────┐
│ schools table:   │
│ (DELETED)  ❌    │
└──────────────────┘

┌─────────────────────────────────┐
│ subscriptions table:             │
│ (DELETED CASCADE)         ❌     │
└─────────────────────────────────┘

┌──────────────────┐
│ users table:     │
│ id: 5            │
│ role: NULL       │
│ school_id: NULL  │
│ (reverted)  ↺    │
└──────────────────┘
```

---

## Currency Detection

```
┌──────────────────────────────────────────────┐
│  Timezone → Currency Auto-Detection          │
└──────────────────────────────────────────────┘

Step 2: User selects Timezone

Africa/Lagos
    ↓ detectCurrencyFromTimezone()
    ↓ $currency = 'NGN'
    ↓ Step 3: Plan modal uses NGN
    ↓ Billings show: ₦50, ₦270, ₦510
    

Europe/London
    ↓ $currency = 'GBP'
    ↓ £50, £270, £510
    

America/New_York
    ↓ $currency = 'USD'
    ↓ $50, $270, $510
    

Asia/Dubai
    ↓ $currency = 'AED'
    ↓ د.إ50, د.إ270, د.إ510
```

---

## Error Handling Paths

```
┌──────────────────────────────────────────────┐
│       Error Recovery Paths                   │
└──────────────────────────────────────────────┘

Payment Page Error:
    User on Paystack payment page
        │
        ├─→ Card declined
        │   ├─→ Paystack shows error
        │   ├─→ User clicks "Try again"
        │   └─→ Modal still shows (session intact)
        │
        ├─→ User closes Paystack page
        │   ├─→ Subscription still pending_payment
        │   ├─→ User can click \"Proceed to Payment\" again
        │   └─→ New payment reference generated
        │
        └─→ Network error
            ├─→ Paystack timeout
            ├─→ User retries from modal
            └─→ Subscription remains pending


Invalid Billing Period:
    User somehow selects invalid period
        │
        ├─→ initiatePlanUpgrade() validates
        ├─→ Validation fails
        └─→ Error logged, no payment initiated


Subscription Not Found:
    After selecting plan, subscription can't be found
        │
        ├─→ Catch exception
        ├─→ Log error details
        ├─→ Show user error message
        └─→ User can retry or go back
```

---

## Timeline Diagram

```
┌────────────────────────────────────────────────────────────────┐
│              Complete Onboarding Timeline                      │
└────────────────────────────────────────────────────────────────┘

T0: Admin starts registration
    │
T0+5s: Step 1 ← → Step 2 → Step 3
    │
T0+15s: Step 3 - Admin selects Pro plan
    │
T0+16s: ✅ School created
        ✅ Subscription created (pending_payment)
        ✅ User updated
        ✅ Billing modal opens
    │
T0+20s: Admin selects billing period (annual)
    │
T0+22s: Admin clicks \"Proceed to Payment\"
    │
T0+23s: PaymentController initializes payment
    │
T0+24s: Paystack reference generated
        Session data stored
    │
T0+25s: 🚀 Redirected to Paystack
    │
T0+30s: Admin enters payment details
    │
T0+45s: Paystack processes payment
    │
T0+46s: ✅ Payment verified
        ✅ Subscription → 'active'
        ✅ expires_at set to (365 days from now)
    │
T0+47s: 🎯 Redirected to /dashboard
    │
COMPLETE! Admin now has Pro plan active


CANCELLATION SCENARIO:
T0+22s: Admin clicks \"Cancel\"
    │
T0+23s: ❌ School deleted
        ❌ Subscription deleted
        ❌ User changes reverted
    │
T0+24s: Modal closes
    │
T0+25s: Admin back on Step 3 (can retry or select Free)
```

---

**Implementation Status**: ✅ COMPLETE

All flows, states, and error handling have been implemented and are production-ready.

