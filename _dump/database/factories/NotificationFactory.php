<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            Notification::TYPE_EXAM_REMINDER,
            Notification::TYPE_EXAM_STARTED,
            Notification::TYPE_EXAM_SUBMITTED,
            Notification::TYPE_GRADING_COMPLETE,
            Notification::TYPE_GRADE_RELEASED,
            Notification::TYPE_APPEAL_SUBMITTED,
            Notification::TYPE_APPEAL_DECIDED,
            Notification::TYPE_FEEDBACK_AVAILABLE,
            Notification::TYPE_SYSTEM_MESSAGE,
        ];

        $type = $this->faker->randomElement($types);

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'title' => $this->generateTitle($type),
            'message' => $this->generateMessage($type),
            'data' => $this->generateData($type),
            'is_read' => $this->faker->boolean(30),
            'read_at' => $this->faker->boolean(30) ? now()->subDays($this->faker->numberBetween(1, 7)) : null,
        ];
    }

    /**
     * Generate title based on notification type
     */
    private function generateTitle(string $type): string
    {
        return match($type) {
            Notification::TYPE_EXAM_REMINDER => 'Exam Reminder',
            Notification::TYPE_EXAM_STARTED => 'Exam Started',
            Notification::TYPE_EXAM_SUBMITTED => 'Exam Submitted',
            Notification::TYPE_GRADING_COMPLETE => 'Grading Complete',
            Notification::TYPE_GRADE_RELEASED => 'Grade Released',
            Notification::TYPE_APPEAL_SUBMITTED => 'Appeal Submitted',
            Notification::TYPE_APPEAL_DECIDED => 'Appeal Decided',
            Notification::TYPE_FEEDBACK_AVAILABLE => 'Feedback Available',
            Notification::TYPE_SYSTEM_MESSAGE => 'System Message',
            default => 'Notification',
        };
    }

    /**
     * Generate message based on notification type
     */
    private function generateMessage(string $type): string
    {
        return match($type) {
            Notification::TYPE_EXAM_REMINDER => 'Your exam starts in 2 hours',
            Notification::TYPE_EXAM_STARTED => 'Your exam has started',
            Notification::TYPE_EXAM_SUBMITTED => 'Your exam has been submitted successfully',
            Notification::TYPE_GRADING_COMPLETE => 'Grading for your exam has been completed',
            Notification::TYPE_GRADE_RELEASED => 'Your grade has been released',
            Notification::TYPE_APPEAL_SUBMITTED => 'Your grade appeal has been received',
            Notification::TYPE_APPEAL_DECIDED => 'A decision has been made on your appeal',
            Notification::TYPE_FEEDBACK_AVAILABLE => 'Feedback is now available for your exam',
            Notification::TYPE_SYSTEM_MESSAGE => $this->faker->sentence(),
            default => $this->faker->sentence(),
        };
    }

    /**
     * Generate data based on notification type
     */
    private function generateData(string $type): array
    {
        return match($type) {
            Notification::TYPE_EXAM_REMINDER => ['exam_id' => 1, 'hours_until' => 2],
            Notification::TYPE_EXAM_STARTED => ['exam_id' => 1],
            Notification::TYPE_EXAM_SUBMITTED => ['exam_id' => 1],
            Notification::TYPE_GRADING_COMPLETE => ['exam_id' => 1],
            Notification::TYPE_GRADE_RELEASED => ['exam_id' => 1, 'score' => 85.5, 'grade' => 'A'],
            Notification::TYPE_APPEAL_SUBMITTED => ['appeal_id' => 1],
            Notification::TYPE_APPEAL_DECIDED => ['appeal_id' => 1, 'approved' => true, 'revised_score' => 90],
            Notification::TYPE_FEEDBACK_AVAILABLE => ['exam_id' => 1],
            Notification::TYPE_SYSTEM_MESSAGE => [],
            default => [],
        };
    }

    /**
     * Mark as read
     */
    public function read(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'is_read' => true,
                'read_at' => now(),
            ];
        });
    }

    /**
     * Mark as unread
     */
    public function unread(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'is_read' => false,
                'read_at' => null,
            ];
        });
    }
}
