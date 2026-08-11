<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\School;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MockDataGenerator extends Component
{
    public $passkey = '';
    public $accessGranted = false;

    // Form inputs
    public $numSchools = 1;
    public $numLecturers = 5;
    public $numStudents = 20;
    public $numClasses = 3;
    public $numCourses = 5;
    public $numEnrollments = 50;

    // Progress tracking
    public $isGenerating = false;
    public $progress = 0;
    public $currentStep = '';
    public $generatedData = [];

    protected $rules = [
        'numSchools' => 'required|integer|min:1|max:10',
        'numLecturers' => 'required|integer|min:1|max:50',
        'numStudents' => 'required|integer|min:1|max:100',
        'numClasses' => 'required|integer|min:1|max:20',
        'numCourses' => 'required|integer|min:1|max:20',
        'numEnrollments' => 'required|integer|min:1|max:200',
    ];

    public function checkPasskey()
    {
        if ($this->passkey === 'wwewwr') {
            $this->accessGranted = true;
            $this->toastSuccess('Access granted. You can now generate mock data.', 'Access Granted');
        } else {
            $this->toastError('Invalid passkey. Access denied.', 'Access Denied');
            $this->passkey = '';
        }
    }

    public function generateMockData()
    {
        if (!$this->accessGranted) {
            $this->toastError('Access denied. Please enter the correct passkey first.', 'Access Denied');
            return;
        }

        $this->validate();

        $this->isGenerating = true;
        $this->progress = 0;
        $this->currentStep = 'Starting mock data generation...';
        $this->generatedData = [];

        try {
            DB::beginTransaction();

            // Generate Schools
            $this->currentStep = 'Generating schools...';
            $schools = [];
            for ($i = 0; $i < $this->numSchools; $i++) {
                $school = School::factory()->mock()->create();
                $schools[] = $school;
                $this->progress = ($i + 1) / $this->numSchools * 20;
            }
            $this->generatedData['schools'] = count($schools);

            // Generate Lecturers for each school
            $this->currentStep = 'Generating lecturers...';
            $lecturers = [];
            foreach ($schools as $school) {
                for ($i = 0; $i < $this->numLecturers; $i++) {
                    $lecturer = User::factory()->create([
                        'school_id' => $school->id,
                        'role' => 'lecturer',
                        'status' => 'active',
                        'first_name' => '[MOCK] ' . fake()->firstName(),
                        'last_name' => '[MOCK] ' . fake()->lastName(),
                        'name' => '[MOCK] ' . fake()->name(),
                        'email' => fake()->unique()->safeEmail(),
                        'password' => Hash::make('password123'),
                    ]);
                    $lecturers[$school->id][] = $lecturer;
                }
            }
            $this->generatedData['lecturers'] = count($lecturers) * $this->numLecturers;
            $this->progress = 40;

            // Generate Classes for each school
            $this->currentStep = 'Generating classes...';
            $classes = [];
            foreach ($schools as $school) {
                for ($i = 0; $i < $this->numClasses; $i++) {
                    $class = SchoolClass::factory()->mock()->forSchool($school)->create([
                        'class_teacher_id' => fake()->randomElement($lecturers[$school->id] ?? [])?->id,
                    ]);
                    $classes[$school->id][] = $class;
                }
            }
            $this->generatedData['classes'] = count($classes) * $this->numClasses;
            $this->progress = 50;

            // Generate Students for each school and assign to classes
            $this->currentStep = 'Generating students...';
            $students = [];
            foreach ($schools as $school) {
                $schoolClasses = $classes[$school->id] ?? [];
                for ($i = 0; $i < $this->numStudents; $i++) {
                    $assignedClass = !empty($schoolClasses) ? fake()->randomElement($schoolClasses) : null;
                    $student = User::factory()->create([
                        'school_id' => $school->id,
                        'role' => 'student',
                        'status' => 'active',
                        'class_id' => $assignedClass?->id,
                        'first_name' => '[MOCK] ' . fake()->firstName(),
                        'last_name' => '[MOCK] ' . fake()->lastName(),
                        'name' => '[MOCK] ' . fake()->name(),
                        'email' => fake()->unique()->safeEmail(),
                        'password' => Hash::make('password123'),
                    ]);
                    $students[$school->id][] = $student;
                }
            }
            $this->generatedData['students'] = count($students) * $this->numStudents;
            $this->progress = 70;

            // Generate Courses for each school
            $this->currentStep = 'Generating courses...';
            $courses = [];
            foreach ($schools as $school) {
                for ($i = 0; $i < $this->numCourses; $i++) {
                    $course = Course::factory()->mock()->forSchool($school)->create();
                    $courses[$school->id][] = $course;
                }
            }
            $this->generatedData['courses'] = count($courses) * $this->numCourses;
            $this->progress = 85;

            // Generate Enrollments
            $this->currentStep = 'Generating enrollments...';
            $enrollmentsCreated = 0;
            foreach ($schools as $school) {
                $schoolStudents = $students[$school->id] ?? [];
                $schoolCourses = $courses[$school->id] ?? [];
                $schoolClasses = $classes[$school->id] ?? [];

                for ($i = 0; $i < $this->numEnrollments && !empty($schoolStudents) && !empty($schoolCourses); $i++) {
                    $student = fake()->randomElement($schoolStudents);
                    $course = fake()->randomElement($schoolCourses);

                    // Check if enrollment already exists
                    $existingEnrollment = Enrollment::where('student_id', $student->id)
                        ->where('course_id', $course->id)
                        ->first();

                    if (!$existingEnrollment) {
                        $classId = null;
                        if (!empty($schoolClasses) && $student->class_id) {
                            // Check if course is assigned to student's class
                            $classCourseExists = DB::table('class_courses')
                                ->where('class_id', $student->class_id)
                                ->where('course_id', $course->id)
                                ->exists();

                            if ($classCourseExists) {
                                $classId = $student->class_id;
                            }
                        }

                        Enrollment::factory()->forStudentAndCourse($student, $course)->withClass($classId)->create();
                        $enrollmentsCreated++;
                    }
                }
            }
            $this->generatedData['enrollments'] = $enrollmentsCreated;
            $this->progress = 100;

            DB::commit();

            $this->currentStep = 'Mock data generation completed successfully!';
            $this->toastSuccess('Mock data generated successfully! Check the summary below.', 'Generation Complete');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->currentStep = 'Error occurred during generation';
            $this->toastError('Error generating mock data: ' . $e->getMessage(), 'Generation Failed');
        } finally {
            $this->isGenerating = false;
        }
    }

    public function render()
    {
        return view('livewire.mock-data-generator');
    }
}
