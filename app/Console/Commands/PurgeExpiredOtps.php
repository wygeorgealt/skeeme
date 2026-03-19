<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EmailOtp;

class PurgeExpiredOtps extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'otp:purge';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Purge expired or exhausted email OTPs from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $deleted = EmailOtp::where('expires_at', '<', now())
            ->orWhere('attempts', '>=', 3)
            ->delete();
            
        $this->info("Purged {$deleted} expired/used OTPs.");
    }
}
