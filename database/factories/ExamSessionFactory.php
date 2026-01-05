<?php

namespace Database\Factories;

use App\Models\ExamSession;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamSession>
 */
class ExamSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = fake()->dateTimeBetween('-7 days', 'now');
        
        return [
            'exam_id' => Exam::factory(),
            'student_id' => User::factory()->create(['role' => 'student'])->id,
            'status' => 'in_progress',
            'started_at' => $startedAt,
            'submitted_at' => null,
            'graded_at' => null,
            'time_spent_seconds' => fake()->randomNumber(4),
            'questions_answered' => fake()->numberBetween(0, 10),
            'score' => null,
            'answers' => [],
            'metadata' => [],
        ];
    }

    /**
     * Indicate that the session has been submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'submitted',
            'submitted_at' => fake()->dateTimeThisMonth(),
        ]);
    }

    /**
     * Indicate that the session has been graded.
     */
    public function graded(): static
    {
        return $this->submitted()->state(fn (array $attributes) => [
            'status' => 'graded',
            'graded_at' => fake()->dateTimeThisMonth(),
            'score' => fake()->randomFloat(2, 0, 100),
        ]);
    }

    /**
     * Indicate that the session is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'submitted_at' => null,
            'graded_at' => null,
            'score' => null,
        ]);
    }

    /**
     * Indicate that the session has specific answers.
     */
    public function withAnswers(array $answers = []): static
    {
        return $this->state(fn (array $attributes) => [
            'answers' => $answers ?: [
                1 => ['response' => 'A'],
                2 => ['response' => 'B'],
            ],
        ]);
    }

    /**
     * Indicate that the session has metadata.
     */
    public function withMetadata(array $metadata = []): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => $metadata ?: [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
            ],
        ]);
    }
}
