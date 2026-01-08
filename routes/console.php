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

Artisan::command('send-welcome {email} {name=User}', function ($email, $name) {
    \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\WelcomeMail($name));
    $this->info("Premium Welcome email sent to $email!");
})->purpose('Send Premium Welcome Email');

Artisan::command('send-test-emails {email}', function ($email) {
    $this->warn('Checking MAIL_FROM_ADDRESS setting...');
    if (str_contains(config('mail.from.address'), 'gmail.com')) {
        $this->error('ERROR: Your MAIL_FROM_ADDRESS is still a gmail.com account.');
        $this->error('Mailtrap Live Sending will REJECT this. Please update your .env to a verified domain email.');
        return;
    }

    $this->info("Sending premium test suite to $email...");

    // 1. Welcome Mail
    \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\WelcomeMail('George Solomon'));
    $this->line('✓ Welcome Email sent');

    // 2. OTP Mail
    \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\OtpMail('984231'));
    $this->line('✓ OTP Email sent');

    // 3. Invoice Email
    $invoice = \App\Models\Invoice::first();
    if ($invoice) {
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\InvoiceEmail($invoice, $email, 'Test Premium Invoice', false));
        $this->line('✓ Invoice Email sent');
    }

    // 4. Password Reset Mock
    $user = \App\Models\User::first();
    if ($user) {
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\PasswordResetEmail($user, 'https://skeeme.com/reset-password/test-token'));
        $this->line('✓ Password Reset Email sent');
        
        // 5. Password Changed Mock
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\PasswordChangedEmail($user));
        $this->line('✓ Password Changed Email sent');
    }

    // 6. Lecturer Approval Mock
    $lecturer = \App\Models\User::where('role', 'lecturer')->first() ?? \App\Models\User::first();
    $school = \App\Models\School::first();
    if ($lecturer && $school) {
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\LecturerApprovalNotificationEmail($lecturer, $school, 'Admin User', 'https://skeeme.com/login'));
        $this->line('✓ Lecturer Approval Email sent');
    }

    // 7. Announcement Mock
    $announcement = \App\Models\Announcement::first();
    if ($announcement) {
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\AnnouncementMail($announcement));
        $this->line('✓ Announcement Email sent');
    }

    // 8. Payment Confirmation Mock
    if ($invoice && $school) {
        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\PaymentConfirmationEmail(
            $invoice, 
            $school, 
            \App\Models\Subscription::getCurrencySymbol($invoice->currency ?? 'NGN') . number_format($invoice->amount, 2),
            now()->format('M d, Y'),
            $invoice->invoice_number
        ));
        $this->line('✓ Payment Confirmation Email sent');
    }

    $this->info('Done! Check your inbox or Mailtrap dashboard.');
})->purpose('Send a suite of premium emails for testing');
