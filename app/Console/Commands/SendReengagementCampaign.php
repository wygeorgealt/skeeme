<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendReengagementCampaign extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-reengagement-campaign';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send push notifications to students who have been inactive for exactly 7, 14, or 30 days.';

    /**
     * Execute the console command.
     */
    public function handle(PushNotificationService $pushService): int
    {
        $this->info('Starting Reengagement Campaign...');
        $today = Carbon::today();

        // Find targets: users with expo push tokens who haven't studied recently
        // We look for exactly 7, 14, or 30 days ago to send one tailored notification per milestone.

        $daysToTarget = [7, 14, 30];
        $totalSent = 0;

        foreach ($daysToTarget as $daysOffline) {
            $targetDate = $today->copy()->subDays($daysOffline)->toDateString();

            $users = User::whereNotNull('expo_push_token')
                ->whereHas('studyStreak', function ($query) use ($targetDate) {
                    $query->whereDate('last_study_date', '=', $targetDate);
                })
                ->get();

            if ($users->isEmpty()) {
                continue;
            }

            foreach ($users as $user) {
                // Determine message based on milestone
                if ($daysOffline === 7) {
                    $title = "We miss you, {$user->first_name}! 😢";
                    $body = "It's been a week! Jump back into Skeeme and keep your brain sharp with a quick 5-minute quiz.";
                } elseif ($daysOffline === 14) {
                    $title = "Don't let your progress slip! 📉";
                    $body = "Two weeks away! Come back and try scanning a tricky question to let AI solve it for you.";
                } else { // 30 days
                    $title = "Are you still there? 👀";
                    $body = "It's been a month since your last study session. We have new AI features waiting for you!";
                }

                $success = $pushService->send($user->expo_push_token, $title, $body);

                if ($success) {
                    $totalSent++;
                    Log::info("Reengagement push sent", ['user_id' => $user->id, 'days_offline' => $daysOffline]);
                }
            }
        }

        $this->info("Campaign finished. Total notifications sent: {$totalSent}");
        return self::SUCCESS;
    }
}
