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
     * @return StudyStreak
     */
    public function logActivity(int $userId): StudyStreak
    {
        try {
            $streak = StudyStreak::firstOrCreate(
                ['user_id' => $userId],
                ['current_streak' => 0, 'longest_streak' => 0]
            );

            $today = Carbon::today();
            $lastStudyDate = $streak->last_study_date ? Carbon::parse($streak->last_study_date)->startOfDay() : null;

            if (!$lastStudyDate) {
                // First time studying
                $streak->current_streak = 1;
                $streak->longest_streak = 1;
            } elseif ($lastStudyDate->isYesterday()) {
                // Studied yesterday, increment streak
                $streak->current_streak += 1;
                if ($streak->current_streak > $streak->longest_streak) {
                    $streak->longest_streak = $streak->current_streak;
                }
            } elseif ($lastStudyDate->isBefore(Carbon::yesterday())) {
                // Missed a day (or more), reset streak
                $streak->current_streak = 1;
            }
            // If they already studied today, do nothing to the counters

            // Always update the last study date to today
            $streak->last_study_date = $today->toDateString();
            $streak->save();

            return $streak;
        } catch (\Exception $e) {
            Log::error("Failed to update study streak for user $userId: " . $e->getMessage());
            // Return an empty/default object so the main flow isn't interrupted
            return new StudyStreak(['user_id' => $userId, 'current_streak' => 0]);
        }
    }
}
