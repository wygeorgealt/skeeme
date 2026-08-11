<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckLowCredits implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public function handle(): void
    {
        $user = User::find($this->userId);
        if (!$user || !$user->expo_push_token || !$user->notifications_enabled) {
            return;
        }

        $plan = $user->getStudentPlan();
        $credits = (int) $user->credits;

        // Thresholds per plan
        $threshold = match ($plan) {
            'standard' => 1000,
            'elite' => 2000,
            default => 100,  // free tier
        };

        // Only notify if below threshold
        if ($credits >= $threshold) {
            return;
        }

        // Cooldown: max once per cycle (weekly for subscribers, monthly for free)
        if ($user->last_credit_alert_at) {
            $cooldownDays = in_array($plan, ['standard', 'elite']) ? 7 : 30;
            if ($user->last_credit_alert_at->diffInDays(now()) < $cooldownDays) {
                return;
            }
        }

        // Quiet hours: 11pm - 7am (user timezone or UTC)
        $tz = $user->timezone ?? 'UTC';
        $localHour = Carbon::now($tz)->hour;
        if ($localHour >= 23 || $localHour < 7) {
            return;
        }

        // Estimate remaining sessions
        $remainingSessions = (int) floor($credits / 15); // average quiz cost

        try {
            $push = app(PushNotificationService::class);
            $push->send(
                $user->expo_push_token,
                'Running low on credits',
                "You have {$credits} credits left — enough for about {$remainingSessions} more study sessions. Top up before your next exam.",
                ['screen' => 'upgrade']
            );

            $user->update(['last_credit_alert_at' => now()]);

            Log::info("Low credit alert sent", ['user_id' => $user->id, 'credits' => $credits]);
        } catch (\Exception $e) {
            Log::error("Low credit push failed: " . $e->getMessage());
        }
    }
}
