<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Send exam reminder notification
     */
    public function sendExamReminder(User $student, object $exam, int $hoursUntil): Notification
    {
        return $this->createNotification(
            $student,
            Notification::TYPE_EXAM_REMINDER,
            "Exam Reminder: {$exam->title}",
            "Your exam {$exam->title} starts in {$hoursUntil} hours",
            ['exam_id' => $exam->id, 'hours_until' => $hoursUntil]
        );
    }

    /**
     * Send exam started notification
     */
    public function sendExamStarted(User $student, object $exam): Notification
    {
        return $this->createNotification(
            $student,
            Notification::TYPE_EXAM_STARTED,
            'Exam Started',
            "Your exam {$exam->title} has started",
            ['exam_id' => $exam->id]
        );
    }

    /**
     * Send exam submitted notification
     */
    public function sendExamSubmitted(User $student, object $exam): Notification
    {
        return $this->createNotification(
            $student,
            Notification::TYPE_EXAM_SUBMITTED,
            'Exam Submitted',
            "Your exam {$exam->title} has been submitted successfully",
            ['exam_id' => $exam->id]
        );
    }

    /**
     * Send grading complete notification to lecturer
     */
    public function sendGradingComplete(User $lecturer, object $exam): Notification
    {
        return $this->createNotification(
            $lecturer,
            Notification::TYPE_GRADING_COMPLETE,
            'Grading Completed',
            "Grading for exam {$exam->title} has been completed",
            ['exam_id' => $exam->id]
        );
    }

    /**
     * Send grade released notification to student
     */
    public function sendGradeReleased(User $student, object $exam, float $score, string $grade): Notification
    {
        return $this->createNotification(
            $student,
            Notification::TYPE_GRADE_RELEASED,
            'Grade Released',
            "Your grade for {$exam->title} is {$grade} ({$score}/100)",
            ['exam_id' => $exam->id, 'score' => $score, 'grade' => $grade]
        );
    }

    /**
     * Send appeal submitted notification to lecturer
     */
    public function sendAppealSubmitted(User $lecturer, object $appeal, User $student): Notification
    {
        return $this->createNotification(
            $lecturer,
            Notification::TYPE_APPEAL_SUBMITTED,
            'Grade Appeal Submitted',
            "{$student->full_name} has submitted a grade appeal for their exam",
            ['appeal_id' => $appeal->id, 'student_id' => $student->id]
        );
    }

    /**
     * Send appeal decision notification to student
     */
    public function sendAppealDecision(User $student, object $appeal, bool $approved, ?float $revisedScore = null): Notification
    {
        $title = $approved ? 'Grade Appeal Approved' : 'Grade Appeal Rejected';
        $message = $approved
            ? 'Your grade appeal has been approved'
            : 'Your grade appeal has been rejected';

        if ($approved && $revisedScore !== null) {
            $message .= " - Your new score is {$revisedScore}";
        }

        return $this->createNotification(
            $student,
            Notification::TYPE_APPEAL_DECIDED,
            $title,
            $message,
            [
                'appeal_id' => $appeal->id,
                'approved' => $approved,
                'revised_score' => $revisedScore,
            ]
        );
    }

    /**
     * Send feedback available notification to student
     */
    public function sendFeedbackAvailable(User $student, object $exam): Notification
    {
        return $this->createNotification(
            $student,
            Notification::TYPE_FEEDBACK_AVAILABLE,
            'Feedback Available',
            "Feedback for your exam {$exam->title} is now available",
            ['exam_id' => $exam->id]
        );
    }

    /**
     * Send system message notification
     */
    public function sendSystemMessage(User $user, string $title, string $message, array $data = []): Notification
    {
        return $this->createNotification(
            $user,
            Notification::TYPE_SYSTEM_MESSAGE,
            $title,
            $message,
            $data
        );
    }

    /**
     * Create a notification
     */
    public function createNotification(
        User $user,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?string $relatedModelType = null,
        ?int $relatedModelId = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'related_model_type' => $relatedModelType,
            'related_model_id' => $relatedModelId,
        ]);
    }

    /**
     * Get unread notifications for user
     */
    public function getUnreadNotifications(User $user, int $limit = 10)
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get all notifications for user with pagination
     */
    public function getNotifications(User $user, int $perPage = 20)
    {
        return Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Mark all notifications as read for user
     */
    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Get notification count for user
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    public function deleteOldNotifications(int $daysOld = 30): int
    {
        return Notification::where('created_at', '<', now()->subDays($daysOld))
            ->delete();
    }
}
