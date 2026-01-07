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

use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

Artisan::command('send-mail', function () {
    $email = (new MailtrapEmail())
        ->from(new Address('hello@skeeme.com', 'Mailtrap Test'))
        ->to(new Address('skemeer@gmail.com'))
        ->subject('You are awesome!')
        ->category('Integration Test')
        ->text('Congrats for sending test email with Mailtrap!');

    $response = MailtrapClient::initSendingEmails(
        apiKey: env('MAILTRAP_API_KEY')
    )->send($email);

    $this->info('Response Header: ' . json_encode(ResponseHelper::toArray($response)));
})->purpose('Send Mail Test');
