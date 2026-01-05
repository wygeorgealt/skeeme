# Laravel Migration Plan for Skeeme

This document maps the current Skeeme PHP structure to a standard Laravel 12 application. It explains where each file or group of files will move, what gets refactored, and provides a step-by-step plan to migrate while keeping features intact.

Target stack: Laravel 12, PHP 8.2+, MySQL, Composer, Livewire 3 (with Alpine.js), Sanctum (for SPA/JWT if needed), Mail, Queue, and first-party Cashier optional (Paystack integration via custom driver/webhooks). No Vite required unless you decide to bundle assets.


## High-level Mapping

Current root → Laravel root
- public/ (current) → laravel/public (move assets and public endpoints)
- src/Controller/*.php → app/Http/Controllers/* (split into controllers per resource/feature)
- src/Auth/*.php → app/Http/Controllers/Auth + app/Models/User + routes/auth.php (Fortify/Breeze)
- templates/layouts/*.php → resources/views/layouts/* (Blade)
- templates/components/*.php → resources/views/components/* (Blade components)
- dashboards/*.php → resources/views/dashboards/* + controllers + routes
- subscriptions/*.php → app/Http/Controllers/Subscription/* + resources/views/subscriptions/* + routes/subscriptions.php
- config/config.php → Laravel config/*.php equivalents (database.php, session.php, cache.php, services.php, mail.php, etc.) and app/Providers/AppServiceProvider.php for boot logic
- src/Lib/*.php → app/Services/*, app/Support/*, app/Actions/*, app/Helpers/* (as needed)
- public/api/*.php → routes/api.php + controllers under app/Http/Controllers/Api/*
- db/*.sql → database/migrations/* + database/seeders/*
- partials/*.php → resources/views/partials/* (or components)
- lang/*.php → lang/{locale}/*.php (Laravel localization files)
- uploads/ & public/uploads → storage/app/public/* with symlink to public/storage
- cron/*.php → app/Console/Commands/* + Laravel scheduler (app/Console/Kernel.php)
- start_websocket_*.bat → ecosystem-specific devops scripts, or Laravel WebSockets config if using Pusher-compatible server


## Detailed File-by-File Mapping

### Config and Bootstrap
- config/config.php →
  - Database DSN and PDO options → config/database.php (mysql connection) and .env variables
  - Session settings/timeouts → config/session.php (.env: SESSION_LIFETIME)
  - JWT and auth helpers → Prefer Laravel Sanctum or Laravel Passport; else app/Services/JwtService.php + config/services.php
  - Third-party keys (Paystack, reCAPTCHA, Mailtrap, Africa’s Talking, DeepSeek) → .env + config/services.php
  - Upload constants → config/filesystems.php + .env (paths); use Storage facade
  - Redis/Notifications → config/database.php (redis), broadcasting.php for SSE/websockets
  - API_BASE_URL/BASE_PATH → url() helper + config/app.php + route helpers
  - Helpers (isLoggedIn, roles, feature gating) → Policies/Gates (app/Providers/AuthServiceProvider.php), Middleware, or dedicated services under app/Services/Permissions/PermissionManager.php
  - CSRF → Laravel middleware handles this (VerifyCsrfToken)
  - Logging → config/logging.php; custom channels if needed
  - Activity/audit logs → Models + migrations + app/Services/AuditService.php; fire in Events/Listeners or Middleware

- templates/layouts/header.php →
  - Blade layout: resources/views/layouts/app.blade.php
  - Sidebar partials per role: resources/views/layouts/partials/sidebar-{role}.blade.php
  - Pricing modal: resources/views/components/pricing-modal.blade.php (or a Livewire modal component)
  - Theme/JS initialization → Blade stacks (@push('scripts')) and Livewire hooks; avoid bundlers
  - SSE notification client → a small JS script included via Blade stacks; backend via events/broadcasting or dedicated SSE controller


### Controllers and Views
- src/Controller/*.php page-controllers → app/Http/Controllers/*Controller.php or Livewire components under app/Livewire/*
  - dashboard_router.php → HomeController@index with role-based redirect or RouteServiceProvider + middleware that redirects by role
  - classes.php, courses.php, manage_class.php, assign_lecturers.php →
    - Prefer Livewire: app/Livewire/Classes/Index.php, Courses/Index.php, Enrollments/Manager.php, CourseLecturers/Assign.php
    - Views: resources/views/livewire/{feature}/*.blade.php
    - Routes: routes/web.php (Route::get('/classes', Classes\\Index::class))
  - attendance.php → Livewire component Attendance/Index with actions for mark/update (replaces AJAX)
  - notes.php → Livewire Notes/Index for listing/uploading with WithFileUploads; views in resources/views/livewire/notes
  - exams suite (exams.php, take_exam.php, submit_exam.php, grade_exam.php, exam_result.php, review_exam.php, edit_exam.php, my_exams.php) →
    - Livewire components: Exams/Builder.php, Exams/Take.php, Exams/Grade.php, Exams/Result.php, QuestionBank/Index.php
    - Keep controllers only for download/export endpoints as needed
    - For external integrations, routes/api.php → Api controllers
  - scheme-of-work.php → SchemeController (index/store/update/export)
  - reports.php → Livewire Reports/Index rendering charts (Chart.js) or a ReportController returning Blade view
  - messages.php → Livewire Messages/Threads.php with polling/broadcasting for realtime updates
  - onboarding.php → OnboardingController (wizard steps)
  - admin_contact_submissions.php → Admin/ContactSubmissionController
  - faq.php, privacy.php, saas.php, pages/terms.php, pages/404.php → Static controllers + views under resources/views/pages/*
  - main.php (landing) → LandingController@index + resources/views/landing/index.blade.php

- src/Controller/pages/parent/* → Livewire Parent/* components where interactive (attendance, messages, reports), or simple Blade views for static pages; views under resources/views/parent and resources/views/livewire/parent

- public/api/*.php → Prefer Livewire actions for in-page interactions. For cross-page or third-party clients, keep routes/api.php + app/Http/Controllers/Api/*.
  - ajax_* endpoints are absorbed by Livewire component methods; keep only external-facing APIs as controllers


### Auth
- src/Auth/*.php →
  - Use Laravel Breeze or Fortify for registration/login/password reset/email verification
  - Controllers scaffolded by Breeze: app/Http/Controllers/Auth/*
  - Parent login via token → ParentAuthController + custom guard or validation service
  - Google OAuth → Laravel Socialite; config/services.php + app/Http/Controllers/Auth/GoogleController


### Subscriptions
- subscriptions/*.php →
  - Controllers: app/Http/Controllers/Subscriptions/* (PricingController, SubscriptionController, PaymentController, WebhookController)
  - Views: resources/views/subscriptions/* (pricing, manage)
  - Paystack integration: services configured in config/services.php; webhook route in routes/web.php (POST)
  - Permissions/Feature gating: app/Services/Permissions/PermissionManager.php + policies/gates; middleware `EnsureFeatureAccess`
  - Cron → Scheduler commands in app/Console/Commands/SubscriptionCron.php + schedule in app/Console/Kernel.php
  - promotions_admin.php → PromotionsController + views
  - subscriptions/src/Model/PermissionManager.php → app/Services/Permissions/PermissionManager.php and/or Gate definitions in AuthServiceProvider


### Lib/Helpers
- src/Lib/*.php →
  - helpers.php → app/Support/helpers.php (autoload via composer files section) or app/Support/Functions.php
  - exam_actions.php, exam_manager_additions.php → app/Services/Exams/* (domain services)
  - contact.php → app/Services/ContactService.php (sends mail/records contact submissions)
  - functions.php → split into services, helpers, and policies where appropriate


### Database and Migrations
- db/database.sql, skeeme.sql, schema_documentation.md → database/migrations/* + database/seeders/*
  - Build Eloquent models: app/Models/* (User, School, ClassRoom, Course, Enrollment, Attendance, Message, Note, Exam, ExamSubmission, Grade, QuestionBank, QuestionBankOption, QuestionBankAnswer, SchemeOfWork, SubscriptionPlan, AuditLog, UserActivityLog)
  - Relationships: define hasMany/belongsTo/belongsToMany with pivot models (e.g., class_courses, course_lecturers)
  - Feature flags: subscription_plans.features JSON → casts on model


### Assets and Frontend
- public/assets/* → keep in public/assets (no Vite). Optionally move to resources/{css,js,images} without a bundler
- templates/layouts scripts → include via Blade stacks (@stack('scripts')) and Livewire lifecycle hooks; Alpine.js recommended
- SSE/WS → simple SSE endpoints or Laravel Echo optional; Livewire can poll or listen to broadcasts


### Storage and Uploads
- uploads/*, public/uploads/* → storage/app/public/{notes,announcements,profiles,ai_documents}
- Configure symbolic link: `php artisan storage:link`
- Use Storage facade for file operations


### Middleware and Policies
- Access control currently in config.php helpers →
  - Middleware: EnsureAuthenticated (default), EnsureRole:{role}, EnsureFeatureAccess:{feature}
  - Policies: fine-grained control for models (e.g., CoursePolicy, ExamPolicy)
  - Gates: define global features in AuthServiceProvider


### Routes
- routes/web.php
  - Landing, dashboards, resources routes for classes/courses/notes/exams/messages/settings/subscriptions
- routes/api.php
  - JSON endpoints replacing public/api/*.php
- routes/channels.php
  - For broadcasting (notifications)
- Optional: routes/auth.php if using Fortify/Breeze


## Concrete Mapping Table (samples)

- src/Controller/attendance.php → app/Http/Controllers/AttendanceController.php; view: resources/views/attendance/index.blade.php; API: Api/AttendanceController
- src/Controller/notes.php → NoteController; views resources/views/notes/index.blade.php
- src/Controller/exams.php → ExamController@index/create/store; views resources/views/exams/*
- src/Controller/take_exam.php → ExamSessionController@show; view exams/take.blade.php; API for submissions in Api/ExamSubmissionController
- src/Controller/submit_exam.php → Api/ExamSubmissionController@store (JSON)
- src/Controller/messages.php → MessageController; views resources/views/messages/*; API for AJAX actions
- src/Controller/scheme-of-work.php → SchemeController
- src/Controller/reports.php → ReportController
- src/Controller/onboarding.php → OnboardingController
- dashboards/*.php → views resources/views/dashboards/{admin,lecturer,student}.blade.php plus dedicated controllers
- templates/layouts/header.php → layouts/app.blade.php + partials and components (include @livewireStyles and @livewireScripts)
- subscriptions/pricing.php → Subscriptions/PricingController@index; view subscriptions/pricing.blade.php
- subscriptions/payment.php → Subscriptions/PaymentController@create (redirect to Paystack)
- subscriptions/payment_callback.php → Subscriptions/PaymentController@callback
- subscriptions/paystack_webhook.php → Subscriptions/WebhookController@paystack
- subscriptions/subscription_cron.php → Console/Commands/SubscriptionCron + schedule()
- src/Auth/login.php → use Breeze/Fortify: Auth
auth routes & controllers


## Step-by-Step Migration Plan

1) Create Laravel project
- composer create-project laravel/laravel skeeme-laravel
- Configure .env (DB, MAIL, REDIS, QUEUE, SESSION_LIFETIME, APP_URL)

2) Migrate database schema to migrations
- Reverse-engineer tables from db/*.sql → migrations
- Create models with relationships and casts
- Seed base data (roles/plans)

3) Implement authentication
- Install Breeze or Fortify + Socialite for Google OAuth
- Implement Parent token login in custom controller/method

4) Implement feature gating and roles
- Gates in AuthServiceProvider for plan features
- Middleware for roles and feature access
- Port PermissionManager from subscriptions/src to app/Services/Permissions

5) Move views to Blade + Livewire
- Convert header.php → layouts/app.blade.php; extract sidebars and modals into Blade components; include @livewireStyles/@livewireScripts
- Convert interactive pages to Livewire components under app/Livewire with views in resources/views/livewire
- Wire routes to Livewire components (Route::get('/notes', Notes\\Index::class))

6) Replace public/api/*.php with Livewire or API controllers
- Prefer Livewire component methods for in-page actions; leverage Livewire validation and events
- For external calls, create Api namespace controllers returning JSON

7) Files and uploads
- Move uploads to storage/app/public and use Storage facade
- Create storage link

8) Notifications and SSE/WebSockets
- Start with simple polling or SSE controller; optionally adopt Laravel Echo + WebSockets

9) Payments (Paystack)
- Add service config, payment controller, webhook route with signature verification
- Update Subscription service to write schools.subscription_plan/status

10) Jobs, Scheduler, and Logs
- Convert cron scripts to Artisan commands and schedule them
- Move audit/user activity logging to events/listeners or a Logging service; use Monolog channels

11) Testing
- Add Feature/Unit tests for key flows (auth, exams, attendance, messaging, subscriptions)

12) Cutover
- Run migrations + seeders
- Sync uploads to storage
- Update DNS/web server to point to laravel/public


## Environment Variables Mapping
- MYSQL_* → DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
- JWT_SECRET → if using Passport/Custom JWT; else Sanctum
- PAYSTACK_* → PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY
- RECAPTCHA_* → RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY
- SMTP_* → MAIL_* (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_ENCRYPTION, MAIL_FROM_ADDRESS, MAIL_FROM_NAME)
- AFRICASTALKING_* → AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY
- DEEPSEEK_API_KEY → DEEPSEEK_API_KEY


## Security and Session Behavior
- Session lifetime configured via SESSION_LIFETIME; Laravel handles secure/httponly/samesite from config
- CSRF by VerifyCsrfToken; use @csrf in forms, axios includes XSRF-TOKEN cookie
- Authorization via policies/middleware instead of ad-hoc helpers


## Notes on Feature Parity
- Maintain role-based menus via Blade conditionals using Gate::allows/roles
- Feature access modal can remain as Blade component driven by Gate checks
- Keep client UX (theme, animations, accessibility) via shared layout and resources/js modules


## Appendix: Suggested Namespaces and Classes
- app/Services/Permissions/PermissionManager.php
- app/Services/Payments/PaystackService.php
- app/Services/Exams/ExamService.php, GradingService.php
- app/Services/Notifications/NotificationService.php (SSE/broadcast)
- app/Http/Middleware/EnsureRole.php
- app/Http/Middleware/EnsureFeatureAccess.php
- app/Policies/*Policy.php (CoursePolicy, ExamPolicy, MessagePolicy)

This guide should serve as a blueprint to move each file and feature into the Laravel conventions with minimal ambiguity while improving maintainability and security.