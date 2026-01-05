<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Course;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enrollment>
 */
class EnrollmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => User::factory()->create(['role' => 'student']),
            'course_id' => Course::factory(),
            'class_id' => null, // Optional, can be set for class-based enrollments
            'enrolled_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'status' => 'active',
        ];
    }

    /**
     * Create enrollment for specific student and course.
     */
    public function forStudentAndCourse(User $student, Course $course): static
    {
        return $this->state(fn (array $attributes) => [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    /**
     * Create enrollment with class association.
     */
    public function withClass($classId): static
    {
        return $this->state(fn (array $attributes) => [
            'class_id' => $classId,
        ]);
    }
}
