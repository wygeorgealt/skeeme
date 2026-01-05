<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\School>
 */
class SchoolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $schoolName = fake()->company() . ' ' . fake()->randomElement(['School', 'Academy', 'Institute', 'College', 'University']);

        return [
            'name' => $schoolName,
            'address' => fake()->address(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'academic_year' => '2024-2025',
            'allow_student_password_change' => fake()->boolean(80), // 80% chance of true
        ];
    }

    /**
     * Indicate that this is mock data.
     */
    public function mock(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => '[MOCK] ' . $attributes['name'],
        ]);
    }
}
