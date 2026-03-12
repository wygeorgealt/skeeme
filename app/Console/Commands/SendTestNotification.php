<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\PushNotificationService;

class SendTestNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-push-test {email} {title?} {body?} {--data=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test push notification to a specific user';

    /**
     * Execute the console command.
     */
    public function handle(PushNotificationService $pushService)
    {
        $email = $this->argument('email');
        $title = $this->argument('title') ?? 'Skeeme App';
        $body = $this->argument('body') ?? 'This is a test notification from Skeeme! Keep your streak alive! 🔥';
        $dataOption = $this->option('data');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email $email not found.");
            return 1;
        }

        if (empty($user->expo_push_token)) {
            $this->error("User {$email} does not have an active expo_push_token. Please log into the mobile app on a physical device first.");
            return 1;
        }

        $decodedData = $dataOption ? json_decode($dataOption, true) : [];

        $this->info("Sending push notification to {$user->expo_push_token}...");

        $success = $pushService->send($user->expo_push_token, $title, $body, $decodedData);

        if ($success) {
            $this->info("✅ Notification sent successfully to $email!");
        } else {
            $this->error("❌ Failed to send notification. Check storage/logs/laravel.log for details.");
            return 1;
        }

        return 0;
    }
}
