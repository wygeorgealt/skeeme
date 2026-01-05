<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exam>
 */
class ExamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'lecturer_id' => User::factory()->create(['role' => 'lecturer'])->id,
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(2),
            'exam_date' => fake()->dateTimeBetween('+1 day', '+30 days'),
            'duration' => fake()->randomElement([30, 45, 60, 90, 120]),
            'total_marks' => fake()->randomElement([50, 75, 100]),
            'questions' => [
                [
                    'id' => 1,
                    'text' => fake()->sentence(10),
                    'type' => 'multiple_choice',
                    'marks' => 5,
                    'options' => ['A', 'B', 'C', 'D'],
                    'correct_answer' => 'A',
                ],
                [
                    'id' => 2,
                    'text' => fake()->sentence(10),
                    'type' => 'multiple_choice',
                    'marks' => 5,
                    'options' => ['A', 'B', 'C', 'D'],
                    'correct_answer' => 'B',
                ],
            ],
            'status' => 'published',
            'randomize_questions' => fake()->boolean(50),
            'randomize_options' => fake()->boolean(50),
        ];
    }

    /**
     * Indicate that the exam is draft status.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    /**
     * Indicate that the exam is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }
}
