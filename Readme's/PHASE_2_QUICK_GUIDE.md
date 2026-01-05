# Phase 2 Quick Implementation Guide

## 🎯 Overview
Phase 2 adds three major features:
1. **Email Campaigns** - Send bulk emails to admins
2. **Toast Notifications** - Real-time alerts to admin dashboards  
3. **Subscription Promotions** - Discount codes with tracking

**Status:** ✅ Backend 100% complete, Routes 100% complete, Views 0% (next task)

---

## 🚀 What's Already Done

### ✅ Database
- [x] 4 migrations created and successfully applied
- [x] All tables created: `email_campaigns`, `toast_notifications`, `subscription_promotions`, `promotion_usages`

### ✅ Backend Models (4 models)
- [x] `EmailCampaign` - Send emails to recipient groups
- [x] `ToastNotification` - Admin dashboard alerts
- [x] `SubscriptionPromotion` - Discount code management
- [x] `PromotionUsage` - Track discount applications

### ✅ Controllers (30+ methods)
- [x] `CommunicationController` - 8 new methods (emails + toasts + existing announcements)
- [x] `PromotionController` - 11 methods (CRUD + validation + stats)

### ✅ Routes (25+ routes)
- [x] Email campaign routes: index, create, store, show, send
- [x] Toast notification routes: index, create, store, publish, delete
- [x] Promotion routes: CRUD + pause/resume + validate API + stats dashboard
- [x] Validation API endpoint at `/promotions/validate` (no auth required)

### ✅ Logging
- [x] All operations logged to `AdminAuditLog`

---

## 📋 What's Left To Do (View Templates & Jobs)

### Priority 1: View Templates

#### Email Campaigns Views
1. **index** - List all campaigns
   - Show: code, status, created_at, recipient count, sent count
   - Actions: View, Send (if draft), Delete
   - Filters: Status (draft/scheduled/sent/failed), Search

2. **create** - New campaign form
   - Fields: Subject, Body (rich editor), Recipient Type (dropdown), Recipients (conditional)
   - Actions: Save as Draft, Schedule for Later (with datepicker)

3. **show** - View campaign details
   - Display: Full subject, body, recipient list, sent count/failed count
   - Actions: Send (if draft), Delete

#### Toast Notifications Views
1. **index** - List all notifications
   - Show: Title, Type (badge), Recipient, Published date, View count
   - Filters: Type, Recipient Type, Published/Unpublished

2. **create** - New toast form
   - Fields: Title, Message, Type (dropdown), Duration, Dismissible (checkbox), Recipients
   - Actions: Create & Save, Create & Publish Immediately

#### Promotions Views
1. **index** - List promotions with analytics
   - Show: Code, Name, Discount (formatted), Status, Max Uses, Used Count, Valid Until
   - Filters: Status (active/paused), Search (code/name)
   - Stats bar: Active Promos, Total Uses, Total Discounted Amount

2. **create** - New promotion form
   - Fields: Code, Name, Discount Type (%, $), Value, Max Uses, Per-School Limit
   - Advanced: First month only, Renewal only, Specific Plans, Valid dates
   - Actions: Create

3. **edit** - Edit promotion
   - Same fields as create
   - Action: Update

4. **show** - Promotion details + usage history
   - Display: Full promo details, active status
   - Usage history table: School, Discount, Original Price, Final Price, Date
   - Actions: Pause/Resume, Edit, Delete

5. **stats** - Analytics dashboard
   - Charts: Discount trend (30 days), Top promotions by usage
   - Stats cards: Total promotions, Active promos, Total discounts given, Average discount %
   - Table: Recently used promotions

---

## 🔧 Next Tasks (In Order)

### Task 1: Create Email Campaign Views
**Files to create:**
- `resources/views/team/communications/emails/index.blade.php`
- `resources/views/team/communications/emails/create.blade.php`
- `resources/views/team/communications/emails/show.blade.php`

**Estimated effort:** 2-3 hours
**Dependencies:** None (can start immediately)

### Task 2: Create Toast Notification Views
**Files to create:**
- `resources/views/team/communications/toasts/index.blade.php`
- `resources/views/team/communications/toasts/create.blade.php`

**Estimated effort:** 1-2 hours
**Dependencies:** Task 1 (can reuse email template components)

### Task 3: Create Promotion Views
**Files to create:**
- `resources/views/team/promotions/index.blade.php`
- `resources/views/team/promotions/create.blade.php`
- `resources/views/team/promotions/edit.blade.php`
- `resources/views/team/promotions/show.blade.php`
- `resources/views/team/promotions/stats.blade.php`

**Estimated effort:** 3-4 hours
**Dependencies:** Tasks 1 & 2 (reuse styles)

### Task 4: Create Queue Job for Email Sending
**File to create:**
- `app/Jobs/SendEmailCampaignJob.php`

**Logic:**
```php
// Get all campaigns with status = 'scheduled' and scheduled_at <= now()
// Set status to 'sending'
// Get recipients using getRecipients()
// Loop through and send each email
// Update sent_count, failed_count
// Set status to 'sent' or 'failed'
```

**Estimated effort:** 1 hour
**Priority:** Medium (emails will work without queue, just synchronously)

### Task 5: Integrate Promotions into Subscription Checkout
**Files to modify:**
- `resources/views/subscriptions/checkout.blade.php` (or similar)

**Logic:**
```javascript
// Add promo code input field
// On blur/change: call POST /promotions/validate
// Display discount and final amount
// Include promotion_id in subscription creation
```

**Estimated effort:** 1-2 hours
**Priority:** High (needed for feature to be useful)

---

## 📚 Code Examples

### Using EmailCampaign Model
```php
// Create a draft email
$campaign = EmailCampaign::create([
    'team_id' => auth()->user()->current_team_id,
    'user_id' => auth()->id(),
    'subject' => 'New Features Available',
    'body' => '<h1>Announcement</h1><p>Check out our latest features...</p>',
    'recipient_type' => 'all_admins', // or 'specific_schools', 'specific_admin', 'all_users'
    'status' => 'draft',
]);

// Send immediately
$campaign->send();

// Or schedule for later
$campaign->update([
    'status' => 'scheduled',
    'scheduled_at' => now()->addDays(1),
]);
```

### Using ToastNotification Model
```php
// Create and publish a toast
$toast = ToastNotification::create([
    'team_id' => auth()->user()->current_team_id,
    'user_id' => auth()->id(),
    'title' => 'Success!',
    'message' => 'New payment processing is live!',
    'type' => 'success', // info, success, warning, error
    'recipient_type' => 'specific_schools',
    'recipient_users' => [1, 2, 3], // admin user IDs
    'duration_seconds' => 5,
    'is_dismissible' => true,
]);

// Publish and broadcast
$toast->publish();
// Toast appears on admin dashboards immediately
```

### Using SubscriptionPromotion Model
```php
// Create a promotion
$promo = SubscriptionPromotion::create([
    'team_id' => $team->id,
    'code' => 'SUMMER50',
    'name' => 'Summer 50% Off',
    'discount_type' => 'percentage', // or 'fixed_amount'
    'discount_value' => 50,
    'max_uses' => 100,
    'max_per_school' => 5,
    'min_subscription_amount' => 0,
    'applies_to_all_plans' => true,
    'applies_to_first_month' => true,
    'applies_to_renewal' => false,
    'valid_from' => now(),
    'valid_until' => now()->addMonths(3),
    'status' => 'active',
    'duration_months' => 1,
]);

// Validate and calculate discount
if ($promo->canBeUsed($schoolId)) {
    $discount = $promo->calculateDiscount(100); // Returns 50 for 50%
    $final = 100 - $discount; // 50
}

// Track usage
PromotionUsage::create([
    'promotion_id' => $promo->id,
    'school_id' => $school->id,
    'subscription_id' => $subscription->id,
    'discount_amount' => $discount,
    'original_price' => 100,
    'final_price' => $final,
]);
```

### Validation API Endpoint (for JavaScript)
```javascript
// Frontend code
const response = await fetch('/promotions/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
    body: JSON.stringify({
        code: 'SUMMER50',
        amount: 100 // subscription amount
    })
});

const data = await response.json();
// Returns:
// {
//   valid: true,
//   discount: 50,
//   discount_formatted: "50%",
//   final_amount: 50,
//   message: "Promotion applied successfully"
// }
```

---

## 🧪 Testing Checklist

### Email Campaigns
- [ ] Create draft email
- [ ] Send email immediately
- [ ] Schedule email for future
- [ ] Send to all_admins
- [ ] Send to specific_schools
- [ ] Send to specific_admin
- [ ] View campaign details
- [ ] List campaigns with filtering
- [ ] Delete draft email

### Toast Notifications
- [ ] Create toast notification
- [ ] Publish notification
- [ ] Appears on admin dashboard in real-time
- [ ] Broadcast to specific schools
- [ ] Broadcast to specific admin
- [ ] Broadcast to all_admins
- [ ] Dismiss notification
- [ ] Auto-dismiss after duration

### Promotions
- [ ] Create percentage discount code
- [ ] Create fixed amount discount code
- [ ] Apply promotion code in checkout
- [ ] Calculate correct discount amount
- [ ] Enforce max_uses limit
- [ ] Enforce max_per_school limit
- [ ] Check valid_from and valid_until dates
- [ ] Pause and resume promotion
- [ ] Delete promotion
- [ ] View promotion statistics
- [ ] Track usage in PromotionUsage table

---

## 📞 Quick Reference

### Routes
```
GET  /work/communications/emails              - List campaigns
GET  /work/communications/emails/create       - New campaign form
POST /work/communications/emails              - Create campaign
GET  /work/communications/emails/{campaign}   - View campaign
POST /work/communications/emails/{campaign}/send - Send campaign

GET  /work/communications/toasts              - List toasts
GET  /work/communications/toasts/create       - New toast form
POST /work/communications/toasts              - Create toast
POST /work/communications/toasts/{toast}/publish - Publish toast
DELETE /work/communications/toasts/{toast}    - Delete toast

GET  /work/promotions                         - List promotions
GET  /work/promotions/stats                   - Statistics dashboard
GET  /work/promotions/create                  - New promotion form
POST /work/promotions                         - Create promotion
GET  /work/promotions/{promotion}             - View promotion
GET  /work/promotions/{promotion}/edit        - Edit form
PUT  /work/promotions/{promotion}             - Update promotion
POST /work/promotions/{promotion}/pause       - Pause promotion
POST /work/promotions/{promotion}/resume      - Resume promotion
DELETE /work/promotions/{promotion}           - Delete promotion
POST /promotions/validate                     - Validate code (public API)
```

### Key Models & Methods
```
EmailCampaign::send()
EmailCampaign::getRecipients()
EmailCampaign::isDraft(), ::isScheduled(), ::isSent()
EmailCampaign::sendScheduled() // for queue job

ToastNotification::publish()
ToastNotification::isActive()
ToastNotification::incrementViewCount()
ToastNotification::getActiveForSchool($schoolId)
ToastNotification::getActiveForAdmin($userId)

SubscriptionPromotion::calculateDiscount($price)
SubscriptionPromotion::canBeUsed($schoolId)
SubscriptionPromotion::isExpired()
SubscriptionPromotion::getFormattedDiscount()
SubscriptionPromotion::findByCode($code)
SubscriptionPromotion::getActivePromotions()
SubscriptionPromotion::pause(), ::resume()
```

---

## 🎨 UI Components to Reuse

From existing codebase:
- Form builder components (text inputs, selects, date pickers)
- Table components (with pagination, sorting, filtering)
- Card/badge components (for status indicators)
- Modal components (for confirmations)
- Toast components (already integrated with Livewire)
- Permission check components (for showing/hiding actions)

---

## ⚡ Performance Tips

1. **Email Campaigns:** Use queue jobs for sending to avoid timeout
2. **Toast Notifications:** Broadcast only to necessary users using recipient filtering
3. **Promotions:** Cache active promotions list (cleared on create/update)
4. **Pagination:** Use pagination on all index views (promotions can have many usages)

---

## 🔐 Permission Checks

Don't forget to add these permissions if not already present:

```php
// In team member roles setup
'communications' => [
    'send' => 'Send emails and create notifications',
    'publish' => 'Publish announcements and toast notifications',
    'email' => 'Send email campaigns',
    'delete' => 'Delete announcements and notifications',
],
'subscriptions' => [
    'manage' => 'Create and manage subscription promotions',
],
```

All routes already have these middleware checks in place.

---

## 💡 Development Tips

1. Use existing component library for consistency
2. Follow existing naming conventions (camelCase for JS, snake_case for routes)
3. Test with actual data (create promotions and try to use them)
4. Check AdminAuditLog table to verify all operations are logged
5. Use Laravel Tinker for quick testing: `php artisan tinker`

---

**Next Action:** Start with Task 1 (Email Campaign Views)
**Estimated Total Time to Complete:** 8-10 hours
**Difficulty:** Medium (standard CRUD views + some custom logic)

