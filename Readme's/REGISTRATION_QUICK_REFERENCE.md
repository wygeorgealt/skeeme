# Registration & Onboarding - Quick Reference Guide

## User Registration Flow (At a Glance)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. /register (Fortify)
   ↓ Enter: email, password
   ↓ Validate & create basic user (no role yet)
   ↓
2. /role-selection (RoleSelection component)
   ├─→ Select Admin → /onboarding/admin
   │    ├─ Step 1: School + Personal Info
   │    ├─ Step 2: Config (year, timezone, theme)
   │    ├─ Step 3: Plan (free/pro/enterprise)
   │    └─ Complete → School created, email sent → /dashboard
   │
   └─→ Select Lecturer → /onboarding/lecturer
        ├─ Step 1: Personal Info (phone optional)
        ├─ Step 2: School Search (live autocomplete)
        └─ Complete → Set pending, email NOT sent → /pending-approval
                      ↓
                   Admin reviews in LecturerManagement
                      ↓ Approve
                   User status='active', approval email sent
                      ↓ Auto-polling detects
                   Redirect to /dashboard
```

---

## File Locations Quick Reference

### Components
```
app/Livewire/
├── RoleSelection.php                    ← Role picker
├── AdminOnboarding.php                  ← 3-step admin setup
├── LecturerOnboarding.php               ← 2-step lecturer setup
└── LecturerPendingApproval.php          ← Auto-polling status page
```

### Views
```
resources/views/livewire/
├── role-selection.blade.php             ← Admin/Lecturer cards
├── admin-onboarding.blade.php           ← 3-step form + progress
├── lecturer-onboarding.blade.php        ← 2-step form + progress
└── lecturer-pending-approval.blade.php  ← Status page + polling
```

### Events & Listeners
```
app/Events/
├── UserRegistered.php                   ← Admin registration event
└── UserApproved.php                     ← Lecturer approval event

app/Listeners/
├── SendWelcomeAdminEmail.php            ← Admin welcome email
└── SendLecturerApprovalEmail.php        ← Approval email
```

### Configuration
```
routes/web.php                           ← All registration routes
app/Providers/FortifyServiceProvider.php ← Post-registration redirect
app/Providers/AppServiceProvider.php     ← Event listener registration
```

---

## Routes

```php
// Fortify handles /register, /login, /verify-email, etc.

// After successful Fortify registration:
GET /role-selection                      → RoleSelection component

// Admin flow:
GET /onboarding/admin                    → AdminOnboarding (middleware: auth, role:admin)

// Lecturer flow:
GET /onboarding/lecturer                 → LecturerOnboarding (middleware: auth, role:lecturer)
GET /pending-approval                    → LecturerPendingApproval (middleware: auth, role:lecturer)
```

---

## Key Component Methods

### RoleSelection
```php
selectAdmin()     // Sets role='admin', redirects to onboarding.admin
selectLecturer()  // Sets role='lecturer', redirects to onboarding.lecturer
```

### AdminOnboarding
```php
nextStep()        // Validates current step, increments to next
previousStep()    // Decrements step (shows previous)
complete()        // Creates School, Subscription, sets role, dispatches UserRegistered
```

### LecturerOnboarding
```php
nextStep()        // Validates personal info, moves to school search
previousStep()    // Goes back to personal info
updatedSchoolSearch($value)  // Live search filters schools (AJAX-like)
selectSchool($schoolId)      // Sets selectedSchoolId when user clicks result
complete()        // Sets school_id, status='pending', role='lecturer'
```

### LecturerPendingApproval
```php
checkApproval()   // Refreshes user, checks if status='active'
                  // If yes: redirects to /dashboard
                  // If no: increments pollCount
```

---

## Email Triggers

### Admin Registration
```
Event: UserRegistered (dispatched in AdminOnboarding.complete())
Listener: SendWelcomeAdminEmail
Email: WelcomeAdminEmail
When: After admin completes 3-step onboarding
To: admin@school.com
Content: Welcome message, school setup confirmation
```

### Lecturer Approval
```
Event: UserApproved (dispatched in LecturerManagement.confirmApprove())
Listener: SendLecturerApprovalEmail
Email: LecturerApprovalNotificationEmail
When: After admin approves pending lecturer
To: lecturer@school.com
Content: Approval confirmation, first login link, school info
```

---

## Database Operations

### After Admin Onboarding
```sql
-- User updated
UPDATE users SET 
  first_name='John', 
  last_name='Doe', 
  role='admin', 
  school_id=1
WHERE id=<user_id>;

-- School created
INSERT INTO schools (admin_id, name, academic_year, timezone, theme)
VALUES (<admin_id>, 'My School', '2024/2025', 'Africa/Lagos', 'light');

-- Subscription created
INSERT INTO subscriptions (school_id, plan_name, status, expires_at)
VALUES (1, 'free', 'active', NULL);  -- or 14-day trial for pro/enterprise
```

### After Lecturer Onboarding
```sql
-- User updated (status='pending')
UPDATE users SET 
  first_name='Jane',
  last_name='Smith',
  phone_number='+234800000000',
  role='lecturer',
  school_id=1,
  status='pending'
WHERE id=<user_id>;
```

### After Lecturer Approval
```sql
-- User updated (status='active')
UPDATE users SET 
  status='active',
  approved_by=<admin_id>,
  approved_at=NOW()
WHERE id=<lecturer_id>;
```

---

## Middleware Reference

```php
// Protected routes require:
['auth']              // User logged in
['role:admin']        // User role is 'admin'
['role:lecturer']     // User role is 'lecturer'
['verified']          // Email verified (Fortify)
```

---

## Timezone Options (Admin Step 2)

```php
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
```

---

## Plan Options (Admin Step 3)

```php
'free' => [
  'duration' => 'Forever',
  'expires_at' => null,
  'price' => '$0/month'
],
'pro' => [
  'duration' => '14 days (trial)',
  'expires_at' => now()->addDays(14),
  'trial_ends_at' => now()->addDays(14),
  'price' => '$50/month after trial'
],
'enterprise' => [
  'duration' => '14 days (trial)',
  'expires_at' => now()->addDays(14),
  'trial_ends_at' => now()->addDays(14),
  'price' => 'Custom pricing'
]
```

---

## Debugging Tips

### Check User Role
```php
Auth::user()->role  // 'admin', 'lecturer', null, etc.
Auth::user()->hasRole('admin')  // true/false
```

### Check User Status
```php
Auth::user()->status  // 'pending', 'active', etc.
```

### Check Registration Session
```php
Session::get('registration_role')  // 'admin' or 'lecturer'
```

### Check School Relationship
```php
Auth::user()->school           // School model
Auth::user()->school->name     // School name
Auth::user()->school->admin_id // Admin ID
```

### Verify Events Firing
```php
// In AppServiceProvider boot():
Event::listen(UserRegistered::class, function ($event) {
    Log::info('UserRegistered: ' . $event->userType);
});
```

### Test Email Queue
```bash
# Start queue worker to process emails
php artisan queue:work

# Or test individual email:
Mail::to('admin@school.com')->send(new WelcomeAdminEmail($user, $schoolName));
```

---

## Common Customizations

### Add New Timezone
Edit `AdminOnboarding.getTimezoneOptions()`:
```php
'Europe/Berlin' => 'Berlin (CET)',
```

### Add New Theme Option
Update radio buttons in `admin-onboarding.blade.php`:
```blade
<input type="radio" wire:model="theme" value="auto">
<span>Auto (System preference)</span>
```

### Extend Lecturer Phone Validation
In `LecturerOnboarding.php`:
```php
'phoneNumber' => ['nullable', 'phone:NG'],  // Use phone validation
```

### Change Auto-Polling Interval
In `lecturer-pending-approval.blade.php`:
```javascript
setInterval(function() {
    Livewire.dispatch('checkApproval');
}, 3000);  // Changed from 5000 to 3000 (3 seconds)
```

### Change Max Polling Attempts
In `LecturerPendingApproval.php`:
```php
public $maxPolls = 240;  // 20 minutes instead of 10
```

---

## Testing Commands

```bash
# Clear cache after changes
php artisan cache:clear

# Refresh migrations
php artisan migrate:refresh

# Run specific listener test
php artisan tinker
>>> event(new UserRegistered($user, 'admin'))

# Check database
sqlite3 database/database.sqlite
> SELECT * FROM users WHERE role='admin';
> SELECT * FROM schools;
> SELECT * FROM subscriptions;
```

---

## Troubleshooting Checklist

- [ ] Routes added to `routes/web.php`
- [ ] FortifyServiceProvider RegisterResponse configured
- [ ] AppServiceProvider event listeners registered
- [ ] Components have correct middleware
- [ ] Views folder exists with all 4 blade files
- [ ] User model has phone_number, approved_by, approved_at in fillable
- [ ] Database migration ran successfully
- [ ] Email service configured in `.env`
- [ ] Queue worker running (if using async emails)
- [ ] Livewire installed and working

---

## Production Checklist

- [ ] Email configuration tested with real SMTP
- [ ] Rate limiting configured for registration route
- [ ] CSRF protection enabled
- [ ] SQL injection prevented (using Eloquent)
- [ ] XSS protection enabled (Blade escaping)
- [ ] HTTPS enforced
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Session timeout set appropriately
- [ ] Admin approval workflow tested end-to-end

