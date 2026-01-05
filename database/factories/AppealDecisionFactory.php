<?php

namespace Database\Factories;

use App\Models\AppealDecision;
use App\Models\GradeAppeal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AppealDecision>
 */
class AppealDecisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $originalScore = fake()->numberBetween(50, 80);
        $revisedScore = fake()->numberBetween($originalScore, 100);

        return [
            'grade_appeal_id' => GradeAppeal::factory(),
            'lecturer_id' => User::factory()->create(['role' => 'lecturer'])->id,
            'decision' => fake()->randomElement(['approved', 'rejected']),
            'reasoning' => fake()->paragraph(2),
            'original_score' => $originalScore,
            'revised_score' => $revisedScore,
            'decided_at' => now(),
        ];
    }

    /**
     * Indicate that the decision is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'decision' => 'approved',
        ]);
    }

    /**
     * Indicate that the decision is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'decision' => 'rejected',
            'revised_score' => $attributes['original_score'],
        ]);
    }
}
