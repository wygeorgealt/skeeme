<?php

namespace Database\Factories;

use App\Models\GradeAppeal;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GradeAppeal>
 */
class GradeAppealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_session_id' => ExamSession::factory(),
            'student_id' => User::factory()->create(['role' => 'student'])->id,
            'lecturer_id' => User::factory()->create(['role' => 'lecturer'])->id,
            'reason' => fake()->paragraph(3),
            'status' => 'pending',
            'submitted_at' => now(),
            'resolved_at' => null,
        ];
    }

    /**
     * Indicate that the appeal has been approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'resolved_at' => fake()->dateTimeThisMonth(),
        ]);
    }

    /**
     * Indicate that the appeal has been rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'resolved_at' => fake()->dateTimeThisMonth(),
        ]);
    }

    /**
     * Indicate that the appeal is still pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'resolved_at' => null,
        ]);
    }
}
