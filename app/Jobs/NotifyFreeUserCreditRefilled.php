<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyFreeUserCreditRefilled implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::find($this->userId);
        
        if (!$user || $user->getStudentPlan() !== 'free' || !$user->expo_push_token || !$user->notifications_enabled) {
            return;
        }

        $creditsBefore = $user->credits;

        // Trigger the refill logic to see if they are eligible now
        $user->checkAndRefillCredits();

        $user->refresh();

        // If their credits just went from 0 to >0 during this job, it means the 5 hours just finished
        // and we were the ones to refill it (they didn't trigger it manually by opening the app).
        if ($creditsBefore <= 0 && $user->credits > 0) {
            try {
                $push = app(PushNotificationService::class);
                $push->send(
                    $user->expo_push_token,
                    'Credits Refilled! 🚀',
                    "Your 100 free credits have been refilled. Jump back in and continue studying!",
                    ['screen' => 'home']
                );
                
                Log::info("Free user credit refill push sent", ['user_id' => $user->id]);
            } catch (\Exception $e) {
                Log::error("Credit refill push failed: " . $e->getMessage());
            }
        }
    }
}
