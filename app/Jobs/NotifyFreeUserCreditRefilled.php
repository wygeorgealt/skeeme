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
        
        if (!$user) {
            Log::warning("Credit refill job: User not found", ['user_id' => $this->userId]);
            return;
        }

        if ($user->getStudentPlan() !== 'free') {
            Log::info("Credit refill job: User is not on free plan", ['user_id' => $user->id, 'plan' => $user->getStudentPlan()]);
            return;
        }

        $creditsBefore = $user->credits;

        // Trigger the refill logic to see if they are eligible now
        $user->checkAndRefillCredits();
        $user->refresh();

        Log::info("Credit refill check completed", [
            'user_id' => $user->id,
            'credits_before' => $creditsBefore,
            'credits_after' => $user->credits,
            'expo_token_exists' => !empty($user->expo_push_token),
            'notifications_enabled' => $user->notifications_enabled,
        ]);

        // If their credits just went from 0 to >0 during this job, it means the 14 days just finished
        // and we were the ones to refill it (they didn't trigger it manually by opening the app).
        if ($creditsBefore <= 0 && $user->credits > 0) {
            try {
                if (!$user->expo_push_token) {
                    Log::warning("Cannot send credit refill notification: No expo push token", ['user_id' => $user->id]);
                    return;
                }

                if (!$user->notifications_enabled) {
                    Log::warning("Cannot send credit refill notification: Notifications disabled", ['user_id' => $user->id]);
                    return;
                }

                $push = app(PushNotificationService::class);
                $push->send(
                    $user->expo_push_token,
                    'Credits Refilled! 🚀',
                    "Your 100 free credits have been refilled. Jump back in and continue studying!",
                    ['screen' => 'home']
                );
                
                Log::info("Free user credit refill push sent successfully", [
                    'user_id' => $user->id,
                    'credits_before' => $creditsBefore,
                    'credits_after' => $user->credits,
                ]);
            } catch (\Exception $e) {
                Log::error("Credit refill push failed", [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                    'trace' => substr($e->getTraceAsString(), 0, 500),
                ]);
                // Re-throw to let the queue retry if it's a transient error
                throw $e;
            }
        } else {
            Log::info("Credit refill: No notification needed", [
                'user_id' => $user->id,
                'credits_before' => $creditsBefore,
                'credits_after' => $user->credits,
                'reason' => $creditsBefore > 0 ? 'User had credits' : 'Refill did not occur',
            ]);
        }
    }
}
