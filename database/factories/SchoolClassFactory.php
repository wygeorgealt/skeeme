<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
        $sections = ['A', 'B', 'C', 'D', 'E'];

        $grade = fake()->randomElement($grades);
        $section = fake()->randomElement($sections);

        return [
            'name' => $grade . ' ' . $section,
            'school_id' => School::factory(),
            'class_teacher_id' => null, // Will be set later when creating lecturers
            'academic_year' => '2024-2025',
            'grade_level' => $grade,
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

    /**
     * Create a class for a specific school.
     */
    public function forSchool(School $school): static
    {
        return $this->state(fn (array $attributes) => [
            'school_id' => $school->id,
        ]);
    }
}
