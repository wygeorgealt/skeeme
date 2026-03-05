<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AnnouncementController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\CourseController;
use App\Http\Controllers\API\EnrollmentController;
use App\Http\Controllers\API\ExamController;
use App\Http\Controllers\API\ExamSessionController;
use App\Http\Controllers\API\AIQuestionController;
use App\Http\Controllers\API\AIGradingController;
use App\Http\Controllers\API\AnalyticsController;
use App\Http\Controllers\API\GradeController;
use App\Http\Controllers\API\IndividualSubscriptionController;
// use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\NoteController;
// use App\Http\Controllers\API\ParentTokenController;
use App\Http\Controllers\API\SchemeOfWorkController;
use App\Http\Controllers\API\SchoolController;
use App\Http\Controllers\API\SchoolClassController;
use App\Http\Controllers\API\SubscriptionController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\QuestionController;
// use App\Http\Controllers\API\QuestionPoolController;
use App\Http\Controllers\API\ExamQuestionController;
use App\Http\Controllers\API\QuestionBankController;
// use App\Http\Controllers\API\QuestionAnalyticsController;
use App\Http\Controllers\API\StudentLearningProgressController;
// use App\Http\Controllers\API\GradingTrendController;
use App\Http\Controllers\API\ClassComparisonDataController;
// use App\Http\Controllers\API\VectorStoreEntryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Public endpoints
    Route::post('/webhooks/zoom', [\App\Http\Controllers\Webhooks\ZoomWebhookController::class, 'handle']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResources([
            'announcements' => AnnouncementController::class,
            'attendances' => AttendanceController::class,
            'courses' => CourseController::class,
            'enrollments' => EnrollmentController::class,
            'exams' => ExamController::class,
            'grades' => GradeController::class,
            'individual-subscriptions' => IndividualSubscriptionController::class,
            // 'messages' => MessageController::class,
            'notes' => NoteController::class,
            // 'parent-tokens' => ParentTokenController::class,
            'schemes' => SchemeOfWorkController::class,
            'schools' => SchoolController::class,
            'classes' => SchoolClassController::class,
            'subscriptions' => SubscriptionController::class,
            'users' => UserController::class,
        ]);

        // Exam session management routes
        Route::prefix('exams/{exam}')->group(function () {
            Route::post('/sessions', [ExamSessionController::class, 'start'])->name('exams.sessions.start');
            Route::post('/sessions/{session}/begin', [ExamSessionController::class, 'begin'])->name('exams.sessions.begin');
            Route::get('/sessions/{session}', [ExamSessionController::class, 'show'])->name('exams.sessions.show');
            Route::post('/sessions/{session}/answers', [ExamSessionController::class, 'saveAnswer'])->name('exams.sessions.saveAnswer');
            Route::get('/sessions/{session}/answers', [ExamSessionController::class, 'getAnswers'])->name('exams.sessions.getAnswers');
            Route::post('/sessions/{session}/submit', [ExamSessionController::class, 'submit'])->name('exams.sessions.submit');
            Route::post('/sessions/{session}/abandon', [ExamSessionController::class, 'abandon'])->name('exams.sessions.abandon');
            Route::get('/sessions/{session}/results', [ExamSessionController::class, 'results'])->name('exams.sessions.results');
        });

        // AI Question Generation routes
        Route::prefix('questions')->group(function () {
            Route::post('/generate', [AIQuestionController::class, 'generate'])->name('questions.generate');
            Route::post('/{question}/review', [AIQuestionController::class, 'review'])->name('questions.review');
            Route::get('/pools/{pool}/drafts', [AIQuestionController::class, 'drafts'])->name('questions.drafts');
            Route::post('/pools/{pool}/publish-all', [AIQuestionController::class, 'publishAll'])->name('questions.publishAll');
            Route::post('/pools/{pool}/discard-drafts', [AIQuestionController::class, 'discardDrafts'])->name('questions.discardDrafts');
            Route::get('/pools/{pool}/statistics', [AIQuestionController::class, 'statistics'])->name('questions.statistics');
        });

        // AI Grading routes
        Route::prefix('gradings')->group(function () {
            Route::post('/grade-session/{session}', [AIGradingController::class, 'gradeSession'])->name('gradings.gradeSession');
            Route::get('/pending', [AIGradingController::class, 'pendingReview'])->name('gradings.pending');
            Route::post('/{grading}/approve', [AIGradingController::class, 'approve'])->name('gradings.approve');
            Route::post('/{grading}/override', [AIGradingController::class, 'override'])->name('gradings.override');
            Route::post('/{grading}/reject', [AIGradingController::class, 'reject'])->name('gradings.reject');
            Route::get('/{grading}', [AIGradingController::class, 'show'])->name('gradings.show');
            Route::get('/session/{session}/statistics', [AIGradingController::class, 'sessionStatistics'])->name('gradings.sessionStatistics');
            Route::post('/session/{session}/batch-approve', [AIGradingController::class, 'batchApprove'])->name('gradings.batchApprove');
            Route::get('/requires-attention', [AIGradingController::class, 'requiresAttention'])->name('gradings.requiresAttention');
            Route::get('/exam-summary', [AIGradingController::class, 'examSummary'])->name('gradings.examSummary');
        });

        // Analytics routes
        Route::prefix('analytics')->group(function () {
            Route::post('/exams/{exam}/snapshot', [AnalyticsController::class, 'generateSnapshot'])->name('analytics.snapshot');
            Route::get('/exams/{exam}/summary', [AnalyticsController::class, 'examSummary'])->name('analytics.examSummary');
            Route::get('/exams/{exam}/performance-trends', [AnalyticsController::class, 'performanceTrends'])->name('analytics.performanceTrends');
            Route::get('/exams/{exam}/question-analytics', [AnalyticsController::class, 'questionAnalytics'])->name('analytics.questionAnalytics');
            Route::get('/exams/{exam}/student-progress', [AnalyticsController::class, 'studentProgress'])->name('analytics.studentProgress');
            Route::get('/exams/{exam}/grading-trends', [AnalyticsController::class, 'gradingTrends'])->name('analytics.gradingTrends');
            Route::get('/exams/{exam}/class-comparison', [AnalyticsController::class, 'classComparison'])->name('analytics.classComparison');
            Route::get('/exams/{exam}/recommendations', [AnalyticsController::class, 'recommendations'])->name('analytics.recommendations');
            Route::get('/exams/{exam}/export', [AnalyticsController::class, 'exportReport'])->name('analytics.export');
        });
    });

    // Student Mobile App API
    Route::prefix('student')->group(function () {
        Route::post('login', [\App\Http\Controllers\API\Student\AuthController::class, 'login']);
        Route::post('register', [\App\Http\Controllers\API\Student\AuthController::class, 'register']);
        Route::post('oauth/{provider}', [\App\Http\Controllers\API\Student\AuthController::class, 'handleOAuthLogin']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [\App\Http\Controllers\API\Student\AuthController::class, 'logout']);
            Route::get('me', [\App\Http\Controllers\API\Student\AuthController::class, 'me']);
            
            // Practice Quizzes & Flashcards
            Route::post('quizzes/generate', [\App\Http\Controllers\API\Student\PracticeQuizController::class, 'generate']);
            Route::post('quizzes/grade-theory', [\App\Http\Controllers\API\Student\PracticeQuizController::class, 'gradeTheory']);
            
            Route::prefix('quizzes/history')->group(function () {
                Route::get('/', [\App\Http\Controllers\API\Student\QuizSessionController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\API\Student\QuizSessionController::class, 'store']);
                Route::get('{id}', [\App\Http\Controllers\API\Student\QuizSessionController::class, 'show']);
            });

            Route::prefix('flashcards')->group(function () {
                Route::get('decks', [\App\Http\Controllers\API\Student\FlashcardController::class, 'index']);
                Route::post('generate', [\App\Http\Controllers\API\Student\FlashcardController::class, 'generate']);
                Route::get('decks/{id}', [\App\Http\Controllers\API\Student\FlashcardController::class, 'show']);
                Route::delete('decks/{id}', [\App\Http\Controllers\API\Student\FlashcardController::class, 'destroy']);
            });

            Route::get('streaks/heatmap', [\App\Http\Controllers\API\Student\StreakController::class, 'heatmap']);
            
            // B2C / Independent Student Features
            Route::get('billing/history', [\App\Http\Controllers\API\Student\InvoiceController::class, 'index']);
            Route::get('billing/invoices/{invoice}/download', [\App\Http\Controllers\API\Student\InvoiceController::class, 'download']);
            
            Route::patch('profile', [\App\Http\Controllers\API\Student\ProfileController::class, 'update']);
            Route::post('profile/password', [\App\Http\Controllers\API\Student\ProfileController::class, 'updatePassword']);

            Route::post('preferences', [\App\Http\Controllers\API\Student\AuthController::class, 'updatePreferences']);

            // Scan & Solve (Camera AI)
            Route::post('scan/solve', [\App\Http\Controllers\API\Student\ScanController::class, 'solve']);
        });
    });

    // Team/Admin Mobile App API
    Route::prefix('team')->group(function () {
        Route::post('login', [\App\Http\Controllers\API\Team\AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [\App\Http\Controllers\API\Team\AuthController::class, 'logout']);
            Route::get('me', [\App\Http\Controllers\API\Team\AuthController::class, 'user']);
            
            Route::get('dashboard', [\App\Http\Controllers\API\Team\DashboardController::class, 'index']);
            Route::get('logs', [\App\Http\Controllers\API\Team\LogController::class, 'index']);
            Route::get('logs/errors', [\App\Http\Controllers\API\Team\LogController::class, 'errors']);
        });
    });

});
