<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeamAuthController;

/* ================================================================ */
/* Secret Team/Company Management Login Routes                     */
/* Access only from: /work or similar secret path                  */
/* ================================================================ */

Route::prefix('work')->group(function () {
    
    /* ============================================================ */
    /* Public Auth Routes (no auth required)                        */
    /* ============================================================ */
    Route::middleware(['guest'])->group(function () {
        Route::get('/', [TeamAuthController::class, 'showLogin'])->name('team.login');
        Route::post('login', [TeamAuthController::class, 'login'])->name('team.login.post');
        Route::get('forgot-password', [TeamAuthController::class, 'showForgotPassword'])->name('team.forgot-password');
        Route::post('forgot-password', [TeamAuthController::class, 'sendResetLink'])->name('team.send-reset-link');
        Route::get('reset-password/{token}', [TeamAuthController::class, 'showResetPassword'])->name('team.reset-password');
        Route::post('reset-password', [TeamAuthController::class, 'resetPassword'])->name('team.reset-password.post');
    });

    /* ============================================================ */
    /* Protected Routes (auth required)                             */
    /* ============================================================ */
    Route::middleware(['auth', 'verified', 'ensure.team.member'])->group(function () {
        
        // Logout
        Route::post('logout', [TeamAuthController::class, 'logout'])->name('team.logout');

        // Import the team dashboard routes
        require __DIR__ . '/team.php';
    });
});
