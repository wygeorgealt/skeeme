# Skeeme Codebase Summary

This document summarizes the key application layers with a focus on Controllers, Dashboards, Subscriptions, Auth, and Config. Each entry lists: Title, DB structures/queries used, Purpose, and Component summaries.

Note: DB schema details derive from inline queries and db/schema_documentation.md.


## Config Files

### config/config.php
- Title: Global Configuration and Bootstrap
- DB Structures/Queries:
  - Establishes PDO connection to MySQL using DSN `mysql:host; dbname; charset=utf8mb4` with ERRMODE_EXCEPTION and persistent connections.
  - Reads user settings: `SELECT timezone FROM user_settings ...` (graceful fallback) and multiple users table lookups during session/JWT validation: `SELECT id, status FROM users WHERE id = ?` and `SELECT id, first_name, last_name, email, role, status, school_id FROM users WHERE id = ?`.
  - Subscription feature checks join schools and subscription_plans: `SELECT s.subscription_plan, sp.features FROM schools s LEFT JOIN subscription_plans sp ON s.subscription_plan = sp.plan_name WHERE s.id = ?`.
  - Audit/logging inserts: `INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)` and `INSERT INTO user_activity_log (...) VALUES (..., NOW())`.
  - Misc checks: parent token uniqueness on users, courses unique code generation, schools plan fetch for gating, etc.
- Purpose: Central app bootstrap. Initializes session, timezone, PDO, JWT, feature/permission helpers, CSRF, logging, redirects, and feature gating (pricing modal fallback). Defines app constants (uploads, Redis, notifications, API base URL, third-party keys for Paystack, reCAPTCHA, Mailtrap, Africa’s Talking, DeepSeek).
- Components:
  - Auth helpers: isLoggedIn, validateSessionUser, validateJWTToken, verifyJWT, requireLogin, role helpers (isLecturer/isStudent/isSchoolAdmin), hasPermission.
  - Feature access: hasFeature, canAccessFeature, requireFeature, getCurrentPlan, isPlanOrHigher.
  - Security: CSRF token generate/verify, logSecurityEvent, sanitizeInput.
  - Utilities: file helpers, icons, redirectTo/url wrapper, flash messages, logging.

### templates/layouts/header.php
- Title: Global Header, Theme, Sidebar, and Client UX Infrastructure
- DB Structures/Queries:
  - Load user settings from users table: `SELECT theme, font_size, ... timezone FROM users WHERE id = ?`.
  - Unread messages: `SELECT COUNT(*) FROM messages WHERE recipient_id = ? AND is_read = 0`.
  - School name/logo: `SELECT name, logo FROM schools WHERE id = ?`.
  - Fetch profile pictures for role-specific avatar from users table.
- Purpose: Provides global layout chrome: sidebar navigation per role, user dropdown, global theme system (dark/light with CSS vars), localization helper, SSE notifications, pricing modal hooks, accessibility classes, and component asset loading.
- Components:
  - initializeGlobalSettings + getGlobalSettingsBodyClasses for theme/accessibility.
  - startHeader/endHeader functions to wrap pages with common head/body sections.
  - Inlined theme handler, notification SSE client, modal manager shim, feature-access checks, global settings sync, and user dropdown logic.


## Dashboard Pages (dashboards/)

### dashboards/admin_dashboard.php
- Title: Admin Dashboard
- DB: Typically aggregates stats for schools/users/courses; uses shared assets via dashboards/dashboard_shared_assets.php (see code for exact queries).
- Purpose: High-level overview for school_admin role (metrics, shortcuts to management sections).
- Components: Metric cards, charts via Chart.js, role-based sidebar from header.php.

### dashboards/lecturer_dashboard.php
- Title: Lecturer Dashboard
- DB: Course and student engagement summaries for current lecturer; relies on queries in controllers like reports.php/notes.php.
- Purpose: Teaching overview (attendance shortcuts, exams, messages).
- Components: Course list, upcoming exams, quick links.

### dashboards/student_dashboard.php
- Title: Student Dashboard
- DB: Enrollments, upcoming exams, unread messages, attendance streaks (via controllers/public APIs).
- Purpose: Student home with quick access to classes, notes, exams.
- Components: Cards, announcements, progress widgets.

### dashboards/dashboard_shared_assets.php
- Title: Shared UI/JS/CSS for Dashboards
- Purpose: Consolidated shared assets and helpers used across dashboards (animations, widgets).


## Controller Pages (src/Controller/)

Representative highlights; see each file inline for full UI.

- main.php (Landing)
  - DB: None for content; includes global config and landing header. Pricing currency persists via public/api/ajax_currency_handler.php.
  - Purpose: Marketing landing page with features and pricing.
  - Components: AOS animations, pricing cards, CTA.

- dashboard_router.php
  - DB: Uses session to route; may query users to confirm role; defers to role dashboards.
  - Purpose: Central role-aware redirect to correct dashboard.
  - Components: Minimal wrapper.

- classes.php / courses.php / manage_class.php / assign_lecturers.php / lecturers.php / students.php
  - DB: Heavy CRUD on users, classes, courses, enrollments, class_courses, course_lecturers:
    - users: create/update/delete students, reset passwords; parent_token generation.
    - classes: lists by school; class_courses mapping; enrollments re-sync on class change.
    - Queries include joins with classes, enrollments, class_courses, course_lecturers; deletes from enrollments; counts for pagination.
  - Purpose: School management screens for admin/lecturer.
  - Components: Filter/search/sort UI, modals for create/edit, batch actions.

- attendance.php
  - DB: attendance table CRUD via AJAX endpoints under public/api (ajax_get_attendance, ajax_save_attendance), course selection via joins to lecturer/student context.
  - Purpose: Mark/view attendance per course/date.
  - Components: Calendar/date pickers, status chips, notifications.

- notes.php
  - DB: Lists classes and courses for lecturer/student via joins (classes, class_courses, enrollments, course_lecturers). Loads notes by course from notes table ordered by uploaded_at.
  - Purpose: Upload and browse study materials.
  - Components: Upload UI (file validations), list/grid, filters.

- exams.php / take_exam.php / submit_exam.php / grade_exam.php / exam_result.php / review_exam.php / my_exams.php / export_results.php / export_grades.php / export_course_grades.php / edit_exam.php
  - DB: exams, exam_questions, question_bank, question_bank_options/answers, exam_submissions, grades, enrollments, courses.
    - take_exam.php: Ensures single in-progress submission: `SELECT id, started_at FROM exam_submissions WHERE exam_id = ? AND student_id = ? AND status = 'in_progress'`; creates if missing; loads user theme; persists answers client-side with recovery.
    - submit_exam.php: Parses submitted answers, records to exam_submissions/grades.
  - Purpose: Full CBT lifecycle: authoring, sitting, grading, exporting.
  - Components: Timers, navigation, autosave, result views, PDF/CSV exports.

- question_bank.php
  - DB: Course list for lecturer; aggregates difficulties from question_bank; fetches full question meta and options/answers for each question. Multiple joins with courses, users, course_lecturers.
  - Purpose: Central bank for reusable questions.
  - Components: CRUD modals, bulk clear with confirmations, filters.

- reports.php
  - DB: Attendance summaries: `COUNT(DISTINCT DATE(marked_at)) as total_classes`, per-student present_count joining enrollments; scheme_of_work status aggregations. Course selection guard checks lecturer ownership.
  - Purpose: Analytics and performance summaries per course.
  - Components: Charts, tables, export links.

- scheme-of-work.php
  - DB: Validates lecturer ownership or enrollment; lists and inserts scheme_of_work by course; updates read status; multiple course listing queries for lecturer/student contexts.
  - Purpose: Curriculum planning and status tracking.
  - Components: Status chips, add/edit items, export PDF, confirmation modal, notifications.

- messages.php and pages/parent/messages.php
  - DB: Messaging thread lists with last-message per conversation; unread counts grouped by sender; CRUD: insert, mark read, delete/hide; lookups for role-based recipient sets.
  - Purpose: In-app messaging for lecturer-student-admin and parent comms.
  - Components: Conversation list, real-time updates via websocket/SSE, modals for delete/clear.

- settings.php
  - DB: Load/update users and schools settings; timezone, language, theme, accessibility prefs; updates school academic year, allow_student_password_change, logo upload.
  - Purpose: User and school settings management.
  - Components: Glassmorphism forms, validation, toasts; sync with global theme system.

- onboarding.php
  - DB: Users join schools; update school settings, logo, timezone; mark onboarding complete.
  - Purpose: First-run guided setup for admins/lecturers.
  - Components: Stepper UI, file upload, validation.

- faq.php, privacy.php, saas.php, pages/terms.php, pages/404.php
  - DB: Mostly static content (privacy/terms reuse styles from main); minimal or no DB access.
  - Purpose: Public information pages and error page.

- admin_contact_submissions.php
  - DB: Lists and manages contact submissions (see src/Lib/contact.php for inserts).
  - Purpose: Admin view of contact form.


## Auth Files (src/Auth/)

- login.php / logout.php
  - DB: Validate users by email/username; set session, optionally create JWT; update last activity; logout clears session/JWT.
  - Purpose: User authentication lifecycle.
  - Components: CSRF, error flash, redirects via config helpers.

- register.php / register_school.php / register_lecturer.php
  - DB: Create users (role: student/lecturer) and schools for admin; insert users, schools, possibly default class/course mappings; send verification/OTP.
  - Purpose: Account creation flows.
  - Components: Validation, OTP prompts, success screens.

- forgot-password.php / reset-password.php / verify_otp.php
  - DB: OTP/verification tables or columns on users; update password_hash; mark verified.
  - Purpose: Password recovery and verification.
  - Components: Email/SMS integrations per config (Mailtrap/Africa’s Talking).

- google_oauth.php / google_oauth_register.php / google_oauth_logout.php
  - DB: Link Google identity to users; create or find user; set session.
  - Purpose: Social login and account linking.
  - Components: Google OAuth flow, callbacks, logout bridge.

- parent_login.php / parent_logout.php
  - DB: Validate parent via student parent_token on users; set parent_view session and student_id.
  - Purpose: Parent portal access without standard user account.
  - Components: Minimal views, redirect to parent portal pages.

- footer.php
  - Purpose: Shared auth footer/links.


## Subscription Pages (subscriptions/)

- subscriptions/pricing.php
  - DB: Fetch current plan/features via public/api/get_pricing.php and session. Uses PermissionManager and helper functions in subscriptions/src.
  - Purpose: Pricing page to compare plans and trigger upgrades; used also as modal.
  - Components: Cards, currency toggles, plan feature matrix, Paystack button.

- subscriptions/subscription.php
  - DB: Reads current school subscription and features; may call enhanced_subscription_functions.php.
  - Purpose: Subscription management overview.
  - Components: Current plan, status, change plan actions.

- subscriptions/payment.php and paystack_webhook.php and payment_callback.php
  - DB: Create payment intents/transactions; update schools subscription_plan and subscription_status based on webhook events; store transaction logs.
  - Purpose: Handle Paystack checkout and callback lifecycle.
  - Components: Paystack JS, server callbacks with signature verification.

- subscriptions/subscription_cron.php
  - DB: Periodic checks to expire or renew subscriptions; updates schools table accordingly.
  - Purpose: Background maintenance.

- subscriptions/promotions_admin.php
  - DB: Create/manage promotional offers for plans.
  - Purpose: Internal promotions tooling.

- subscriptions/src (notable)
  - Model/PermissionManager.php: Centralized feature gating by plan with session cache; consumed by config.php hasFeature/canAccessFeature/requireFeature.
  - enhanced_subscription_functions.php and subscription_functions.php: Helper APIs for pricing calculations, plan metadata, and checks.
  - pricing_modal_component.php: UI partial injected from header to display upgrade modal if feature is unavailable.


## Component Summaries and Cross-Cutting Concerns

- Role-based Navigation: Implemented in templates/layouts/header.php with checks isLecturer/isStudent/role === school_admin; links to controllers by url().
- Feature Gating: requireFeature/canAccessFeature and client-side checkFeatureAccess() integrate with pricing modal.
- Notifications: SSE client in header and server endpoints in public/api for notifications and read states.
- Security: CSRF meta and helpers, session strict mode, JWT validation, session timeout with public-page exemptions.
- Internationalization: templates/lang/*.php loaded based on userLanguage.
- File Uploads: Paths and size limits in config; notes/announcements/profile uploads with helpers allowedFile/formatFileSize.


## Database Entities Observed via Queries

- users (role, status, school_id, class_id, settings fields, profile_picture, parent_token, timezone)
- schools (subscription_plan, subscription_status, name, logo, settings fields)
- subscription_plans (plan_name, features JSON)
- audit_log, user_activity_log
- classes, class_courses (class/course mapping)
- courses, course_lecturers (lecturer/course mapping)
- enrollments (student/course mapping)
- attendance
- messages
- notes
- exams, exam_submissions, grades
- question_bank, question_bank_options, question_bank_answers
- scheme_of_work


## How to Navigate This Codebase

- Start at public/index.php and src/Controller/dashboard_router.php for routing.
- All pages include config/config.php, which initializes the environment and enforces auth/plan checks.
- UI is wrapped by templates/layouts/header.php’s startHeader()/endHeader().
- AJAX endpoints live in public/api/*; keep CSRF and auth in mind.

