<?php

namespace App\Services;

use App\Models\StudyStreak;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StreakService
{
    /**
     * Log study activity for a user and update their streak.
     * Call this whenever a user finishes a quiz or generates flashcards.
     *
     * @param int $userId
     * @return array
     */
    public function logActivity(int $userId): array
    {
        try {
            $streak = StudyStreak::firstOrCreate(
                ['user_id' => $userId],
                ['current_streak' => 0, 'longest_streak' => 0]
            );

            $today = Carbon::today();
            $lastStudyDate = $streak->last_study_date ? Carbon::parse($streak->last_study_date)->startOfDay() : null;

            $streakIncremented = false;

            if (!$lastStudyDate) {
                // First time studying
                $streak->current_streak = 1;
                $streak->longest_streak = 1;
                $streakIncremented = true;
            } elseif ($lastStudyDate->isYesterday()) {
                // Studied yesterday, increment streak
                $streak->current_streak += 1;
                if ($streak->current_streak > $streak->longest_streak) {
                    $streak->longest_streak = $streak->current_streak;
                }
                $streakIncremented = true;
            } elseif ($lastStudyDate->isBefore(Carbon::yesterday())) {
                // Missed a day (or more), reset streak
                $streak->current_streak = 1;
                $streakIncremented = true;
            }
            // If they already studied today, do nothing to the counters

            // Always update the last study date to today
            $streak->last_study_date = $today->toDateString();
            $streak->save();

            // Reward Logic: Check for milestones only if the streak was incremented today
            $reward = null;
            if ($streakIncremented) {
                $reward = $this->checkForRewards($streak);
            }

            return [
                'streak' => $streak,
                'reward' => $reward
            ];
        } catch (\Exception $e) {
            Log::error("Failed to update study streak for user $userId: " . $e->getMessage());
            return [
                'streak' => new StudyStreak(['user_id' => $userId, 'current_streak' => 0]),
                'reward' => null
            ];
        }
    }

    /**
     * Check if a user has reached a streak milestone and award credits.
     * @return array|null
     */
    protected function checkForRewards(StudyStreak $streak): ?array
    {
        $milestone = $streak->current_streak;
        $credits = match ($milestone) {
            7 => 50,
            14 => 100,
            30 => 200,
            60 => 500,
            default => 0,
        };

        if ($credits > 0) {
            $rewardEarned = \Illuminate\Support\Facades\DB::transaction(function () use ($streak, $credits, $milestone) {
                $user = \App\Models\User::lockForUpdate()->find($streak->user_id);
                
                if (!$user || $user->is_unlimited_student) {
                    return false;
                }

                // Instead of granting credits, set it as unclaimed
                $streak->unclaimed_reward = $credits;
                $streak->save();

                Log::info("Streak reward pending", [
                    'user_id' => $user->id,
                    'milestone' => $milestone,
                    'reward' => $credits
                ]);

                // Send Push Notification
                try {
                    $pushService = app(\App\Services\PushNotificationService::class);
                    $pushService->sendToUser(
                        $user->id,
                        "Claim Your Reward! \u{1F389}",
                        "You studied for $milestone days straight! Tap here to claim your $credits credits.",
                        ['screen' => 'streak']
                    );
                } catch (\Exception $e) {
                    Log::warning("Failed to send streak reward notification for user {$user->id}: " . $e->getMessage());
                }

                return true;
            });

            if ($rewardEarned) {
                return [
                    'earned' => true,
                    'credits' => $credits,
                    'milestone' => $milestone,
                    'message' => "Incredible! You studied for $milestone days straight and earned a reward."
                ];
            }
        }

        return null;
    }
}
