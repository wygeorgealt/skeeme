# Paystack Integration & Auto-Renewal Implementation Guide

## ✅ What Has Been Implemented

### 1. **PaystackService** (`app/Services/PaystackService.php`)
Complete service for Paystack API integration with the following methods:

#### Payment Initialization & Verification
- `initializePayment(Invoice, email, metadata)` - Start payment process
- `verifyPayment(reference)` - Verify payment completion
- `createPaymentFromResponse(paystackData, invoice)` - Create payment record from Paystack response

#### Charge Authorization (for recurring/auto-renewal)
- `authorizeCharge(authCode, email, amount, reference)` - Charge using saved card
- `processAutoRenewal(subscription)` - Complete auto-renewal flow

#### Utility Methods
- `generateReference()` - Generate unique transaction reference
- `verifyWebhookSignature(signature, body)` - Verify webhook authenticity
- `getCustomer(customerCode)` - Fetch customer details
- `createSubscriptionPlan(name, amount, interval)` - Create recurring plan
- `mapPaystackStatus(status)` - Map Paystack status to internal status

### 2. **PaymentController** (`app/Http/Controllers/PaymentController.php`)
Handles payment flows and webhooks:

#### Main Endpoints
- `POST /payments/initiate/{subscription}` - Initiate payment for plan upgrade
- `POST /payments/verify` - Verify payment after Paystack redirect
- `POST /webhooks/paystack` - Webhook receiver for async events

#### Webhook Handlers
- `handleChargeSuccess(data)` - Mark payment as completed
- `handleChargeFailed(data)` - Mark payment as failed
- `handleSubscriptionCreate(data)` - Handle subscription creation
- `handleSubscriptionDisable(data)` - Handle subscription cancellation

### 3. **SubscriptionRenewalJob** (`app/Jobs/SubscriptionRenewalJob.php`)
Scheduled background job for auto-renewal:

- Runs **daily at 02:00 AM** (configurable in `routes/console.php`)
- Finds subscriptions expiring within 3 days with `auto_renew=true`
- Processes auto-renewal using saved card authorization
- Handles failed renewals gracefully (logs, retries, deactivates if overdue)
- Retry logic: 3 attempts with 1-hour intervals

### 4. **Database Structure**

#### Invoices Table
```
- id, school_id, subscription_id
- invoice_number (unique: INV-YYYYMMDD-XXXXX)
- plan_name, amount, currency
- invoice_date, due_date, paid_date
- status: draft|sent|paid|overdue|cancelled
- description, notes, file_path (for PDF storage)
```

#### Payments Table
```
- id, school_id, subscription_id, invoice_id
- transaction_id (Paystack reference)
- payment_method (paystack|bank_transfer|credit_card|manual)
- amount, currency
- status: pending|completed|failed|refunded
- paid_at, failure_reason
- metadata (JSON - stores authorization details)
- authorization_code, customer_code, last_4, card_type (new Paystack fields)
```

### 5. **Model Relationships**

```php
// Subscription relationships
$subscription->invoices()   // HasMany: invoices for this subscription
$subscription->payments()   // HasMany: payments for this subscription

// Invoice relationships
$invoice->subscription      // BelongsTo: the subscription
$invoice->payments()        // HasMany: payments for this invoice
$invoice->school()          // BelongsTo: the school

// Payment relationships
$payment->subscription      // BelongsTo: the subscription
$payment->invoice          // BelongsTo: the invoice
$payment->school()         // BelongsTo: the school
```

### 6. **Configuration Files Updated**

#### `.env` (Already has Paystack keys)
```
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx or pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx or sk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx (optional)
```

#### `config/services.php`
Added Paystack configuration:
```php
'paystack' => [
    'public_key' => env('PAYSTACK_PUBLIC_KEY'),
    'secret_key' => env('PAYSTACK_SECRET_KEY'),
    'base_url' => 'https://api.paystack.co',
    'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET'),
],
```

#### `config/subscriptions.php`
Updated prices to USD (from config):
- Free: $0.00
- Pro: $59.99
- Enterprise: $199.99

#### `routes/console.php`
Added scheduled job:
```php
Schedule::job(new SubscriptionRenewalJob)
    ->dailyAt('02:00')
    ->description('Process auto-renewal for subscriptions');
```

---

## 🚀 Usage Examples

### 1. Initiate Payment for Plan Upgrade

```php
// In your Livewire component or controller
POST /payments/initiate/{subscriptionId}

// Body:
{
    "plan_name": "Enterprise"
}

// Response:
{
    "status": true,
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "PS-1732802400-1234"
}
```

**Frontend Flow:**
```js
// Redirect user to authorization_url
window.location.href = response.authorization_url;

// After payment, user is redirected to your app
// Verify payment when they return
fetch('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ reference: 'PS-1732802400-1234' })
})
.then(r => r.json())
.then(data => {
    if (data.status) {
        // Payment successful - update subscription
        window.location.href = '/settings/subscription-billing';
    }
});
```

### 2. Auto-Renewal Process

The job runs automatically daily at 2 AM. To test manually:

```bash
php artisan queue:work  # In production
php artisan SubscriptionRenewalJob  # Manual test (if available)
```

**What happens:**
1. Job finds subscriptions with `auto_renew=true` and expiry within 3 days
2. Gets last successful payment to extract authorization code
3. Creates new invoice for renewal
4. Charges customer using saved card (no redirect needed)
5. If successful: Updates subscription expiry date, sends confirmation
6. If failed: Logs error, retries in 1 hour (up to 3 times)
7. If overdue: Marks subscription as inactive, sends failure notification

### 3. Webhook Handling

Paystack sends events to `POST /webhooks/paystack`:

```php
// Example webhook event (Paystack sends this)
{
    "event": "charge.success",
    "data": {
        "reference": "PS-1732802400-1234",
        "status": "success",
        "amount": 5999,
        "currency": "NGN",
        "paid_at": "2025-11-28T12:00:00Z",
        "customer": {
            "customer_code": "CUS_xxxx"
        },
        "authorization": {
            "authorization_code": "AUTH_xxxx",
            "last_4": "1234",
            "card_type": "visa"
        }
    }
}
```

The webhook handler automatically:
- Verifies the signature
- Updates payment status
- Marks invoice as paid
- Handles retries and failures

---

## 🔧 Integration Checklist

### Phase 1: Initial Setup (✅ DONE)
- [x] PaystackService created with all API methods
- [x] PaymentController with payment and webhook endpoints
- [x] SubscriptionRenewalJob for auto-renewal
- [x] Scheduled in routes/console.php
- [x] Database migrations run
- [x] Config/services.php updated
- [x] Payment and Invoice models with relationships

### Phase 2: Frontend Integration (TODO)
- [ ] Create payment button in subscription page
- [ ] Add Paystack JS library to view
- [ ] Implement payment verification callback
- [ ] Show payment status UI (processing, success, failed)
- [ ] Add invoice download button
- [ ] Display payment history table

### Phase 3: Production Readiness (TODO)
- [ ] Update Paystack webhook URL in dashboard
- [ ] Add email notifications for payment events
- [ ] Create payment receipt/invoice PDF generator
- [ ] Implement payment retry UI (manual retry option)
- [ ] Add payment method management (save/delete cards)
- [ ] Implement refund system
- [ ] Add admin payment dashboard

---

## 📊 Data Flow Diagrams

### Payment Flow
```
User clicks "Upgrade Plan"
       ↓
PaymentController::initiatePlanUpgrade()
       ↓
Create Invoice
       ↓
PaystackService::initializePayment()
       ↓
Paystack API returns authorization_url
       ↓
Redirect to Paystack checkout
       ↓
User enters card details (on Paystack)
       ↓
Paystack processes payment
       ↓
Redirect back to app (if manual) or webhook (automatic)
       ↓
PaymentController::verifyPayment() or webhook handler
       ↓
Mark Payment as completed
       ↓
Mark Invoice as paid
       ↓
Update Subscription (if upgrade)
```

### Auto-Renewal Flow
```
Daily at 02:00 AM
       ↓
SubscriptionRenewalJob runs
       ↓
Find subscriptions: auto_renew=true, expiry within 3 days
       ↓
For each subscription:
  - Get last successful payment
  - Extract authorization_code from metadata
  - Create new invoice
  - PaystackService::authorizeCharge()
       ↓
If success:
  - Payment marked as completed
  - Invoice marked as paid
  - Subscription expiry_date updated
  - Send confirmation email
       ↓
If failed:
  - Payment marked as failed
  - Retry scheduled (up to 3 times)
  - If past due: deactivate subscription
  - Send failure notification
```

---

## 🔐 Security Notes

1. **Webhook Verification**: All webhooks must verify the signature using `PAYSTACK_SECRET_KEY`
2. **API Keys**: Use environment variables, never hardcode
3. **Authorization Codes**: Stored encrypted in metadata JSON
4. **Amount Validation**: Always validate amount matches invoice before charging
5. **Customer Email**: Verified before payment processing
6. **SSL Verification**: Disabled in PaystackService for test, enable in production

---

## 🐛 Troubleshooting

### Issue: "cURL error 60: SSL certificate problem"
**Solution**: This is normal in test environments. The `withoutVerifying()` method handles it.

### Issue: Webhook not receiving events
**Solution**: 
1. Configure webhook URL in Paystack dashboard: `https://yourdomain.com/webhooks/paystack`
2. Verify signature verification is working
3. Check logs: `storage/logs/laravel.log`

### Issue: Auto-renewal not running
**Solution**:
1. Ensure queue worker is running: `php artisan queue:work`
2. Check that subscription has `auto_renew=true`
3. Verify expiry date is within 3 days: `whereBetween('expiry_date', [now(), now()->addDays(3)])`

### Issue: Payment verification fails
**Solution**:
1. Verify the reference exists in Paystack
2. Check that Invoice and Payment records are created
3. Ensure Paystack API keys are correct
4. Check rate limiting (Paystack has API limits)

---

## 📝 Testing

### Test Payment Integration
```bash
php test_paystack_integration.php
```

Outputs:
- ✅ Subscription and invoice creation
- ✅ Payment record creation
- ✅ Model relationships
- ✅ Payment status methods
- ✅ Invoice calculations
- ✅ Query scopes and filters

### Test Auto-Renewal Manually
```php
use App\Services\PaystackService;
use App\Models\Subscription;

$subscription = Subscription::find(2);
$paystack = app(PaystackService::class);
$payment = $paystack->processAutoRenewal($subscription);
```

---

## 📞 Next Steps

1. **Frontend Implementation**: Add payment buttons and verification in admin subscription page
2. **Email Notifications**: Create mailable classes for payment events
3. **Invoice PDF**: Implement PDF generation using mPDF or TCPDF
4. **Admin Dashboard**: Show payment analytics and history
5. **Customer Portal**: Allow customers to manage payment methods
6. **Refund System**: Handle refunds and prorations

---

## 📚 References

- **Paystack API Docs**: https://paystack.com/docs/api/
- **Paystack Webhooks**: https://paystack.com/docs/webhooks/
- **Laravel Jobs**: https://laravel.com/docs/12.x/queues
- **Laravel Scheduling**: https://laravel.com/docs/12.x/scheduling
