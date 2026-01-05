<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Team;

/* ================================================================ */
/* Team/Company Management Dashboard Routes                        */
/* These are nested under /work in work.php                        */
/* ================================================================ */

/* ============================================================ */
/* Dashboard & Overview                                         */
/* ============================================================ */
Route::get('dashboard', [Team\DashboardController::class, 'index'])->name('team.dashboard');

/* ============================================================ */
/* Phase 1: User Management                                    */
/* ============================================================ */
Route::middleware(['check.team.permission:users.view'])->prefix('users')->group(function () {
    Route::get('/', [Team\UserManagementController::class, 'index'])->name('team.users.index');
    Route::get('{user}', [Team\UserManagementController::class, 'show'])->name('team.users.show');
    Route::post('{user}/ban', [Team\UserManagementController::class, 'ban'])->middleware('check.team.permission:users.ban')->name('team.users.ban');
    Route::post('{user}/unban', [Team\UserManagementController::class, 'unban'])->middleware('check.team.permission:users.ban')->name('team.users.unban');
    Route::post('{user}/flag', [Team\UserManagementController::class, 'flag'])->name('team.users.flag');
    Route::post('{user}/unflag', [Team\UserManagementController::class, 'unflag'])->name('team.users.unflag');
    Route::post('{user}/vip', [Team\UserManagementController::class, 'toggleVip'])->name('team.users.vip');
    Route::post('{user}/export', [Team\UserManagementController::class, 'export'])->middleware('check.team.permission:users.export')->name('team.users.export');
    Route::post('{user}/impersonate', [Team\UserManagementController::class, 'impersonate'])->middleware('check.team.permission:users.impersonate')->name('team.users.impersonate');
    Route::post('bulk/ban', [Team\UserManagementController::class, 'bulkBan'])->middleware('check.team.permission:users.ban')->name('team.users.bulk-ban');
});

/* ============================================================ */
/* Phase 1: Analytics & Metrics                                */
/* ============================================================ */
Route::middleware(['check.team.permission:system.logs'])->prefix('analytics')->group(function () {
    Route::get('/', [Team\AnalyticsController::class, 'index'])->name('team.analytics.index');
    Route::get('users', [Team\AnalyticsController::class, 'userGrowth'])->name('team.analytics.users');
    Route::get('revenue', [Team\AnalyticsController::class, 'revenue'])->name('team.analytics.revenue');
    Route::get('api-usage', [Team\AnalyticsController::class, 'apiUsage'])->name('team.analytics.api-usage');
    Route::get('export', [Team\AnalyticsController::class, 'export'])->name('team.analytics.export');
});

/* ============================================================ */
/* Phase 1: Error Tracking                                     */
/* ============================================================ */
Route::middleware(['check.team.permission:system.logs'])->prefix('errors')->group(function () {
    Route::get('/', [Team\ErrorTrackingController::class, 'index'])->name('team.errors.index');
    Route::get('{error}', [Team\ErrorTrackingController::class, 'show'])->name('team.errors.show');
    Route::post('{error}/resolve', [Team\ErrorTrackingController::class, 'resolve'])->name('team.errors.resolve');
    Route::post('{error}/assign', [Team\ErrorTrackingController::class, 'assign'])->name('team.errors.assign');
});

/* ============================================================ */
/* Phase 1: Subscription Management                            */
/* ============================================================ */
Route::middleware(['check.team.permission:subscriptions.view'])->prefix('subscriptions')->group(function () {
    Route::get('/', [Team\SubscriptionController::class, 'index'])->name('team.subscriptions.index');
    Route::get('{subscription}', [Team\SubscriptionController::class, 'show'])->name('team.subscriptions.show');
    Route::post('{subscription}/refund', [Team\SubscriptionController::class, 'refund'])->middleware('check.team.permission:subscriptions.refund')->name('team.subscriptions.refund');
    Route::post('{subscription}/cancel', [Team\SubscriptionController::class, 'cancel'])->middleware('check.team.permission:subscriptions.cancel')->name('team.subscriptions.cancel');
    Route::post('{subscription}/renew', [Team\SubscriptionController::class, 'renew'])->name('team.subscriptions.renew');
});

/* ============================================================ */
/* Phase 1: Payment Management                                 */
/* ============================================================ */
Route::middleware(['check.team.permission:payments.view'])->prefix('payments')->group(function () {
    Route::get('/', [Team\PaymentController::class, 'index'])->name('team.payments.index');
    Route::get('{payment}', [Team\PaymentController::class, 'show'])->name('team.payments.show');
    Route::post('{payment}/retry', [Team\PaymentController::class, 'retry'])->middleware('check.team.permission:payments.retry')->name('team.payments.retry');
    Route::post('{payment}/refund', [Team\PaymentController::class, 'refund'])->middleware('check.team.permission:payments.refund')->name('team.payments.refund');
});

/* ============================================================ */
/* Phase 2: Subscription Promotions                            */
/* ============================================================ */
Route::middleware(['check.team.permission:subscriptions.manage'])->prefix('promotions')->group(function () {
    Route::get('/', [Team\PromotionController::class, 'index'])->name('team.promotions.index');
    Route::get('stats', [Team\PromotionController::class, 'stats'])->name('team.promotions.stats');
    Route::get('create', [Team\PromotionController::class, 'create'])->name('team.promotions.create');
    Route::post('/', [Team\PromotionController::class, 'store'])->name('team.promotions.store');
    Route::get('{promotion}', [Team\PromotionController::class, 'show'])->name('team.promotions.show');
    Route::get('{promotion}/edit', [Team\PromotionController::class, 'edit'])->name('team.promotions.edit');
    Route::put('{promotion}', [Team\PromotionController::class, 'update'])->name('team.promotions.update');
    Route::post('{promotion}/pause', [Team\PromotionController::class, 'pause'])->name('team.promotions.pause');
    Route::post('{promotion}/resume', [Team\PromotionController::class, 'resume'])->name('team.promotions.resume');
    Route::delete('{promotion}', [Team\PromotionController::class, 'delete'])->name('team.promotions.delete');
});

/* Public promotion validation API - no auth required */
Route::post('promotions/validate', [Team\PromotionController::class, 'validatePromotion'])->name('promotions.validate');

/* ============================================================ */
/* Phase 2: Communication Tools                                */
/* ============================================================ */
Route::middleware(['check.team.permission:communications.send'])->prefix('communications')->group(function () {
    Route::get('/', [Team\CommunicationController::class, 'index'])->name('team.communications.index');
    
    // System Announcements
    Route::get('announcements', [Team\CommunicationController::class, 'announcements'])->name('team.communications.announcements');
    Route::get('announcements/create', [Team\CommunicationController::class, 'createAnnouncement'])->name('team.communications.create-announcement');
    Route::post('announcements', [Team\CommunicationController::class, 'storeAnnouncement'])->name('team.communications.store-announcement');
    Route::get('announcements/{announcement}/edit', [Team\CommunicationController::class, 'editAnnouncement'])->name('team.communications.edit-announcement');
    Route::put('announcements/{announcement}', [Team\CommunicationController::class, 'updateAnnouncement'])->name('team.communications.update-announcement');
    Route::post('announcements/{announcement}/publish', [Team\CommunicationController::class, 'publishAnnouncement'])->middleware('check.team.permission:communications.publish')->name('team.communications.publish-announcement');
    Route::delete('announcements/{announcement}', [Team\CommunicationController::class, 'deleteAnnouncement'])->middleware('check.team.permission:communications.delete')->name('team.communications.delete-announcement');
    
    // Email Campaigns
    Route::get('emails', [Team\CommunicationController::class, 'emailIndex'])->name('team.communications.emails.index');
    Route::get('emails/create', [Team\CommunicationController::class, 'createEmail'])->name('team.communications.emails.create');
    Route::post('emails', [Team\CommunicationController::class, 'storeEmail'])->name('team.communications.emails.store');
    Route::get('emails/{campaign}', [Team\CommunicationController::class, 'showEmail'])->name('team.communications.emails.show');
    Route::post('emails/{campaign}/send', [Team\CommunicationController::class, 'sendEmail'])->middleware('check.team.permission:communications.email')->name('team.communications.emails.send');
    
    // Toast Notifications (Admin Alerts)
    Route::get('toasts', [Team\CommunicationController::class, 'toastIndex'])->name('team.communications.toasts.index');
    Route::get('toasts/create', [Team\CommunicationController::class, 'createToast'])->name('team.communications.toasts.create');
    Route::post('toasts', [Team\CommunicationController::class, 'storeToast'])->name('team.communications.toasts.store');
    Route::post('toasts/{toast}/publish', [Team\CommunicationController::class, 'publishToast'])->middleware('check.team.permission:communications.publish')->name('team.communications.toasts.publish');
    Route::delete('toasts/{toast}', [Team\CommunicationController::class, 'deleteToast'])->middleware('check.team.permission:communications.delete')->name('team.communications.toasts.delete');
});

/* ============================================================ */
/* Phase 2: Support Tickets                                    */
/* ============================================================ */
Route::middleware(['check.team.permission:support.tickets'])->prefix('support')->group(function () {
    Route::get('/', [Team\SupportController::class, 'index'])->name('team.support.index');
    Route::get('{ticket}', [Team\SupportController::class, 'show'])->name('team.support.show');
    Route::post('{ticket}/reply', [Team\SupportController::class, 'reply'])->name('team.support.reply');
    Route::post('{ticket}/resolve', [Team\SupportController::class, 'resolve'])->middleware('check.team.permission:support.resolve')->name('team.support.resolve');
    Route::post('{ticket}/assign', [Team\SupportController::class, 'assign'])->middleware('check.team.permission:support.assign')->name('team.support.assign');
    Route::post('{ticket}/status', [Team\SupportController::class, 'updateStatus'])->middleware('check.team.permission:support.manage')->name('team.support.update-status');
});

/* ============================================================ */
/* Phase 2: System Monitoring                                  */
/* ============================================================ */
Route::middleware(['check.team.permission:system.logs'])->prefix('monitoring')->group(function () {
    Route::get('/', [Team\MonitoringController::class, 'index'])->name('team.monitoring.index');
    Route::get('health', [Team\MonitoringController::class, 'health'])->name('team.monitoring.health');
    Route::get('performance', [Team\MonitoringController::class, 'performance'])->name('team.monitoring.performance');
    Route::get('database', [Team\MonitoringController::class, 'database'])->name('team.monitoring.database');
    Route::get('backups', [Team\MonitoringController::class, 'backups'])->name('team.monitoring.backups');
    Route::post('record-metric', [Team\MonitoringController::class, 'recordMetric'])->withoutMiddleware(['check.team.permission:system.logs'])->name('team.monitoring.record-metric');
    Route::post('record-health-check', [Team\MonitoringController::class, 'recordHealthCheck'])->withoutMiddleware(['check.team.permission:system.logs'])->name('team.monitoring.record-health-check');
});

/* ============================================================ */
/* Phase 3: AI Features                                        */
/* ============================================================ */
Route::middleware(['check.team.permission:ai.stats'])->prefix('ai')->group(function () {
    Route::get('/', [Team\AIController::class, 'index'])->name('team.ai.index');
    Route::get('comparison', [Team\AIController::class, 'comparison'])->name('team.ai.comparison');
    Route::get('costs', [Team\AIController::class, 'costs'])->middleware('check.team.permission:ai.costs')->name('team.ai.costs');
    Route::get('prompts', [Team\AIController::class, 'prompts'])->name('team.ai.prompts');
    Route::get('prompts/create', [Team\AIController::class, 'createPrompt'])->middleware('check.team.permission:ai.manage')->name('team.ai.create-prompt');
    Route::post('prompts', [Team\AIController::class, 'storePrompt'])->middleware('check.team.permission:ai.manage')->name('team.ai.store-prompt');
    Route::get('prompts/{prompt}/edit', [Team\AIController::class, 'editPrompt'])->middleware('check.team.permission:ai.manage')->name('team.ai.edit-prompt');
    Route::put('prompts/{prompt}', [Team\AIController::class, 'updatePrompt'])->middleware('check.team.permission:ai.manage')->name('team.ai.update-prompt');
    Route::delete('prompts/{prompt}', [Team\AIController::class, 'deletePrompt'])->middleware('check.team.permission:ai.manage')->name('team.ai.delete-prompt');
    Route::post('log-usage', [Team\AIController::class, 'logUsage'])->withoutMiddleware(['check.team.permission:ai.stats'])->name('team.ai.log-usage');
});

/* ============================================================ */
/* Phase 4: Financial Management                              */
/* ============================================================ */
Route::middleware(['check.team.permission:financial.view'])->prefix('financial')->group(function () {
    Route::get('/', [Team\Financial\FinancialController::class, 'dashboard'])->name('team.financial.dashboard');
    Route::post('refunds', [Team\Financial\RefundController::class, 'process'])->middleware('check.team.permission:financial.refund')->name('team.refunds.process');
    Route::get('invoices', [Team\Financial\InvoiceController::class, 'index'])->name('team.invoices.index');
    Route::get('discounts', [Team\Financial\DiscountController::class, 'index'])->name('team.discounts.index');
    Route::post('discounts', [Team\Financial\DiscountController::class, 'store'])->middleware('check.team.permission:financial.manage')->name('team.discounts.store');
    Route::get('reports', [Team\Financial\ReportController::class, 'export'])->name('team.reports.export');
});

/* ============================================================ */
/* Phase 4: Support & Tickets                                 */
/* ============================================================ */
Route::middleware(['check.team.permission:support.tickets'])->prefix('support')->group(function () {
    Route::get('tickets', [Team\Support\TicketController::class, 'index'])->name('team.support.tickets.index');
    Route::post('tickets/{ticket}/respond', [Team\Support\TicketController::class, 'respond'])->name('team.support.tickets.respond');
    Route::post('tickets/{ticket}/resolve', [Team\Support\TicketController::class, 'resolve'])->name('team.support.tickets.resolve');
});

/* ============================================================ */
/* Phase 4: Communications                                    */
/* ============================================================ */
Route::middleware(['check.team.permission:communications.send'])->prefix('emails')->group(function () {
    Route::get('campaigns', [Team\Communications\EmailController::class, 'index'])->name('team.emails.campaigns.index');
    Route::post('send', [Team\Communications\EmailController::class, 'send'])->middleware('check.team.permission:communications.email')->name('team.emails.send');
});

Route::middleware(['check.team.permission:communications.send'])->prefix('announcements')->group(function () {
    Route::get('create', [Team\Communications\AnnouncementController::class, 'create'])->name('team.announcements.create');
    Route::post('/', [Team\Communications\AnnouncementController::class, 'store'])->name('team.announcements.store');
});

/* ============================================================ */
/* Phase 4: Advanced Analytics                                */
/* ============================================================ */
Route::middleware(['check.team.permission:system.logs'])->prefix('analytics')->group(function () {
    Route::get('dashboard', [Team\Analytics\DashboardController::class, 'index'])->name('team.analytics.dashboard');
    Route::get('users', [Team\Analytics\UserAnalyticsController::class, 'index'])->name('team.analytics.users');
    Route::get('export', [Team\Analytics\ExportController::class, 'index'])->name('team.analytics.export');
});

/* ============================================================ */
/* Phase 4: System Settings & Configuration                   */
/* ============================================================ */
Route::middleware(['check.team.permission:system.settings'])->prefix('settings')->group(function () {
    Route::get('system', [Team\Settings\SystemController::class, 'index'])->name('team.settings.system');
    Route::post('system', [Team\Settings\SystemController::class, 'update'])->name('team.settings.system.update');
    Route::get('features', [Team\Settings\FeatureController::class, 'index'])->name('team.settings.features');
    Route::post('features/{feature}/toggle', [Team\Settings\FeatureController::class, 'toggle'])->name('team.settings.features.toggle');
});

Route::middleware(['check.team.permission:system.logs'])->prefix('monitoring')->group(function () {
    Route::get('errors', [Team\Monitoring\ErrorController::class, 'index'])->name('team.monitoring.errors');
    Route::get('api', [Team\Monitoring\ApiController::class, 'index'])->name('team.monitoring.api');
});

/* ============================================================ */
/* Phase 4: Content Management                                */
/* ============================================================ */
Route::middleware(['check.team.permission:content.manage'])->prefix('content')->group(function () {
    Route::get('pages', [Team\Content\PageController::class, 'index'])->name('team.content.pages');
    Route::get('pages/create', [Team\Content\PageController::class, 'create'])->name('team.content.pages.create');
    Route::get('pages/{page}/edit', [Team\Content\PageController::class, 'edit'])->name('team.content.pages.edit');
    Route::post('pages', [Team\Content\PageController::class, 'store'])->name('team.content.pages.store');
    Route::patch('pages/{page}', [Team\Content\PageController::class, 'update'])->name('team.content.pages.update');
    Route::delete('pages/{page}', [Team\Content\PageController::class, 'destroy'])->name('team.content.pages.destroy');
    Route::get('changelog', [Team\Content\ChangelogController::class, 'index'])->name('team.content.changelog');
    Route::post('changelog', [Team\Content\ChangelogController::class, 'store'])->name('team.content.changelog.store');
    Route::get('media', [Team\Content\MediaController::class, 'index'])->name('team.content.media');
    Route::post('media/upload', [Team\Content\MediaController::class, 'upload'])->name('team.content.media.upload');
    Route::post('media/delete', [Team\Content\MediaController::class, 'delete'])->name('team.content.media.delete');
});

