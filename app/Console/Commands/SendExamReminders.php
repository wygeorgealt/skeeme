<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserExam;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendExamReminders extends Command
{
    protected $signature = 'app:send-exam-reminders';
    protected $description = 'Send study reminders to students based on their upcoming exam dates.';

    public function handle(PushNotificationService $pushService)
    {
        $this->info('Checking for upcoming exams...');
        
        $today = Carbon::today();
        
        // Find users who have an exam in the next 14 days
        $exams = UserExam::where('exam_date', '>=', $today)
            ->where('exam_date', '<=', $today->copy()->addDays(14))
            ->with('user')
            ->get();

        $sentCount = 0;

        foreach ($exams as $exam) {
            $user = $exam->user;
            
            if (!$user || !$user->expo_push_token || !$user->notifications_enabled) {
                continue;
            }

            // Check if user has studied today or yesterday
            $lastStudyDate = $user->studyStreak?->last_study_date;
            if ($lastStudyDate && Carbon::parse($lastStudyDate)->isAfter($today->copy()->subDays(2))) {
                // They studied recently, don't nag them unless it's very close
                $daysUntil = $today->diffInDays($exam->exam_date);
                if ($daysUntil > 3) {
                    continue;
                }
            }

            $daysUntil = (int) $today->diffInDays($exam->exam_date);
            $title = $daysUntil === 0 ? "It's Exam Day! 🎯" : "{$daysUntil} days until your {$exam->title} exam! 📚";
            $body = "Don't get caught off guard. Generate some flashcards or take a quick quiz to stay sharp!";

            if ($daysUntil === 0) {
                $body = "Good luck on your exam today! You've got this. Take one last quick review if you need to.";
            }

            $success = $pushService->send($user->expo_push_token, $title, $body, ['screen' => 'exams']);
            if ($success) {
                $sentCount++;
            }
        }

        $this->info("Sent {$sentCount} exam reminders.");
    }
}
