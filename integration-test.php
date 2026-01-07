<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\ZoomService;
use App\Models\User;
use App\Models\Course;
use App\Notifications\SlackTestNotification;
use App\Notifications\GradeReleasedNotification;
use Illuminate\Support\Facades\Notification;

echo "==============================================\n";
echo "   SKEEME INTEGRATION VERIFICATION SUITE      \n";
echo "==============================================\n\n";

// 1. Test Slack Basic Connectivity
echo "[1/3] Testing Slack Webhook... ";
try {
    Notification::route('slack', env('SLACK_WEBHOOK_URL'))
        ->notify(new SlackTestNotification());
    echo "SENT! (Check your Slack channel)\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

// 2. Test Zoom API Connectivity
echo "[2/3] Testing Zoom Meeting Creation... ";
try {
    $zoom = new ZoomService();
    $meeting = $zoom->createMeeting('Verification Test Class', now()->addHour()->toIso8601String());
    echo "SUCCESS!\n";
    echo "      Meeting ID: " . $meeting['id'] . "\n";
    echo "      Join URL: " . $meeting['join_url'] . "\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

// 3. Test Dual-Channel Grade Notification
echo "[3/3] Testing Dual-Channel Grade Release (Slack + Email)... ";
try {
    // We'll use a real user from the database to test the flow
    $testUser = User::where('role', 'student')->first();
    if (!$testUser) {
        $testUser = User::first(); // Fallback to any user
    }
    
    // Create a mock exam object
    $exam = (object)[
        'title' => 'Biology Mid-Term (Test)',
    ];

    $testUser->notify(new GradeReleasedNotification($exam, 85, 'A'));
    echo "SENT!\n";
    echo "      Target User: " . $testUser->email . "\n";
    echo "      Check Slack for result card and " . ($testUser->email ? "Email for result letter" : "no email recipient") . ".\n";
} catch (\Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

echo "\n==============================================\n";
echo "   VERIFICATION COMPLETE!                     \n";
echo "==============================================\n";
