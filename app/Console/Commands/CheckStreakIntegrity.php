<?php

namespace App\Console\Commands;

use App\Models\StudyStreak;
use App\Models\StreakFreeze;
use App\Models\StreakNotificationLog;
use App\Models\User;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckStreakIntegrity extends Command
{
    protected $signature = 'check:streak-integrity';
    protected $description = 'Nightly job: consume streak freezes for Elite users or reset streaks for missed days';

    private const MILESTONES = [7, 14, 30, 60];
    private const REWARDS = [
        7 => 50,
        14 => 100,
        30 => 200,
        60 => 500,
    ];

    public function handle(): void
    {
        $push = app(PushNotificationService::class);
        $yesterday = Carbon::yesterday()->toDateString();
        $today = Carbon::today()->toDateString();

        // Get all streaks where user did NOT study yesterday (and streak > 0)
        $streaks = StudyStreak::where('current_streak', '>', 0)
            ->where(function ($q) use ($yesterday) {
                $q->where('last_study_date', '<', $yesterday)
                  ->orWhereNull('last_study_date');
            })
            ->get();

        $frozen = 0;
        $reset = 0;

        foreach ($streaks as $streak) {
            $user = User::find($streak->user_id);
            if (!$user) continue;

            $plan = $user->getStudentPlan();

            if ($plan === 'elite') {
                // Check for available streak freezes
                $freezeRecord = StreakFreeze::currentMonth($user->id);

                if ($freezeRecord->consumeFreeze()) {
                    // Streak saved!
                    $frozen++;
                    $remaining = $freezeRecord->freezes_allocated - $freezeRecord->freezes_used;

                    Log::info("Streak freeze consumed", [
                        'user_id' => $user->id,
                        'streak' => $streak->current_streak,
                        'freezes_remaining' => $remaining,
                    ]);

                    if ($user->expo_push_token && $user->notifications_enabled) {
                        $push->send(
                            $user->expo_push_token,
                            'Streak saved by Freeze ❄️',
                            "You missed yesterday but your {$streak->current_streak}-day streak is protected. {$remaining} freeze(s) remaining this month.",
                            ['screen' => 'streaks']
                        );
                    }

                    continue; // Do NOT reset streak
                }
            }

            // Reset streak
            $oldStreak = $streak->current_streak;
            $streak->current_streak = 0;
            $streak->save();
            $reset++;

            Log::info("Streak reset", ['user_id' => $user->id, 'previous_streak' => $oldStreak]);

            if ($user->expo_push_token && $user->notifications_enabled) {
                if ($plan !== 'elite') {
                    // Upsell for non-Elite users
                    $push->send(
                        $user->expo_push_token,
                        "Your {$oldStreak}-day streak reset 😢",
                        "You missed a day and your streak has reset to zero. Start a new streak today and keep the momentum going!",
                        ['screen' => 'streaks']
                    );
                } else {
                    // Elite but out of freezes
                    $push->send(
                        $user->expo_push_token,
                        "Your {$oldStreak}-day streak just reset",
                        "You've used all your Streak Freezes this month. Your freezes will reset on the 1st.",
                        ['screen' => 'streaks']
                    );
                }
            }
        }

        $this->info("Streak Integrity: {$frozen} frozen, {$reset} reset.");
        Log::info("CheckStreakIntegrity: {$frozen} frozen, {$reset} reset.");
    }
}
