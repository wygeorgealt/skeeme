<?php

use App\Jobs\SubscriptionRenewalJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule subscription auto-renewal job to run daily at 2 AM
Schedule::job(new SubscriptionRenewalJob)
    ->dailyAt('02:00')
    ->description('Process auto-renewal for subscriptions expiring within 3 days');

// Alternative: Run every hour for more frequent checks
// Schedule::job(new SubscriptionRenewalJob)
//     ->hourly()
//     ->between('00:00', '23:59');
