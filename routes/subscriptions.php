<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;

Route::middleware(['auth'])->group(function () {
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscriptions.subscribe');
    Route::get('/schools/{school}/subscription', [SubscriptionController::class, 'show'])->name('schools.subscription.show');
    Route::post('/schools/{school}/subscription/change-plan', [SubscriptionController::class, 'changePlan'])->name('schools.subscription.change-plan');
    Route::post('/schools/{school}/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('schools.subscription.cancel');
    Route::post('/schools/{school}/subscription/renew', [SubscriptionController::class, 'renew'])->name('schools.subscription.renew');
});

// Payment webhooks (public route)
Route::post('/subscriptions/webhook', [SubscriptionController::class, 'paymentCallback'])->name('subscriptions.webhook');
