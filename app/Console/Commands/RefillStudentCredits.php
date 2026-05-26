<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RefillStudentCredits extends Command
{
    protected $signature = 'app:refill-student-credits';

    protected $description = 'Monthly credit refill for Pro (20,000) and Max (100,000) subscribers. Free users are excluded — they use the 5-hour on-demand refill instead.';

    public function handle()
    {
        $this->info('Starting monthly student credit refill...');

        $users = User::where('role', 'student')->get();

        $count = 0;

        foreach ($users as $user) {
            $plan = $user->getStudentPlan();

            // Free users: no monthly batch refill — they use the 5-hour Redis timer
            if ($plan === 'free') {
                continue;
            }

            $lastRefill = $user->last_credit_refill_at ?? $user->created_at;

            // Skip if less than 30 days since last monthly grant
            if ($lastRefill && \Carbon\Carbon::parse($lastRefill)->gt(now()->subDays(30))) {
                continue;
            }

            $refillAmount = match ($plan) {
                'pro'   => 20000,
                'max'   => 100000,
                default => 0,
            };

            if ($refillAmount === 0) {
                continue;
            }

            $desc = match ($plan) {
                'pro'   => 'Monthly Pro plan credit grant (20,000 credits)',
                'max'   => 'Monthly Max plan credit grant (100,000 credits)',
                default => '',
            };

            // Hard SET to the monthly allocation — does not stack with existing balance
// Safely credit the user – increment instead of overwriting existing balance
                try {
                    // Increment credits (adds to any existing balance)
                    $user->increment('credits', $refillAmount);
                    // Record the monthly refill transaction
                    Transaction::create([
                        'user_id' => $user->id,
                        'type' => 'credit_refill',
                        'amount' => $refillAmount,
                        'description' => $desc,
                        'metadata' => json_encode(['plan' => $plan, 'type' => 'monthly_grant']),
                    ]);
                    // Update the refill timestamp for the monthly cron
                    $user->update(['last_credit_refill_at' => now()]);
                } catch (\Exception $e) {
                    Log::error('Monthly credit refill failed for user', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                    continue; // skip to next user
                }
                // Clear the daily allowance Redis key so the new month starts clean
                Cache::forget("daily_allowance_date:{$user->id}");

            Transaction::create([
                'user_id'     => $user->id,
                'type'        => 'credit_refill',
                'amount'      => $refillAmount,
                'description' => $desc,
                'metadata'    => json_encode(['plan' => $plan, 'type' => 'monthly_grant']),
            ]);

            $count++;
        }

        $this->info("Monthly credit refill complete. Processed {$count} users.");
        Log::info('Monthly student credit refill completed.', ['users_refilled' => $count]);
    }
}
