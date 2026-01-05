<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\School;
use App\Models\Course;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subjects = [
            'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
            'History', 'Geography', 'Computer Science', 'Art', 'Music',
            'Physical Education', 'Economics', 'Literature', 'Statistics'
        ];

        $subject = fake()->randomElement($subjects);
        $code = Course::generateCourseCode($subject);
        $link = Course::generateCourseLink();

        return [
            'name' => $subject,
            'code' => $code,
            'description' => fake()->sentence(10),
            'school_id' => School::factory(),
            'course_link' => $link,
            'course_rep_id' => null, // Will be set later when creating students
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
     * Create a course for a specific school.
     */
    public function forSchool(School $school): static
    {
        return $this->state(fn (array $attributes) => [
            'school_id' => $school->id,
        ]);
    }
}
