# Registration & Onboarding - Testing Checklist

## Pre-Testing Setup

### Environment Verification
- [ ] Laravel application running (`php artisan serve`)
- [ ] Database migrated successfully (`php artisan migrate`)
- [ ] Queue worker running (if using async mail) (`php artisan queue:work`)
- [ ] `.env` configured with:
  - [ ] `APP_URL=http://localhost:8000`
  - [ ] `MAIL_DRIVER=log` or `mailtrap` for testing
  - [ ] Database connection working
- [ ] Fortify authentication system working
- [ ] Livewire installed and responsive

### Database Cleanup
```bash
# Optional: Reset for clean testing
php artisan migrate:refresh
# or
php artisan tinker
>>> User::truncate(); School::truncate(); Subscription::truncate();
```

---

## Test Suite 1: Admin Registration Flow

### 1.1 - Registration Form Access
- [ ] Navigate to `/register`
- [ ] Fortify registration form displays
- [ ] Form has fields: name, email, password, password_confirmation
- [ ] Register button is clickable

### 1.2 - Basic Registration
- [ ] Fill form with:
  - [ ] Name: "John Doe"
  - [ ] Email: "admin@school.com"
  - [ ] Password: "SecurePass123!"
  - [ ] Password Confirmation: "SecurePass123!"
- [ ] Click "Register"
- [ ] Form validation passes

### 1.3 - Post-Registration Redirect
- [ ] After successful registration, redirected to `/role-selection`
- [ ] URL shows `/role-selection`
- [ ] Page loads without errors
- [ ] Session maintained (still authenticated)

### 1.4 - Role Selection Page
- [ ] Page displays two large cards (Admin, Lecturer)
- [ ] Admin card shows:
  - [ ] 🏫 emoji
  - [ ] "School Admin" title
  - [ ] Description text
  - [ ] 4 feature bullets (Manage settings, Academic calendar, Subscription, Approve lecturers)
  - [ ] "I'm a School Admin" button
- [ ] Lecturer card shows:
  - [ ] 👨‍🏫 emoji
  - [ ] "Lecturer" title
  - [ ] Description text
  - [ ] 4 feature bullets (Create courses, Attendance, Exams, Analytics)
  - [ ] "I'm a Lecturer" button
- [ ] Both cards are clickable and responsive
- [ ] Card styling matches design (purple borders, hover effects)

### 1.5 - Select Admin Role
- [ ] Click "I'm a School Admin" button
- [ ] Redirected to `/onboarding/admin`
- [ ] AdminOnboarding component loads

### 1.6 - Admin Onboarding - Step 1/3
- [ ] Progress bar shows 1/3 filled
- [ ] "Step 1 of 3" text displays
- [ ] Form shows section: "School & Personal Information"
- [ ] Form has 3 input fields:
  - [ ] School Name (placeholder: "Enter your school name")
  - [ ] First Name (placeholder: "Your first name")
  - [ ] Last Name (placeholder: "Your last name")
- [ ] Previous button hidden or disabled
- [ ] Next button visible and clickable

### 1.7 - Step 1 Validation
- [ ] Click Next without filling fields
  - [ ] Validation errors show for all fields
  - [ ] Error text appears in red below fields
  - [ ] Does not proceed to Step 2
- [ ] Fill only School Name, click Next
  - [ ] Validation errors show for First/Last Name
  - [ ] Stays on Step 1
- [ ] Fill all fields correctly:
  - [ ] School Name: "Lincoln High School"
  - [ ] First Name: "John"
  - [ ] Last Name: "Doe"
- [ ] Click Next
  - [ ] Validation passes
  - [ ] Proceeds to Step 2

### 1.8 - Admin Onboarding - Step 2/3
- [ ] Progress bar shows 2/3 filled
- [ ] "Step 2 of 3" text displays
- [ ] Form shows section: "School Configuration"
- [ ] Form has 3 fields:
  - [ ] Academic Year (placeholder: "e.g., 2024/2025")
  - [ ] Timezone (select dropdown with 10+ options)
  - [ ] Theme (radio buttons: Light, Dark)
- [ ] Previous button visible and works (goes back to Step 1)
  - [ ] Previous form data still filled in
- [ ] Timezone dropdown shows all options:
  - [ ] Africa/Lagos
  - [ ] Africa/Cairo
  - [ ] America/New_York
  - [ ] Europe/London
  - [ ] ... (verify 10+ options)
- [ ] Theme has Light and Dark options
- [ ] Fill Step 2 fields:
  - [ ] Academic Year: "2024/2025"
  - [ ] Timezone: "Africa/Lagos"
  - [ ] Theme: "Light"
- [ ] Click Next
  - [ ] Validation passes
  - [ ] Proceeds to Step 3

### 1.9 - Admin Onboarding - Step 3/3
- [ ] Progress bar shows 3/3 filled (100%)
- [ ] "Step 3 of 3" text displays
- [ ] Form shows section: "Choose Your Plan"
- [ ] Three plan options visible:
  - [ ] Free (Forever, $0/month)
  - [ ] Pro ($50/month, 14-day trial)
  - [ ] Enterprise (Custom, 14-day trial)
- [ ] Each plan has:
  - [ ] Radio button to select
  - [ ] Plan name
  - [ ] Price/duration info
  - [ ] Feature description
- [ ] Previous button visible and works
- [ ] Complete/Submit button visible
- [ ] Select "Free" plan
- [ ] Click "Complete Setup"

### 1.10 - Admin Onboarding Completion
- [ ] Validation passes
- [ ] Redirected to `/dashboard`
- [ ] Success message shows (optional)
- [ ] User stays logged in
- [ ] User can see dashboard

### 1.11 - Database Verification (Admin)
```sql
-- Check user was updated
SELECT id, email, role, school_id, first_name, last_name, status 
FROM users 
WHERE email='admin@school.com';
-- Expected: role='admin', school_id=<id>, first_name='John', last_name='Doe', status='active'

-- Check school was created
SELECT id, admin_id, name, academic_year, timezone, theme 
FROM schools 
WHERE admin_id=<admin_id>;
-- Expected: name='Lincoln High School', academic_year='2024/2025', timezone='Africa/Lagos', theme='light'

-- Check subscription was created
SELECT id, school_id, plan_name, status, expires_at 
FROM subscriptions 
WHERE school_id=<school_id>;
-- Expected: plan_name='free', status='active', expires_at=NULL
```

### 1.12 - Email Verification (Admin)
- [ ] Check mail logs/inbox for WelcomeAdminEmail
- [ ] Email received at admin@school.com
- [ ] Email subject: "Welcome to Skeeme!" or similar
- [ ] Email contains:
  - [ ] School name: "Lincoln High School"
  - [ ] Admin name: "John Doe"
  - [ ] Welcome message
  - [ ] Skeeme logo
- [ ] Email has purple gradient header
- [ ] Email is responsive (test on mobile if possible)

---

## Test Suite 2: Lecturer Registration Flow

### 2.1 - Registration Form (Fresh Account)
- [ ] Register new user:
  - [ ] Name: "Jane Smith"
  - [ ] Email: "lecturer@school.com"
  - [ ] Password: "SecurePass123!"

### 2.2 - Role Selection (Lecturer)
- [ ] After registration, redirected to `/role-selection`
- [ ] Click "I'm a Lecturer"
- [ ] Redirected to `/onboarding/lecturer`

### 2.3 - Lecturer Onboarding - Step 1/2
- [ ] Progress bar shows 1/2 filled
- [ ] "Step 1 of 2" text displays
- [ ] Form shows section: "Your Information"
- [ ] Form has 3 fields:
  - [ ] First Name
  - [ ] Last Name
  - [ ] Phone Number (marked Optional)
- [ ] Previous button hidden or disabled
- [ ] Next button visible

### 2.4 - Step 1 Validation (Lecturer)
- [ ] Click Next without filling
  - [ ] Validation errors for First/Last Name
  - [ ] Phone Number allows empty (no error)
- [ ] Fill fields:
  - [ ] First Name: "Jane"
  - [ ] Last Name: "Smith"
  - [ ] Phone Number: (leave empty for this test)
- [ ] Click Next
  - [ ] Proceeds to Step 2

### 2.5 - Lecturer Onboarding - Step 2/2
- [ ] Progress bar shows 2/2 filled
- [ ] "Step 2 of 2" text displays
- [ ] Form shows section: "Select Your School"
- [ ] School search input visible
- [ ] Placeholder text: "Start typing your school name..."
- [ ] Previous button visible and works

### 2.6 - Live School Search
- [ ] Type "Lin" in school search
  - [ ] Live autocomplete filters
  - [ ] Dropdown appears with matching schools
  - [ ] Shows "Lincoln High School" (from admin test)
  - [ ] Shows other schools if they exist
- [ ] Type "Test"
  - [ ] Shows only schools with "Test" in name
  - [ ] If no matches, dropdown empty
- [ ] Clear search
  - [ ] Dropdown disappears

### 2.7 - Select School
- [ ] Type "Lincoln" in school search
- [ ] See "Lincoln High School" in dropdown
- [ ] Click on it
- [ ] School name populates in input
- [ ] Green checkmark box appears: "✓ Selected School: Lincoln High School"
- [ ] Dropdown closes
- [ ] Submit button becomes enabled

### 2.8 - Lecturer Onboarding Completion
- [ ] Click "Submit for Approval"
- [ ] Validation passes
- [ ] Redirected to `/pending-approval`

### 2.9 - Database Verification (Lecturer)
```sql
-- Check user was updated
SELECT id, email, role, school_id, first_name, last_name, phone_number, status 
FROM users 
WHERE email='lecturer@school.com';
-- Expected: role='lecturer', school_id=<id>, first_name='Jane', last_name='Smith', status='pending'

-- No email sent at this stage (unlike admin)
```

### 2.10 - Pending Approval Page
- [ ] Page displays "⏳ Approval Pending"
- [ ] Subheading: "Your account is under review"
- [ ] School display shows: "School: Lincoln High School"
- [ ] "What's happening?" section shows:
  - [ ] ✓ Your account has been created
  - [ ] ⏳ Waiting: Admin to review your details
  - [ ] 📧 You'll receive an email once approved
- [ ] "What's Being Verified" section shows 4 items:
  - [ ] Email address
  - [ ] Full name
  - [ ] Phone number
  - [ ] School affiliation
- [ ] Status badge shows: "Status: Pending"
- [ ] Timeline info shows:
  - [ ] Submitted date
  - [ ] Typical approval time (24-48 hours)
  - [ ] Auto-checking interval (5 seconds)
- [ ] "Check Status Now" button visible
- [ ] "🔄 Auto-checking every 5 seconds..." message visible
- [ ] Support link present

### 2.11 - Auto-Polling Test (Part 1)
- [ ] Open browser console (F12)
- [ ] Lecturer waits on pending-approval page
- [ ] Watch console for Livewire dispatch calls
- [ ] Verify checkApproval is called every 5 seconds
- [ ] Page does NOT redirect yet (admin hasn't approved)

---

## Test Suite 3: Admin Approval Flow

### 3.1 - Admin Access to Lecturer Management
- [ ] Login as admin (admin@school.com)
- [ ] Navigate to Lecturer Management page
- [ ] See pending lecturers section
- [ ] Jane Smith (lecturer@school.com) listed with "Pending" status

### 3.2 - Approve Lecturer
- [ ] Find Jane Smith in pending lecturers list
- [ ] Click approval button (checkmark, approve, etc.)
- [ ] Confirmation modal appears
- [ ] Confirm approval
- [ ] Jane Smith status changes to "Active" or "Approved"
- [ ] Success message shows: "Lecturer approved successfully. Approval email sent."

### 3.3 - Database Verification (After Approval)
```sql
-- Check lecturer status updated
SELECT id, email, role, status, approved_by, approved_at 
FROM users 
WHERE email='lecturer@school.com';
-- Expected: status='active', approved_by=<admin_id>, approved_at=<timestamp>
```

### 3.4 - Email Verification (Lecturer Approval)
- [ ] Check mail logs/inbox for LecturerApprovalNotificationEmail
- [ ] Email received at lecturer@school.com
- [ ] Email subject: "Your Skeeme Account Has Been Approved" or similar
- [ ] Email contains:
  - [ ] Lecturer name: "Jane Smith"
  - [ ] School name: "Lincoln High School"
  - [ ] Admin name: "John Doe"
  - [ ] First login link or dashboard link
  - [ ] Confirmation message
- [ ] Email has purple gradient header
- [ ] Email is responsive

### 3.5 - Auto-Polling Detection (Part 2)
- [ ] While lecturer still has pending-approval page open
- [ ] Auto-polling (every 5 seconds) detects status='active'
- [ ] Page automatically redirects to `/dashboard`
- [ ] Success message appears: "Your account has been approved! Welcome to Skeeme."
- [ ] Lecturer now on dashboard

### 3.6 - Manual Check Button
- [ ] Open pending-approval page again with another lecturer
- [ ] Click "Check Status Now" button manually
- [ ] If not approved: stays on page
- [ ] If approved: redirects to dashboard

---

## Test Suite 4: Edge Cases & Error Handling

### 4.1 - Session Timeout
- [ ] Start registration, get to role-selection
- [ ] Wait for session to expire (default 120 minutes)
- [ ] OR manually clear session
- [ ] Try to proceed to onboarding
- [ ] Should redirect to login or role-selection

### 4.2 - Direct URL Access (Unauthorized)
- [ ] Logout completely
- [ ] Try to access `/onboarding/admin`
  - [ ] Should redirect to login or role-selection
- [ ] Try to access `/pending-approval`
  - [ ] Should redirect to login

### 4.3 - Role Mismatch
- [ ] Register as admin
- [ ] On admin onboarding, try to access `/onboarding/lecturer`
  - [ ] Should show error or redirect
- [ ] Register as lecturer
- [ ] Try to access `/onboarding/admin` directly
  - [ ] Should show error or redirect

### 4.4 - Back Button Hijacking
- [ ] Complete Step 1 of admin onboarding
- [ ] Go to Step 2
- [ ] Click browser back button
- [ ] Should stay on step 2 (Livewire prevents page refresh)
- [ ] OR might go back to role-selection (expected behavior)

### 4.5 - Form Resubmission
- [ ] Complete admin onboarding
- [ ] Click "Complete Setup" button twice quickly
  - [ ] Should only create one School/Subscription
  - [ ] Button should be disabled or handle duplicate submission

### 4.6 - Invalid School ID
- [ ] On lecturer Step 2, manually edit HTML to select non-existent school ID
- [ ] Submit form
- [ ] Should show validation error: "School does not exist"

### 4.7 - Empty School Search
- [ ] Lecturer onboarding Step 2
- [ ] Leave school search empty
- [ ] Click "Submit for Approval"
- [ ] Should show validation error: "School is required"

---

## Test Suite 5: UI/UX Testing

### 5.1 - Responsive Design
- [ ] Test role-selection page on:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] Cards stack vertically on mobile
- [ ] Text is readable at all sizes
- [ ] Buttons are easily clickable on mobile

### 5.2 - Form Layout
- [ ] Admin onboarding fields align properly
- [ ] Input fields have proper spacing
- [ ] Error messages don't overlap content
- [ ] Progress bar is visible and clear

### 5.3 - Accessibility
- [ ] All form inputs have proper labels
- [ ] Color contrast meets WCAG standards
- [ ] Buttons have focus states (keyboard navigation)
- [ ] No keyboard traps

### 5.4 - Visual Feedback
- [ ] Buttons have hover effects
- [ ] Disabled buttons appear disabled
- [ ] Form inputs show focus ring
- [ ] Loading states (if any) are visible

### 5.5 - Error Messages
- [ ] Validation errors are clear and specific
- [ ] Error messages appear immediately
- [ ] Errors clear when field is corrected
- [ ] Error text is red and visible

---

## Test Suite 6: Performance & Load Testing

### 6.1 - Page Load Times
- [ ] Role-selection loads in < 2 seconds
- [ ] Admin onboarding loads in < 2 seconds
- [ ] Lecturer onboarding loads in < 2 seconds
- [ ] Pending approval loads in < 2 seconds

### 6.2 - Form Responsiveness
- [ ] Typing in search field is smooth (no lag)
- [ ] Autocomplete dropdown appears < 500ms
- [ ] Step navigation (Next/Previous) is instant

### 6.3 - Auto-Polling Performance
- [ ] Auto-polling doesn't cause page slowdown
- [ ] Browser memory usage doesn't increase significantly
- [ ] CPU usage minimal during polling

### 6.4 - Large Database
- [ ] If many schools exist (1000+), search still performs
- [ ] Dropdown renders smoothly with many results
- [ ] Autocomplete limits results (currently 10)

---

## Test Suite 7: Security Testing

### 7.1 - SQL Injection
- [ ] Try school search: `' OR '1'='1`
  - [ ] Should not bypass search
  - [ ] Should return no results or be escaped
- [ ] Try email field: `"; DROP TABLE users; --`
  - [ ] Should not execute
  - [ ] Should validate as invalid email

### 7.2 - XSS (Cross-Site Scripting)
- [ ] Try name field: `<script>alert('xss')</script>`
  - [ ] Should not execute script
  - [ ] Should display as text or be rejected
- [ ] Try school search: `<img src=x onerror=alert(1)>`
  - [ ] Should not execute
  - [ ] Should not render image

### 7.3 - CSRF Protection
- [ ] Form submission includes CSRF token
- [ ] Token is included in Livewire requests
- [ ] Token is validated on submission

### 7.4 - Authentication Bypass
- [ ] Try to access onboarding routes without authentication
  - [ ] Should redirect to login
- [ ] Try to access with different user's session
  - [ ] Should only see own data

### 7.5 - Authorization Check
- [ ] Lecturer cannot approve other lecturers
- [ ] Non-admin cannot access approval functions
- [ ] Admin cannot directly set own status to 'active'

---

## Test Suite 8: Email Integration

### 8.1 - Email Queue (If using async)
- [ ] Start queue worker: `php artisan queue:work`
- [ ] Complete admin onboarding
- [ ] Email doesn't send immediately (should be queued)
- [ ] Queue worker processes email
- [ ] Email appears in logs/inbox

### 8.2 - Email Rendering
- [ ] Download email HTML
- [ ] Open in email client (Gmail, Outlook, etc.)
- [ ] All content renders correctly
- [ ] Images load properly
- [ ] Links are clickable
- [ ] Layout looks good on mobile email clients

### 8.3 - Email Links
- [ ] Click dashboard link in approval email
- [ ] Should go to correct URL
- [ ] Should be authenticated (if link includes token)

---

## Test Suite 9: Integration Testing

### 9.1 - Complete Admin Journey
- [ ] Register new account
- [ ] Select Admin role
- [ ] Complete all 3 onboarding steps
- [ ] Verify school created
- [ ] Verify subscription created
- [ ] Verify admin can access school management features
- [ ] Verify admin email received

### 9.2 - Complete Lecturer Journey
- [ ] Register new account
- [ ] Select Lecturer role
- [ ] Complete 2 onboarding steps
- [ ] Verify on pending page
- [ ] Login as admin, approve lecturer
- [ ] Verify lecturer email received
- [ ] Go back to pending page as lecturer
- [ ] Verify auto-approval detection and redirect
- [ ] Verify lecturer can access dashboard

### 9.3 - Multiple Schools
- [ ] Create Admin 1 with School A
- [ ] Create Admin 2 with School B
- [ ] Create Lecturer 1, join School A
- [ ] Create Lecturer 2, join School B
- [ ] Verify each lecturer only sees their school
- [ ] Verify each admin only sees their lecturers

---

## Test Suite 10: Regression Testing

### 10.1 - Existing Features Still Work
- [ ] Login still works
- [ ] Dashboard loads
- [ ] Other admin features work
- [ ] Student access unchanged
- [ ] Existing lecturer features work

### 10.2 - No Data Loss
- [ ] Existing users unchanged
- [ ] Existing schools unchanged
- [ ] Database integrity maintained

---

## Regression Testing - Quick Checklist

- [ ] Users table has correct fields (no duplicates)
- [ ] Schools table unmodified
- [ ] Subscriptions table unmodified
- [ ] No orphaned records in database
- [ ] Fortify still validates emails
- [ ] Middleware still works
- [ ] Events still fire for other systems
- [ ] API routes (if any) still work

---

## Sign-Off Checklist

When all tests pass:

- [ ] All 10 test suites completed successfully
- [ ] No errors in application logs
- [ ] No errors in browser console
- [ ] Database clean (no orphaned records)
- [ ] Emails delivered successfully
- [ ] Performance acceptable
- [ ] Security measures verified
- [ ] UI/UX meets expectations
- [ ] Mobile responsive verified
- [ ] Documentation reviewed and accurate

### Final Verification

- [ ] System ready for production deployment
- [ ] Team trained on new flows
- [ ] Monitoring/logging configured
- [ ] Backup procedures in place
- [ ] Rollback plan documented

---

**Date Tested**: _______________
**Tested By**: _______________
**Issues Found**: _______________
**Status**: ☐ PASSED ☐ FAILED (needs fixes)

