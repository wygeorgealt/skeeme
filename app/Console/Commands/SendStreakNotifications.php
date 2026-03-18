<?php

namespace App\Console\Commands;

use App\Models\StudyStreak;
use App\Models\StreakNotificationLog;
use App\Models\User;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendStreakNotifications extends Command
{
    protected $signature = 'send:streak-notifications';
    protected $description = 'Send countdown and reminder notifications for streak milestones';

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

        // Get all users with active streaks
        $streaks = StudyStreak::where('current_streak', '>', 0)
            ->with('user:id,expo_push_token,notifications_enabled,timezone')
            ->get();

        $sent = 0;

        foreach ($streaks as $streak) {
            $user = User::find($streak->user_id);
            if (!$user || !$user->expo_push_token || !$user->notifications_enabled) {
                continue;
            }

            // Quiet hours check
            $tz = $user->timezone ?? 'UTC';
            $localHour = Carbon::now($tz)->hour;
            if ($localHour >= 23 || $localHour < 7) {
                continue;
            }

            $current = $streak->current_streak;

            foreach (self::MILESTONES as $milestone) {
                if ($current >= $milestone) {
                    continue; // Already past this milestone
                }

                $daysAway = $milestone - $current;
                $reward = self::REWARDS[$milestone];

                // M - 4 countdown
                if ($daysAway === 4) {
                    if (!StreakNotificationLog::alreadySent($user->id, $milestone, 'countdown_4')) {
                        $push->send(
                            $user->expo_push_token,
                            'Keep it going 🔥',
                            "You're {$current} days in. Just {$daysAway} more days to earn {$reward} free credits.",
                            ['screen' => 'streaks']
                        );
                        $this->logNotification($user->id, $milestone, 'countdown_4');
                        $sent++;
                    }
                }

                // M - 1 countdown
                if ($daysAway === 1) {
                    if (!StreakNotificationLog::alreadySent($user->id, $milestone, 'countdown_1')) {
                        $push->send(
                            $user->expo_push_token,
                            "One day away from {$reward} credits ⚡",
                            "Don't break the chain. Complete one quiz or flashcard today.",
                            ['screen' => 'streaks']
                        );
                        $this->logNotification($user->id, $milestone, 'countdown_1');
                        $sent++;
                    }
                }

                // Only track the nearest milestone
                break;
            }

            // Day-of notification (user is AT the milestone today but hasn't yet studied)
            foreach (self::MILESTONES as $milestone) {
                if ($current === $milestone - 1) {
                    // They need one more day to hit it — check if they studied today
                    $studiedToday = $streak->last_study_date && Carbon::parse($streak->last_study_date)->isToday();
                    if (!$studiedToday && !StreakNotificationLog::alreadySent($user->id, $milestone, 'day_of')) {
                        $reward = self::REWARDS[$milestone];
                        $push->send(
                            $user->expo_push_token,
                            "Today's the day 🎯",
                            "Hit your streak target today and earn {$reward} free credits instantly.",
                            ['screen' => 'streaks']
                        );
                        $this->logNotification($user->id, $milestone, 'day_of');
                        $sent++;
                    }
                    break;
                }
            }
        }

        $this->info("Sent {$sent} streak notifications.");
        Log::info("SendStreakNotifications: {$sent} notifications sent.");
    }

    private function logNotification(int $userId, int $milestone, string $type): void
    {
        StreakNotificationLog::create([
            'user_id' => $userId,
            'milestone_target' => $milestone,
            'notification_type' => $type,
            'sent_at' => now(),
            'delivered' => true,
        ]);
    }
}
