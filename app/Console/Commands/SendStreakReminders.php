<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\StudyStreak;
use App\Models\QuizSession;
use App\Services\PushNotificationService;
use Carbon\Carbon;

class SendStreakReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-streak-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send push notifications to users to remind them to keep their study streaks alive.';

    public function handle(PushNotificationService $pushService)
    {
        $this->info('Finding users for streak reminders...');
        $today = Carbon::today();

        // Find users with active streaks who haven't completed a quiz today AND have an expo_push_token.
        $usersToRemind = User::whereNotNull('expo_push_token')
            ->whereHas('studyStreak', function ($query) use ($today) {
                // Must have a streak greater than 0 and the streak was last updated yesterday.
                $query->where('current_streak', '>', 0)
                      ->where('last_study_date', '=', $today->copy()->subDay()->toDateString());
            })
            ->whereDoesntHave('quizSessions', function ($query) use ($today) {
                // Ignore users who have already taken a quiz today.
                $query->whereDate('created_at', $today);
            })
            ->get();

        if ($usersToRemind->isEmpty()) {
            $this->info('No users currently require streak reminders.');
            return;
        }

        $sentCount = 0;
        foreach ($usersToRemind as $user) {
            $streakRecord = $user->studyStreak;
            $streak = $streakRecord->current_streak;
            $title = "Keep your {$streak}-day streak alive! 🔥";
            $body = "You haven't studied yet today. Complete a quick quiz to keep your Skeeme streak going!";

            $success = $pushService->send($user->expo_push_token, $title, $body);
            if ($success) {
                $sentCount++;
                $this->info("Reminder sent to user ID: {$user->id}");
            } else {
                $this->error("Failed to send reminder to user ID: {$user->id}");
            }
        }

        $this->info("Sent {$sentCount} streak reminder notifications.");
    }
}
