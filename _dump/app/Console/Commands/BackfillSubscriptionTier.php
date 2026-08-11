<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class BackfillSubscriptionTier extends Command
{
    protected $signature = 'backfill:subscription-tier';
    protected $description = 'Backfill subscription_tier for existing users based on current data';

    public function handle()
    {
        $this->info('Starting backfill of subscription_tier...');
        User::whereNull('subscription_tier')->chunkById(100, function ($users) {
            foreach ($users as $user) {
                // Default to free
                $tier = 'free';
                // If the user has an active individual subscription, infer tier from plan_name
                if ($user->individualSubscription && $user->individualSubscription->status === 'active') {
                    $plan = strtolower($user->individualSubscription->plan_name);
                    if (strpos($plan, 'max') !== false || strpos($plan, 'elite') !== false) {
                        $tier = 'max';
                    } elseif (strpos($plan, 'pro') !== false || strpos($plan, 'standard') !== false) {
                        $tier = 'pro';
                    }
                }
                // Update the user
                $user->update(['subscription_tier' => $tier]);
                $this->line("User {$user->id} set to {$tier}");
            }
        });
        $this->info('Backfill completed.');
        return 0;
    }
}
