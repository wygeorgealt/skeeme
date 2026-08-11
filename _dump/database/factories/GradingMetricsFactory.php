<?php

namespace Database\Factories;

use App\Models\GradingMetrics;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GradingMetrics>
 */
class GradingMetricsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = fake()->dateTimeBetween('-7 days', 'now');
        $completedAt = fake()->dateTimeBetween($startedAt, 'now');
        
        return [
            'exam_session_id' => ExamSession::factory(),
            'lecturer_id' => User::factory()->create(['role' => 'lecturer'])->id,
            'grading_started_at' => $startedAt,
            'grading_completed_at' => $completedAt,
            'total_time_seconds' => fake()->randomNumber(4),
            'question_index' => fake()->numberBetween(0, 10),
            'time_per_question_seconds' => fake()->numberBetween(30, 300),
            'comments_added' => fake()->numberBetween(0, 5),
            'revision_count' => fake()->numberBetween(0, 3),
        ];
    }

    /**
     * Indicate that grading is in progress (not completed).
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'grading_completed_at' => null,
        ]);
    }

    /**
     * Indicate that grading is complete.
     */
    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'grading_completed_at' => now(),
        ]);
    }
}
