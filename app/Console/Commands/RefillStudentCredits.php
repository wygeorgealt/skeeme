<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefillStudentCredits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:refill-student-credits';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refill student credits weekly based on their subscription plan';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting student credit refill process...');

        // Get all students
        $users = clone User::where('role', 'student')->get();

        $count = 0;
        foreach ($users as $user) {
            $subscription = $user->activeSubscription;
            $plan = $subscription ? strtolower($subscription->plan_name) : 'free';
            $refillAmount = 0;
            $desc = '';

            if ($plan === 'free') {
                // Free tier gets 100 credits every 30 days. Don't refill if they just signed up (they get 100 bonus)
                $lastRefill = $user->last_credit_refill_at;
                if (!$lastRefill) {
                    if ($user->created_at > now()->subDays(30)) {
                        continue; // Still within their first 30 days of the free 100
                    }
                } else {
                    if (\Carbon\Carbon::parse($lastRefill) > now()->subDays(30)) {
                        continue;
                    }
                }
                $refillAmount = 100;
                $desc = "Monthly Free plan credit refill";
            } else {
                // Subscribed gets weekly 1500/5000 refills
                $lastRefill = $user->last_credit_refill_at;
                if ($lastRefill && \Carbon\Carbon::parse($lastRefill) > now()->subDays(7)) {
                    continue; 
                }

                if (str_contains($plan, 'elite')) {
                    $refillAmount = 5000;
                } elseif (str_contains($plan, 'standard')) {
                    $refillAmount = 1500;
                }
                $desc = "Weekly " . ucfirst($plan) . " plan credit refill";
            }

            if ($refillAmount > 0) {
                $user->increment('credits', $refillAmount);
                $user->update(['last_credit_refill_at' => now()]);

                // Log Transaction
                Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'credit_refill',
                    'amount' => $refillAmount,
                    'description' => $desc,
                    'metadata' => json_encode(['plan' => $plan])
                ]);

                $count++;
            }
        }

        $this->info("Refilled credits for {$count} users.");
        Log::info("Student credit refill completed.", ['processed_users' => $count]);
    }
}
