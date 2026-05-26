<?php

namespace App\Console\Commands;

use App\Mail\MarketingMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendMarketingEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'send:marketing-email 
                            {email : The recipient email address}
                            {--school= : The school name}
                            {--contact= : The contact person name}
                            {--message= : Optional custom message to include}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a marketing email to a school or institution';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $schoolName = $this->option('school') ?? 'Your Institution';
        $contactName = $this->option('contact') ?? 'Administrator';
        $customMessage = $this->option('message');

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error("Invalid email address: {$email}");
            return self::FAILURE;
        }

        $this->info("Sending marketing email to: {$email}");
        $this->info("School: {$schoolName}");
        $this->info("Contact: {$contactName}");

        try {
            Mail::mailer(config('mail.default'))->to($email)->send(new MarketingMail(
                schoolName: $schoolName,
                contactName: $contactName,
                customMessage: $customMessage
            ));

            $this->info('✓ Marketing email sent successfully!');
            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Failed to send email: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
