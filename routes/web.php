<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Livewire\Volt\Volt;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\RoleSelectionController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\IntegrationController;

/* ------------------------------------------------------------------ */
/* Public routes                                                      */
/* ------------------------------------------------------------------ */
Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/book-demo', [\App\Http\Controllers\BookDemoController::class, 'index'])->name('book-demo');
Route::post('/book-demo', [\App\Http\Controllers\BookDemoController::class, 'store'])->name('book-demo.store');

Route::get('/students/profile', [\App\Http\Controllers\StudentProfileController::class, 'edit'])->name('student.profile')->middleware(['auth', 'verified']);
Route::patch('/students/profile', [\App\Http\Controllers\StudentProfileController::class, 'update'])->name('student.profile.update')->middleware(['auth', 'verified']);
Route::put('/students/profile/password', [\App\Http\Controllers\StudentProfileController::class, 'updatePassword'])->name('student.profile.password')->middleware(['auth', 'verified']);

Route::get('/students', fn() => view('landing.products.students'))->name('products.students');
Route::get('/students/subscribe', [\App\Http\Controllers\StudentSubscriptionController::class, 'subscribe'])->name('students.subscribe');
Route::get('/students/callback', [\App\Http\Controllers\StudentSubscriptionController::class, 'callback'])->name('students.callback');


/* ------------------------------------------------------------------ */
/* Integration routes                                                 */
/* ------------------------------------------------------------------ */
Route::get('/integrations/{provider}/redirect', [IntegrationController::class, 'redirect'])->name('integrations.redirect');
Route::get('/integrations/{provider}/callback', [IntegrationController::class, 'callback'])->name('integrations.callback');

// Features pages
Route::get('/features/dashboard', function () {
    return view('landing.features.dashboard');
})->name('features.dashboard');

Route::get('/features/analytics', function () {
    return view('landing.features.analytics');
})->name('features.analytics');

Route::get('/features/reports', function () {
    return view('landing.features.reports');
})->name('features.reports');

Route::get('/features/integrations', function () {
    return view('landing.features.integrations');
})->name('features.integrations');

// Platform pages (Redirecting missing views back to Documentation)
Route::redirect('/platform/overview', '/learn/documentation');
Route::redirect('/platform/api-access', '/learn/documentation');
Route::redirect('/platform/documentation', '/learn/documentation');
Route::redirect('/platform/security', '/learn/documentation');

// Pricing page
Route::get('/pricing', function () {
    return view('landing.pricing.index');
})->name('pricing');

// Learn pages
Route::get('/learn/documentation', function () {
    return view('landing.learn.documentation');
})->name('learn.documentation');

// Documentation guides
Route::get('/learn/documentation/initial-setup-guide', function () {
    return view('landing.learn.initial-setup-guide');
})->name('learn.documentation.initial-setup-guide');

Route::get('/learn/documentation/inviting-users', function () {
    return view('landing.learn.inviting-users');
})->name('learn.documentation.inviting-users');

Route::get('/learn/documentation/creating-first-exam', function () {
    return view('landing.learn.creating-first-exam');
})->name('learn.documentation.creating-first-exam');

Route::get('/learn/documentation/exam-management-basics', function () {
    return view('landing.learn.exam-management-basics');
})->name('learn.documentation.exam-management-basics');

Route::get('/learn/documentation/ai-question-generation', function () {
    return view('landing.learn.ai-question-generation');
})->name('learn.documentation.ai-question-generation');

Route::get('/learn/documentation/ai-auto-grading', function () {
    return view('landing.learn.ai-auto-grading');
})->name('learn.documentation.ai-auto-grading');

Route::get('/learn/documentation/analytics-dashboard', function () {
    return view('landing.learn.analytics-dashboard');
})->name('learn.documentation.analytics-dashboard');

Route::get('/learn/documentation/attendance-tracking', function () {
    return view('landing.learn.attendance-tracking');
})->name('learn.documentation.attendance-tracking');

Route::get('/learn/documentation/generating-reports', function () {
    return view('landing.learn.generating-reports');
})->name('learn.documentation.generating-reports');

Route::get('/learn/documentation/school-configuration', function () {
    return view('landing.learn.school-configuration');
})->name('learn.documentation.school-configuration');

Route::get('/learn/documentation/user-management', function () {
    return view('landing.learn.user-management');
})->name('learn.documentation.user-management');

Route::get('/learn/documentation/data-import-export', function () {
    return view('landing.learn.data-import-export');
})->name('learn.documentation.data-import-export');

Route::get('/integrations', function () {
    return view('landing.integrations');
})->name('integrations.showcase');

Route::get('/changelog', function () {
    return view('landing.changelog');
})->name('changelog');

// Blog articles
Route::get('/learn/blog/ai-powered-education', function () {
    return view('landing.learn.articles.ai-powered-education');
})->name('learn.blog.ai-powered-education');

Route::get('/learn/blog/analytics-improve-outcomes', function () {
    return view('landing.learn.articles.analytics-improve-outcomes');
})->name('learn.blog.analytics-improve-outcomes');

Route::get('/learn/blog/new-analytics-dashboard', function () {
    return view('landing.learn.articles.new-analytics-dashboard');
})->name('learn.blog.new-analytics-dashboard');

Route::get('/learn/blog/lagos-secondary-case-study', function () {
    return view('landing.learn.articles.lagos-secondary-case-study');
})->name('learn.blog.lagos-secondary-case-study');

Route::get('/learn/blog/exam-security-preventing-cheating', function () {
    return view('landing.learn.articles.exam-security-preventing-cheating');
})->name('learn.blog.exam-security-preventing-cheating');

Route::get('/learn/blog/creating-effective-online-exams', function () {
    return view('landing.learn.articles.creating-effective-online-exams');
})->name('learn.blog.creating-effective-online-exams');

Route::get('/learn/community', function () {
    return view('landing.learn.community');
})->name('learn.community');

// Legal pages
Route::get('/terms', function () {
    return view('legal.terms');
})->name('terms');

Route::get('/privacy', function () {
    return view('legal.privacy');
})->name('privacy');

Route::get('/saas', function () {
    return view('legal.saas');
})->name('saas');

/* ------------------------------------------------------------------ */
/* Registration routes (Admin & Lecturer)                             */
/* ------------------------------------------------------------------ */
// Role Selection - after normal Fortify registration
Route::get('/role-selection', [RoleSelectionController::class, 'show'])->name('role-selection')->middleware(['auth']);
Route::post('/role-selection', [RoleSelectionController::class, 'selectRole'])->name('role-selection.store')->middleware(['auth']);

// Onboarding routes
Route::get('/onboarding/admin', \App\Livewire\AdminOnboarding::class)->name('onboarding.admin')->middleware(['auth']);
Route::get('/onboarding/lecturer', \App\Livewire\LecturerOnboarding::class)->name('onboarding.lecturer')->middleware(['auth']);
Route::get('/pending-approval', \App\Livewire\LecturerPendingApproval::class)->name('lecturer.pending-approval')->middleware(['auth']);

/* ------------------------------------------------------------------ */
/* OTP Verification Routes (Public)                                   */
/* ------------------------------------------------------------------ */
// Custom forgot password routes (bypasses Fortify)
Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])->name('password.request');
Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])->name('password.email');

// OTP verification routes
Route::get('/register/verify-email', [\App\Http\Controllers\OtpController::class, 'showRegisterOtp'])->name('register.otp');
Route::post('/register/verify-otp', [\App\Http\Controllers\OtpController::class, 'verifyRegisterOtp'])->name('register.verify-otp');
Route::post('/register/resend-otp', [\App\Http\Controllers\OtpController::class, 'resendRegisterOtp'])->name('register.resend-otp');

Route::get('/password/reset-otp', [\App\Http\Controllers\OtpController::class, 'showResetPasswordOtp'])->name('password.otp');
Route::post('/password/verify-otp', [\App\Http\Controllers\OtpController::class, 'verifyResetPasswordOtp'])->name('password.verify-otp');
Route::post('/password/resend-otp', [\App\Http\Controllers\OtpController::class, 'resendResetPasswordOtp'])->name('password.resend-otp');

/* ------------------------------------------------------------------ */
/* Authenticated & verified routes                                    */
/* ------------------------------------------------------------------ */
Route::middleware(['auth', 'verified'])->group(function () {

    // Main dashboard - redirect based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'lecturer') {
            return redirect()->route('lecturer.dashboard');
        } elseif ($user->role === 'student') {
            return redirect()->route('products.students');
        }
        return redirect()->route('role-selection');
    })->name('dashboard');

    // Admin Dashboard
    Route::get('/admin/dashboard', \App\Livewire\AdminDashboard::class)
        ->name('admin.dashboard')
        ->middleware('admin');

    // Student Dashboard
    Route::get('/student/dashboard', \App\Livewire\StudentDashboard::class)
        ->name('student.dashboard')
        ->middleware('role:student');

    // Lecturer Dashboard
    Route::get('/lecturer/dashboard', \App\Livewire\LecturerDashboard::class)
        ->name('lecturer.dashboard')
        ->middleware('role:lecturer');

    // Student Routes
    Route::middleware(['role:student'])->group(function () {
        Route::get('/student/grades', \App\Livewire\StudentGrades::class)->name('student.grades');
        Route::get('/student/exams', \App\Livewire\StudentExams::class)->name('student.exams');
        Route::get('/student/practice-exams', \App\Livewire\PracticeExams::class)->name('student.practice.exams');
        Route::get('/student/attendance', \App\Livewire\StudentAttendance::class)->name('student.attendance');
        Route::get('/student/notes', \App\Livewire\StudentNotes::class)->name('student.notes');
        Route::get('/student/curriculum', \App\Livewire\StudentCurriculum::class)->name('student.curriculum');
    });

    // Shareable Exam Routes (accessible by student and lecturer preview)
    Route::get('/student/exams/{session}', \App\Livewire\StudentExamDelivery::class)->name('student.exam.delivery');
    Route::get('/student/exams/{session}/results', function (\App\Models\ExamSession $session) {
        return view('student.exam-results', ['session' => $session]);
    })->name('student.exams.results');

    // Lecturer Routes
    Route::middleware(['role:lecturer'])->group(function () {
        Route::get('/lecturer/exams/{exam}/grading', \App\Livewire\LecturerExamGrading::class)->name('lecturer.exam.grading');
        Route::get('/lecturer/courses', \App\Livewire\LecturerCourses::class)->name('lecturer.courses');
        Route::get('/lecturer/grading-hub', \App\Livewire\LecturerGradingHub::class)->name('lecturer.grading.hub');
        Route::get('/lecturer/attendance', \App\Livewire\LecturerAttendance::class)->name('lecturer.attendance');
        Route::get('/lecturer/attendance/history', \App\Livewire\LecturerAttendanceHistory::class)->name('lecturer.attendance.history');
        Route::get('/lecturer/attendance/reports', \App\Livewire\LecturerAttendanceReports::class)->name('lecturer.attendance.reports');
        Route::get('/lecturer/curriculum', \App\Livewire\LecturerCurriculum::class)->name('lecturer.curriculum');
        Route::get('/lecturer/notes', \App\Livewire\LecturerNotes::class)->name('lecturer.notes');
        Route::get('/lecturer/exams', \App\Livewire\LecturerExams::class)->name('lecturer.exams');
        Route::get('/lecturer/exams/{exam}/questions', \App\Livewire\LecturerExamQuestions::class)->name('lecturer.exam-questions');
        Route::get('/lecturer/course-reps', \App\Livewire\LecturerCourseReps::class)->name('lecturer.course-reps');
        Route::get('/lecturer/ai-questions', \App\Livewire\LecturerAIQuestionGenerator::class)->name('lecturer.ai-questions');
        Route::get('/lecturer/gradings/{session}', \App\Livewire\LecturerGradingDashboard::class)->name('lecturer.gradings.dashboard');
        Route::get('/lecturer/analytics/{exam}', \App\Livewire\AnalyticsDashboard::class)->name('lecturer.analytics.dashboard');
    });

    Route::get('lecturer-management', \App\Livewire\LecturerManagement::class)
        ->name('lecturer-management');

    Route::get('students-management', \App\Livewire\StudentsManagement::class)
        ->name('students-management');

    Route::get('classes-management', \App\Livewire\ClassesManagement::class)
        ->name('classes-management');

    Route::get('announcements', \App\Livewire\AdminAnnouncements::class)
        ->name('announcements');

    Route::get('notification-tester', \App\Livewire\NotificationTester::class)
        ->name('notification-tester');

    Route::get('test-email-preview', \App\Livewire\TestEmailPreview::class)
        ->name('test-email-preview')
        ->middleware('admin');

    Route::get('manage-class/{classId}', \App\Livewire\ManageClass::class)
        ->name('manage-class');

    Route::get('academic-calendar', \App\Livewire\AdminAcademicCalendar::class)
        ->name('academic-calendar')
        ->middleware('admin');

    Route::get('data-storage', \App\Livewire\AdminDataStorage::class)
        ->name('admin.data-storage')
        ->middleware('admin');

    Route::get('timetable', \App\Livewire\TimetableManagement::class)
        ->name('timetable');

    /* -------------------------------------------------------------- */
    /* NEW: Mock Data Generator (Livewire component)                 */
    /* -------------------------------------------------------------- */
    Route::get('mock-data-generator', \App\Livewire\MockDataGenerator::class)
        ->name('mock-data-generator');

    /* -------------------------------------------------------------- */
    /* Settings (Volt)                                                */
    /* -------------------------------------------------------------- */
    Route::redirect('settings', 'settings/profile');

    Volt::route('settings/profile', 'settings.profile')->name('profile.edit');
    Volt::route('settings/password', 'settings.password')->name('user-password.edit');
    Volt::route('settings/appearance', 'settings.appearance')->name('appearance.edit');
    Volt::route('settings/integrations', 'settings.integrations')->name('settings.integrations');

    Volt::route('settings/two-factor', 'settings.two-factor')
        ->middleware(
            when(
                Features::canManageTwoFactorAuthentication()
                    && Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword'),
                ['password.confirm'],
                [],
            ),
        )
        ->name('two-factor.show');

    /* Admin Settings */
    Volt::route('settings/school-configuration', 'settings.admin-school-configuration')
        ->middleware('admin')
        ->name('admin.school-configuration');

    Route::get('settings/subscription-billing', \App\Livewire\AdminSubscriptionBilling::class)
        ->middleware('admin')
        ->name('settings.subscription-billing');

    /* Payment Routes */
    Route::post('/payments/initiate/{subscription}', [\App\Http\Controllers\PaymentController::class, 'initiatePlanUpgrade'])
        ->name('payments.initiate');
    Route::post('/payments/verify', [\App\Http\Controllers\PaymentController::class, 'verifyPayment'])
        ->name('payments.verify');

    /* Invoice Routes */
    Route::get('/invoices/{invoice}/download', [\App\Http\Controllers\InvoiceController::class, 'download'])
        ->name('invoices.download');
    Route::get('/invoices/{invoice}/view', [\App\Http\Controllers\InvoiceController::class, 'view'])
        ->name('invoices.view');

    /* Exam Report Routes */
    Route::get('/exams/{exam}/print/paper', [\App\Http\Controllers\ExamReportController::class, 'downloadQuestionPaper'])
        ->name('exams.print.paper');
    Route::get('/exams/sessions/{session}/print/script', [\App\Http\Controllers\ExamReportController::class, 'downloadMarkedScript'])
        ->name('exams.sessions.print.script');
});

/* ------------------------------------------------------------------ */
/* Currency preference (public)                                        */
/* ------------------------------------------------------------------ */
Route::post('/currency', [LandingController::class, 'setCurrency'])->name('currency.set');



/* ------------------------------------------------------------------ */
/* Payment Webhooks (public)                                           */
/* ------------------------------------------------------------------ */
Route::post('/webhooks/paystack', [\App\Http\Controllers\PaymentController::class, 'webhook'])
    ->name('webhooks.paystack');

/* ================================================================ */
/* Secret Team/Company Management Dashboard Routes                 */
/* Access via: /work (not /team, it's secret!)                    */
/* ================================================================ */
require __DIR__ . '/work.php';
