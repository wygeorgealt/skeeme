<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'question_type' => fake()->randomElement(['multiple_choice', 'essay', 'true_false']),
            'question_text' => fake()->sentence() . '?',
            'options' => [
                ['id' => 1, 'text' => fake()->word(), 'is_correct' => true],
                ['id' => 2, 'text' => fake()->word(), 'is_correct' => false],
                ['id' => 3, 'text' => fake()->word(), 'is_correct' => false],
                ['id' => 4, 'text' => fake()->word(), 'is_correct' => false],
            ],
            'correct_answer' => ['answer' => 'Model answer for the question.'],
            'marks' => fake()->randomElement([1, 2, 5, 10]),
            'created_by' => User::factory(),
            'status' => 'published',
        ];
    }

    public function mcq(): static
    {
        return $this->state(fn (array $attributes) => [
            'question_type' => 'multiple_choice',
        ]);
    }

    public function essay(): static
    {
        return $this->state(fn (array $attributes) => [
            'question_type' => 'essay',
            'options' => null,
        ]);
    }
}
