<?php

namespace Database\Factories;

use App\Models\ExamSessionRecovery;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamSessionRecovery>
 */
class ExamSessionRecoveryFactory extends Factory
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
            'last_question_index' => fake()->numberBetween(0, 10),
            'auto_saved_data' => [
                1 => ['response' => 'A'],
                2 => ['response' => 'B'],
            ],
            'connection_lost_at' => fake()->dateTimeThisMonth(),
            'recovered_at' => null,
            'is_recovered' => false,
        ];
    }

    /**
     * Indicate that the session has been recovered.
     */
    public function recovered(): static
    {
        return $this->state(fn (array $attributes) => [
            'recovered_at' => fake()->dateTimeThisMonth(),
            'is_recovered' => true,
        ]);
    }

    /**
     * Indicate that the session is pending recovery.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'recovered_at' => null,
            'is_recovered' => false,
        ]);
    }
}
