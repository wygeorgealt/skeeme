<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Notification;
use App\Models\Exam;
use App\Models\GradeAppeal;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use DatabaseTransactions;

    protected NotificationService $notificationService;
    protected User $user;
    protected User $student;
    protected User $lecturer;
    protected Exam $exam;

    protected function setUp(): void
    {
        parent::setUp();

        $this->notificationService = app(NotificationService::class);
        $this->user = User::factory()->create();
        $this->student = User::factory()->create(['role' => 'student']);
        $this->lecturer = User::factory()->create(['role' => 'lecturer']);
        $this->exam = Exam::factory()->create(['lecturer_id' => $this->lecturer->id]);
    }

    #[Test]
    public function exam_reminder_notification_is_created()
    {
        $notification = $this->notificationService->sendExamReminder($this->student, $this->exam, 2);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_EXAM_REMINDER,
            'title' => "Exam Reminder: {$this->exam->title}",
        ]);

        $this->assertEquals(Notification::TYPE_EXAM_REMINDER, $notification->type);
    }

    #[Test]
    public function exam_started_notification_is_created()
    {
        $notification = $this->notificationService->sendExamStarted($this->student, $this->exam);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_EXAM_STARTED,
        ]);

        $this->assertFalse((bool) $notification->is_read);
    }

    #[Test]
    public function exam_submitted_notification_is_created()
    {
        $notification = $this->notificationService->sendExamSubmitted($this->student, $this->exam);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_EXAM_SUBMITTED,
        ]);

        $this->assertIsString($notification->message);
    }

    #[Test]
    public function grading_complete_notification_is_sent_to_lecturer()
    {
        $notification = $this->notificationService->sendGradingComplete($this->lecturer, $this->exam);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->lecturer->id,
            'type' => Notification::TYPE_GRADING_COMPLETE,
        ]);

        $this->assertEquals(Notification::TYPE_GRADING_COMPLETE, $notification->type);
    }

    #[Test]
    public function grade_released_notification_includes_score_and_grade()
    {
        $notification = $this->notificationService->sendGradeReleased($this->student, $this->exam, 85.5, 'A');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_GRADE_RELEASED,
        ]);

        $this->assertStringContainsString('85.5', $notification->message);
        $this->assertStringContainsString('A', $notification->message);
        $this->assertEquals(85.5, $notification->data['score']);
        $this->assertEquals('A', $notification->data['grade']);
    }

    #[Test]
    public function appeal_submitted_notification_is_sent_to_lecturer()
    {
        $appeal = GradeAppeal::factory()->create([
            'lecturer_id' => $this->lecturer->id,
            'student_id' => $this->student->id,
        ]);

        $notification = $this->notificationService->sendAppealSubmitted($this->lecturer, $appeal, $this->student);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->lecturer->id,
            'type' => Notification::TYPE_APPEAL_SUBMITTED,
        ]);

        if ($notification->message && $this->student->full_name) {
            $this->assertStringContainsString($this->student->full_name, $notification->message);
        }
    }

    #[Test]
    public function appeal_decision_approved_notification_is_sent()
    {
        $appeal = GradeAppeal::factory()->create(['student_id' => $this->student->id]);

        $notification = $this->notificationService->sendAppealDecision($this->student, $appeal, true, 90);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_APPEAL_DECIDED,
            'title' => 'Grade Appeal Approved',
        ]);

        $this->assertTrue($notification->data['approved']);
        $this->assertEquals(90, $notification->data['revised_score']);
    }

    #[Test]
    public function appeal_decision_rejected_notification_is_sent()
    {
        $appeal = GradeAppeal::factory()->create(['student_id' => $this->student->id]);

        $notification = $this->notificationService->sendAppealDecision($this->student, $appeal, false);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_APPEAL_DECIDED,
            'title' => 'Grade Appeal Rejected',
        ]);

        $this->assertFalse($notification->data['approved']);
    }

    #[Test]
    public function feedback_available_notification_is_created()
    {
        $notification = $this->notificationService->sendFeedbackAvailable($this->student, $this->exam);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->student->id,
            'type' => Notification::TYPE_FEEDBACK_AVAILABLE,
        ]);

        $this->assertStringContainsString($this->exam->title, $notification->message);
    }

    #[Test]
    public function system_message_notification_is_created()
    {
        $notification = $this->notificationService->sendSystemMessage(
            $this->user,
            'System Maintenance',
            'The system will be down for maintenance from 10 PM to 11 PM'
        );

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'type' => Notification::TYPE_SYSTEM_MESSAGE,
        ]);

        $this->assertEquals(Notification::TYPE_SYSTEM_MESSAGE, $notification->type);
    }

    #[Test]
    public function unread_notifications_are_retrieved()
    {
        Notification::factory(3)->create(['user_id' => $this->user->id, 'is_read' => false]);
        Notification::factory(2)->create(['user_id' => $this->user->id, 'is_read' => true]);
        Notification::factory(2)->create(['user_id' => User::factory(), 'is_read' => false]);

        $unread = $this->notificationService->getUnreadNotifications($this->user);

        $this->assertCount(3, $unread);
        $unread->each(fn($n) => $this->assertFalse($n->is_read));
    }

    #[Test]
    public function all_notifications_are_retrieved_with_pagination()
    {
        Notification::factory(25)->create(['user_id' => $this->user->id]);

        $paginated = $this->notificationService->getNotifications($this->user, perPage: 10);

        $this->assertCount(10, $paginated->items());
        $this->assertEquals(25, $paginated->total());
    }

    #[Test]
    public function notification_can_be_marked_as_read()
    {
        $notification = Notification::factory()->create(['user_id' => $this->user->id, 'is_read' => false]);

        $notification->markAsRead();

        $this->assertTrue($notification->is_read);
        $this->assertNotNull($notification->read_at);
    }

    #[Test]
    public function notification_can_be_marked_as_unread()
    {
        $notification = Notification::factory()->create(['user_id' => $this->user->id, 'is_read' => true]);

        $notification->markAsUnread();

        $this->assertFalse($notification->is_read);
        $this->assertNull($notification->read_at);
    }

    #[Test]
    public function all_user_notifications_can_be_marked_as_read()
    {
        Notification::factory(5)->create(['user_id' => $this->user->id, 'is_read' => false]);

        $this->notificationService->markAllAsRead($this->user);

        $unreadCount = Notification::where('user_id', $this->user->id)
            ->where('is_read', false)
            ->count();

        $this->assertEquals(0, $unreadCount);
    }

    #[Test]
    public function unread_notification_count_is_calculated()
    {
        Notification::factory(3)->create(['user_id' => $this->user->id, 'is_read' => false]);
        Notification::factory(2)->create(['user_id' => $this->user->id, 'is_read' => true]);

        $count = $this->notificationService->getUnreadCount($this->user);

        $this->assertEquals(3, $count);
    }

    #[Test]
    public function old_notifications_are_deleted()
    {
        // Clear any existing notifications from other tests
        Notification::truncate();
        
        Notification::factory(5)->create(['created_at' => now()->subDays(35)]);
        Notification::factory(3)->create(['created_at' => now()->subDays(10)]);

        $deleted = $this->notificationService->deleteOldNotifications(daysOld: 30);

        $this->assertEquals(5, $deleted);
        $this->assertCount(3, Notification::all());
    }

    #[Test]
    public function notification_has_correct_icon_and_color()
    {
        $examReminder = Notification::factory()->create(['type' => Notification::TYPE_EXAM_REMINDER]);
        $gradeReleased = Notification::factory()->create(['type' => Notification::TYPE_GRADE_RELEASED]);
        $appealSubmitted = Notification::factory()->create(['type' => Notification::TYPE_APPEAL_SUBMITTED]);

        $this->assertEquals('bell', $examReminder->icon);
        $this->assertEquals('blue', $examReminder->color);

        $this->assertEquals('star', $gradeReleased->icon);
        $this->assertEquals('purple', $gradeReleased->color);

        $this->assertEquals('alert-circle', $appealSubmitted->icon);
        $this->assertEquals('amber', $appealSubmitted->color);
    }

    #[Test]
    public function notification_can_have_related_model()
    {
        $notification = $this->notificationService->createNotification(
            $this->user,
            Notification::TYPE_EXAM_REMINDER,
            'Test',
            'Test message',
            [],
            relatedModelType: 'App\\Models\\Exam',
            relatedModelId: $this->exam->id
        );

        $this->assertEquals('App\\Models\\Exam', $notification->related_model_type);
        $this->assertEquals($this->exam->id, $notification->related_model_id);
    }
}
