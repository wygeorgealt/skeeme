# Admin Onboarding - Pro/Enterprise Payment Flow Testing Guide

## Quick Test Scenarios

### Test 1: Free Plan (Instant Completion)

**Steps:**
1. Complete Steps 1-2 of onboarding normally
2. On Step 3, click **Free Plan** card
3. ✅ Should complete instantly without modal
4. ✅ Should redirect to /dashboard
5. ✅ School should exist in database
6. ✅ Subscription status should be 'active'
7. ✅ Subscription.expires_at should be NULL

**Database Check:**
```sql
SELECT * FROM schools WHERE admin_id = <admin_id>;
SELECT * FROM subscriptions WHERE school_id = <school_id>;
-- Should show: status='active', expires_at=NULL, plan_name='free'
```

---

### Test 2: Pro Plan - Complete Payment Flow

**Steps:**
1. Complete Steps 1-2
2. On Step 3, click **Pro Plan** card
3. ✅ Billing period modal opens
4. ✅ Modal shows 3 options (Monthly/Bi-annual/Annual)
5. ✅ Prices shown with currency (auto-detected)
6. ✅ Monthly selected by default
7. ✅ Select **Annual** option
8. ✅ Green discount badge shows
9. ✅ Click "Proceed to Payment"
10. ✅ Button shows "⟳ Processing..."
11. ✅ Redirected to Paystack payment gateway
12. ✅ Enter test card: 4111 1111 1111 1111
13. ✅ Enter any future expiry date
14. ✅ Enter any 3-digit CVV
15. ✅ Submit payment
16. ✅ Paystack confirms payment
17. ✅ Redirected back to /dashboard
18. ✅ Success notification appears

**Database Check:**
```sql
SELECT * FROM schools WHERE admin_id = <admin_id>;
SELECT * FROM subscriptions WHERE school_id = <school_id>;
-- Should show: status='active', plan_name='pro', expires_at=<365 days from now>

SELECT * FROM invoices WHERE subscription_id = <subscription_id>;
-- Should show: status='paid', reference=<paystack_ref>, amount=<annual_price>
```

**Session Check:**
```php
// Check session data (should be cleared after payment):
dd(session()->all());
// paystack_reference, upgrade_plan, billing_period should be gone
```

---

### Test 3: Pro Plan - Cancel From Modal

**Steps:**
1. Complete Steps 1-2
2. On Step 3, click **Pro Plan** card
3. ✅ Billing period modal opens
4. ✅ Click **Cancel** button
5. ✅ Modal closes
6. ✅ User still on Step 3 (not dashboard)
7. ✅ Can select different plan now
8. ✅ School created during modal is DELETED
9. ✅ User school_id is reverted to NULL

**Database Check:**
```sql
SELECT * FROM schools;
-- Pro plan school should NOT exist

SELECT COUNT(*) FROM subscriptions 
WHERE plan_name='pro' AND status='pending_payment';
-- Should be 0 (pending_payment subscriptions deleted)

SELECT * FROM users WHERE id = <admin_id>;
-- school_id should be NULL, role should be NULL
```

---

### Test 4: Pro Plan - Close Via Backdrop

**Steps:**
1. Complete Steps 1-2
2. On Step 3, click **Pro Plan** card
3. ✅ Billing period modal opens
4. ✅ Click outside modal (on dark backdrop)
5. ✅ Modal closes
6. ✅ Same as Test 3 results

---

### Test 5: Enterprise Plan - Same As Pro

**Steps:**
1. Complete Steps 1-2
2. On Step 3, click **Enterprise Plan** card
3. ✅ Same flow as Pro plan
4. ✅ Billing options show
5. ✅ Proceed to Paystack
6. ✅ Complete payment
7. ✅ Subscription with plan_name='enterprise'

---

### Test 6: Currency Detection

**Steps:**
1. Complete Steps 1-2 with timezone: **Africa/Lagos**
2. On Step 3, click **Pro Plan**
3. ✅ Modal shows prices in NGN (₦)
4. ✅ Example: ₦25,000, ₦135,000, ₦225,000

**Then:**
1. Go back (browser back) to Step 2
2. Change timezone to **Europe/London**
3. Click Next to Step 3
4. Click **Pro Plan**
5. ✅ Modal now shows prices in GBP (£)
6. ✅ Different amounts: £50, £270, £510

**Timezone Currency Mapping:**
- Africa/Lagos → NGN
- Europe/London → GBP
- America/New_York → USD
- Asia/Dubai → AED
- Europe/Paris → EUR
- (etc)

---

### Test 7: Billing Period Calculations

**For Pro Plan ($50/month base):**

| Period | Months | Display | Calculation | Discount |
|--------|--------|---------|-------------|----------|
| Monthly | 1 | $50.00 | 1 × $50 | None |
| Bi-annual | 6 | $270.00 | 6 × $45 | $30 (10%) |
| Annual | 12 | $510.00 | 12 × $42.50 | $90 (15%) |

**Test:**
1. Click each billing period
2. ✅ Verify monthly_price per period
3. ✅ Verify total calculation
4. ✅ Verify discount calculation

---

### Test 8: Form Validation

**On Step 3:**
1. ✅ Can select Free plan (no validation error)
2. ✅ Can select Pro plan (no validation error)
3. ✅ Can select Enterprise plan (no validation error)

**On Billing Modal:**
1. Open billing modal
2. ✅ Billing period pre-selected to 'monthly'
3. ✅ "Proceed to Payment" button enabled
4. ✅ Can change selection
5. ✅ Button remains enabled with any selection

---

### Test 9: Error Scenarios

#### Payment Declined
1. Proceed to Paystack
2. Use test card: 4000000000000002 (decline)
3. ✅ Paystack shows error
4. ✅ Subscription remains 'pending_payment'
5. ✅ User can retry payment

#### Network Error
1. Proceed to Paystack
2. Disconnect internet midway through payment
3. ✅ Network error shown
4. ✅ Subscription remains 'pending_payment'
5. ✅ Can retry payment

#### Session Expired
1. Proceed to Paystack
2. Wait 2+ hours (session timeout)
3. Try to submit payment
4. ✅ Should handle gracefully (either show error or require restart)

---

### Test 10: Step Navigation

**After opening billing modal:**
1. ✅ Cannot click "Previous" (modal overlays step buttons)
2. ✅ Cannot click "Next" (modal overlays step buttons)
3. ✅ Can only Cancel or Proceed to Payment
4. ✅ Or close via backdrop/close button

---

### Test 11: Multiple Attempts

**Scenario: User cancels, retries with different plan**

1. Step 3: Click Pro plan
2. Modal opens
3. Click Cancel
4. ✅ Modal closes
5. Click Enterprise plan
6. ✅ New modal opens (Enterprise)
7. ✅ New school created in database
8. ✅ Previous pro school deleted
9. Click Cancel
10. ✅ Enterprise school also deleted
11. Click Free plan
12. ✅ Completes immediately
13. ✅ School created with free subscription

---

### Test 12: UI/UX Details

#### Plan Cards
- [ ] Free card appears first
- [ ] Pro card in middle with trial badge
- [ ] Enterprise card at bottom with trial badge
- [ ] Cards are full-width and clickable
- [ ] Selected plan has purple border
- [ ] Unselected plans have gray border
- [ ] Hover effect works (border color change)
- [ ] Text "Choose billing period →" appears on Pro/Enterprise

#### Billing Modal
- [ ] Modal centered on screen
- [ ] Dark backdrop behind modal
- [ ] Modal title clear: "Choose Your Billing Period"
- [ ] Description text present
- [ ] Close button (×) in top-right
- [ ] Can click backdrop to close
- [ ] Modal doesn't resize based on content
- [ ] Scrollable if content too tall
- [ ] Cancel and Proceed buttons in footer

#### Billing Period Cards
- [ ] All 3 periods show
- [ ] Monthly price breakdown shown
- [ ] Total price shown prominently
- [ ] Green discount badges for Bi-annual/Annual
- [ ] Period names show emoji (📅)
- [ ] Correct currency symbol (₦, £, $, etc)
- [ ] Selected period highlighted in purple
- [ ] Hover effect on unselected periods

#### Button States
- [ ] "Proceed to Payment" initially enabled
- [ ] Button disabled while processing
- [ ] Spinner shows: "⟳ Processing..."
- [ ] Cancel button always enabled (except during payment)
- [ ] After redirect, button state doesn't matter

---

### Test 13: Performance

**Modal Open Time:**
- [ ] Modal opens in < 500ms
- [ ] Billing options calculated quickly
- [ ] No lag when selecting periods

**Payment Initiation:**
- [ ] "Processing..." appears immediately
- [ ] Redirect happens within 2-3 seconds
- [ ] No duplicate requests (button disabled)

---

### Test 14: Responsive Design

**Desktop (1920px):**
- [ ] Plan cards full width
- [ ] Modal centered, readable
- [ ] All text visible
- [ ] Buttons properly sized

**Tablet (768px):**
- [ ] Plan cards responsive
- [ ] Modal width appropriate
- [ ] Scroll works if needed

**Mobile (375px):**
- [ ] Plan cards stack properly
- [ ] Modal fits screen
- [ ] Buttons clickable (not too small)
- [ ] No horizontal scroll

---

### Test 15: Session & Browser

**Multiple Tabs:**
1. Open admin onboarding in Tab 1
2. Open admin onboarding in Tab 2 (different admin)
3. ✅ Both can proceed independently
4. ✅ No data mixing between tabs

**Back Button After Payment:**
1. Complete payment
2. On dashboard, click browser back
3. ✅ Should NOT go back to billing modal
4. ✅ Should go to previous page or home

**Refresh During Payment:**
1. On Paystack payment page
2. Press F5 (refresh)
3. ✅ Should stay on Paystack (external page)
4. ✅ After payment, redirect works normally

---

## Test Data Reference

### Test Paystack Cards
```
Valid Card (will pass):
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits

Decline Card (will decline):
Card: 4000000000000002
(Same expiry/CVV)

Visa Card:
Card: 4242424242424242

Mastercard:
Card: 5555555555554444
```

### Test Timezones & Currencies
```
Africa/Lagos → NGN (Nigerian Naira)
Europe/London → GBP (British Pound)
America/New_York → USD (US Dollar)
Asia/Dubai → AED (UAE Dirham)
Europe/Paris → EUR (Euro)
America/Chicago → USD
America/Los_Angeles → USD
America/Toronto → CAD (Canadian Dollar)
```

### Test Admin Emails
```
test-admin-1@school.com
test-admin-2@school.com
dev-admin@localhost
```

---

## Logging & Debugging

### Check Payment Logs
```bash
# Watch Paystack integration logs
tail -f storage/logs/laravel.log | grep -i paystack

# Check payment request logs
grep -i "Initiating payment" storage/logs/laravel.log
```

### Check Database Directly
```bash
# Check pending subscriptions
sqlite3 database/database.sqlite
> SELECT id, school_id, plan_name, status FROM subscriptions;

# Check school creation
> SELECT id, admin_id, name, created_at FROM schools;

# Check user updates
> SELECT id, email, role, school_id FROM users;
```

### Browser Developer Tools
```javascript
// Check session storage
window.sessionStorage.getItem('paystack_reference')
window.sessionStorage.getItem('upgrade_plan')

// Check localStorage
window.localStorage

// Network tab: Monitor XHR requests
// Should see POST to /payments/initiate/{subscription}
// Response should include: status, authorization_url, reference

// Console tab: Watch for errors
// Look for: payment errors, validation errors, network errors
```

---

## Success Criteria Checklist

- [ ] Free plan completes instantly
- [ ] Pro/Enterprise opens billing modal
- [ ] Modal shows 3 billing periods
- [ ] Currency auto-detected from timezone
- [ ] Prices calculated correctly
- [ ] Discounts shown for longer periods
- [ ] Payment initiated successfully
- [ ] Redirected to Paystack
- [ ] After payment, subscription active
- [ ] Dashboard accessible after payment
- [ ] Cancel flow deletes temp school
- [ ] User can retry after cancel
- [ ] Session data cleaned up after payment
- [ ] Database consistent (no orphaned records)
- [ ] Error handling works for failed payments
- [ ] Responsive on mobile/tablet
- [ ] No duplicate records created
- [ ] Payment reference properly stored
- [ ] Invoice created after payment

---

**All tests passing?** ✅ DEPLOYMENT READY

