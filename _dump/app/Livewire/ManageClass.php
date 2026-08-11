<?php

namespace App\Livewire;

use App\Models\SchoolClass;
use App\Models\Course;
use App\Models\User;
use App\Models\Enrollment;
use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Notifications\LecturerAlert;
use App\Traits\HasToastNotifications;

class ManageClass extends Component
{
    use HasToastNotifications;
    public $classId;
    public $classDetails = null;

    // Edit Course
    public $showEditCourseModal = false;
    public $selectedCourse = null;
    public $editCourseName = '';
    public $editCourseDescription = '';
    public $editLecturerId = '';

    // Add Student to Class
    public $showAddStudentToClassModal = false;
    public $selectedStudentId = null;

    // Move Student
    public $showMoveStudentModal = false;
    public $selectedStudent = null;
    public $targetClassId = '';

    // Remove Student
    public $showRemoveStudentModal = false;

    // Add/Assign Course (new)
    public $showAddCourseModal = false;
    public $selectedCourseId = '';

    // Create Course (new)
    public $showCreateCourseModal = false;
    public $courseName = '';
    public $courseDescription = '';

    protected $listeners = [
        'refreshClassDetails' => 'loadClassDetails'
    ];

    public function mount($classId)
    {
        $this->classId = $classId;
        $this->loadClassDetails();
        $this->authorizeAccess();
    }

    protected function authorizeAccess()
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to class management.');
        }
    }

    public function loadClassDetails()
    {
        $class = SchoolClass::with(['students', 'courses'])
            ->where('id', $this->classId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if (!$class) {
            abort(404, 'Class not found.');
        }

        $this->classDetails = [
            'id' => $class->id,
            'name' => $class->name,
            'description' => $class->description ?? 'No description',
            'students_count' => $class->students()->count(),
            'courses_count' => $class->courses()->count(),
            'created_at' => $class->created_at->format('M d, Y'),
            'students' => $class->students()->select('id', 'first_name', 'last_name', 'email')->get(),
            'courses' => $class->courses()->select('courses.id', 'courses.name', 'courses.code', 'courses.description')->get(),
        ];
    }

    public function openEditCourseModal($courseId)
    {
        $this->selectedCourse = Course::with('lecturers')
            ->where('id', $courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($this->selectedCourse) {
            $this->editCourseName = $this->selectedCourse->name;
            $this->editCourseDescription = $this->selectedCourse->description ?? '';
            $this->editLecturerId = $this->selectedCourse->lecturers->first()->id ?? '';
            $this->showEditCourseModal = true;
        }
    }

    public function confirmEditCourse()
    {
        $this->validate([
            'editCourseName' => 'required|string|max:255',
            'editCourseDescription' => 'nullable|string|max:1000',
            'editLecturerId' => 'nullable|exists:users,id',
        ]);

        if (!$this->selectedCourse) {
            $this->toastError('Course not found.', 'Error');
            return;
        }

        DB::transaction(function () {
            $this->selectedCourse->update([
                'name' => $this->editCourseName,
                'description' => $this->editCourseDescription,
            ]);

            // Update lecturer assignment
            if ($this->editLecturerId) {
                // Remove existing lecturer assignments
                DB::table('course_lecturers')
                    ->where('course_id', $this->selectedCourse->id)
                    ->delete();

                // Add new lecturer assignment
                DB::table('course_lecturers')->insert([
                    'course_id' => $this->selectedCourse->id,
                    'user_id' => $this->editLecturerId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                // Remove all lecturer assignments if no lecturer selected
                DB::table('course_lecturers')
                    ->where('course_id', $this->selectedCourse->id)
                    ->delete();
            }
        });

        $this->toastSuccess('Course updated successfully!', 'Success');
        $this->closeModals();
        $this->loadClassDetails();
    }

    public function openAddStudentToClassModal()
    {
        $this->showAddStudentToClassModal = true;
    }

    public function confirmAddStudentToClass()
    {
        $this->validate([
            'selectedStudentId' => 'required|exists:users,id',
        ]);

        $student = User::where('id', $this->selectedStudentId)
            ->where('school_id', auth()->user()->school_id)
            ->where('role', 'student')
            ->whereNull('class_id')
            ->first();

        if (!$student) {
            $this->toastError('Student not found or already assigned to a class.', 'Error');
            return;
        }

        DB::transaction(function () use ($student) {
            $student->update(['class_id' => $this->classId]);

            // Auto-enroll student in all class courses
            $this->autoEnrollStudentInClassCourses($student, $this->classId);
        });

        $this->toastSuccess('Student added to class successfully!', 'Success');
        $this->closeModals();
        $this->loadClassDetails();
    }

    public function openMoveStudentModal($studentId)
    {
        $this->selectedStudent = User::where('id', $studentId)
            ->where('school_id', auth()->user()->school_id)
            ->where('role', 'student')
            ->first();

        if ($this->selectedStudent) {
            $this->showMoveStudentModal = true;
        }
    }

    public function confirmMoveStudent()
    {
        $this->validate([
            'targetClassId' => 'required|exists:classes,id',
        ]);

        if (!$this->selectedStudent) {
            $this->toastError('Student not found.', 'Error');
            return;
        }

        $targetClass = SchoolClass::where('id', $this->targetClassId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if (!$targetClass) {
            $this->toastError('Target class not found.', 'Error');
            return;
        }

        $oldClassId = $this->selectedStudent->class_id;

        DB::transaction(function () use ($oldClassId) {
            $this->selectedStudent->update(['class_id' => $this->targetClassId]);

            // Handle enrollment changes
            if ($oldClassId != $this->targetClassId) {
                $this->handleStudentClassChangeEnrollments($this->selectedStudent, $oldClassId, $this->targetClassId);
            }
        });

        $this->toastSuccess('Student moved to new class successfully!', 'Success');
        $this->closeModals();
        $this->loadClassDetails();
    }

    public function openRemoveStudentModal($studentId)
    {
        $this->selectedStudent = User::where('id', $studentId)
            ->where('school_id', auth()->user()->school_id)
            ->where('role', 'student')
            ->first();

        if ($this->selectedStudent) {
            $this->showRemoveStudentModal = true;
        }
    }

    public function confirmRemoveStudent()
    {
        if (!$this->selectedStudent) {
            $this->toastError('Student not found.', 'Error');
            return;
        }

        $classId = $this->selectedStudent->class_id;

        DB::transaction(function () use ($classId) {
            // Unenroll from all class courses
            if ($classId) {
                $classCourses = DB::table('class_courses')->where('class_id', $classId)->pluck('course_id');
                Enrollment::where('student_id', $this->selectedStudent->id)
                    ->whereIn('course_id', $classCourses)
                    ->delete();
            }

            $this->selectedStudent->update(['class_id' => null]);
        });

        $this->toastSuccess('Student removed from class successfully!', 'Success');
        $this->closeModals();
        $this->loadClassDetails();
    }

    public function unassignCourse($courseId)
    {
        $class = SchoolClass::where('id', $this->classId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if (!$class) {
            $this->toastError('Class not found.', 'Error');
            return;
        }

        DB::transaction(function () use ($courseId) {
            // Remove course from class
            DB::table('class_courses')
                ->where('class_id', $this->classId)
                ->where('course_id', $courseId)
                ->delete();

            // Unenroll all students in the class from this course
            Enrollment::where('course_id', $courseId)
                ->whereIn('student_id', function ($query) {
                    $query->select('id')
                          ->from('users')
                          ->where('class_id', $this->classId)
                          ->where('role', 'student');
                })
                ->delete();
        });

        $this->toastSuccess('Course unassigned from class successfully. All students have been unenrolled.', 'Success');
        $this->loadClassDetails();
    }

    // New: Open Add/Assign Course Modal (no redirect)
    public function openAddCourseModal()
    {
        $this->showAddCourseModal = true;
    }

    // New: Confirm Add/Assign Course
    public function confirmAddCourse()
    {
        $this->validate([
            'selectedCourseId' => 'required|exists:courses,id,school_id,' . auth()->user()->school_id,
        ]);

        // Check if already assigned
        $alreadyAssigned = DB::table('class_courses')
            ->where('class_id', $this->classId)
            ->where('course_id', $this->selectedCourseId)
            ->exists();

        if ($alreadyAssigned) {
            $this->toastError('Course already assigned to this class.', 'Error');
            return;
        }

        DB::transaction(function () {
            // Check if course is already assigned to class
            $exists = DB::table('class_courses')
                ->where('class_id', $this->classId)
                ->where('course_id', $this->selectedCourseId)
                ->exists();

            if (!$exists) {
                // Assign course to class
                DB::table('class_courses')->insert([
                    'class_id' => $this->classId,
                    'course_id' => $this->selectedCourseId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Auto-enroll all students in the class to this course
                $this->autoEnrollClassStudentsInCourse($this->classId, $this->selectedCourseId);

                // Notify lecturers about the new course assignment
                $this->notifyLecturersAboutCourseAssignment($this->selectedCourseId, $this->classId);
            } else {
                $this->toastError('Course is already assigned to this class.', 'Error');
                return;
            }
        });

        $this->toastSuccess('Course assigned to class successfully. All students enrolled.', 'Success');

        // Notify students about the new course
        $this->notifyStudentsAboutNewCourse($this->selectedCourseId, $this->classId);

        $this->closeModals();
        $this->loadClassDetails();
    }

    // New: Open Create Course Modal (no redirect)
    public function openCreateCourseModal()
    {
        $this->showCreateCourseModal = true;
    }

    // New: Confirm Create Course
    public function confirmCreateCourse()
    {
        $this->validate([
            'courseName' => 'required|string|max:255',
            'courseDescription' => 'nullable|string|max:1000',
        ]);

        $code = $this->generateCourseCode();

        $course = DB::transaction(function () use ($code) {
            // Create new course
            $course = Course::create([
                'name' => $this->courseName,
                'description' => $this->courseDescription,
                'code' => $code,
                'course_link' => Course::generateCourseLink(),
                'school_id' => auth()->user()->school_id,
                'created_by' => auth()->id(), // Admin creates it
                'status' => 'active',
            ]);

            // Assign to class
            DB::table('class_courses')->insert([
                'class_id' => $this->classId,
                'course_id' => $course->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Auto-enroll students
            $this->autoEnrollClassStudentsInCourse($this->classId, $course->id);

            // Notify lecturers about the new course creation and assignment
            $this->notifyLecturersAboutCourseAssignment($course->id, $this->classId);

            return $course;
        });

        $this->toastSuccess('Course created and assigned successfully. All students enrolled.', 'Success');

        // Notify students about the new course
        $this->notifyStudentsAboutNewCourse($course->id, $this->classId);

        $this->closeModals();
        $this->loadClassDetails();
    }

    // Helper Methods (existing + new from move)
    protected function autoEnrollStudentInClassCourses(User $student, $classId)
    {
        $classCourses = DB::table('class_courses')->where('class_id', $classId)->pluck('course_id');

        foreach ($classCourses as $courseId) {
            Enrollment::firstOrCreate([
                'student_id' => $student->id,
                'course_id' => $courseId,
            ], [
                'class_id' => $classId,
                'enrolled_at' => now(),
            ]);
        }
    }

    protected function handleStudentClassChangeEnrollments(User $student, $oldClassId, $newClassId)
    {
        // Unenroll from old class courses
        if ($oldClassId) {
            $oldClassCourses = DB::table('class_courses')->where('class_id', $oldClassId)->pluck('course_id');
            Enrollment::where('student_id', $student->id)
                ->whereIn('course_id', $oldClassCourses)
                ->delete();
        }

        // Enroll in new class courses
        $this->autoEnrollStudentInClassCourses($student, $newClassId);
    }

    // New helper: Auto-enroll class students in a course
    protected function autoEnrollClassStudentsInCourse($classId, $courseId)
    {
        $students = User::where('class_id', $classId)
            ->where('role', 'student')
            ->pluck('id');

        foreach ($students as $studentId) {
            Enrollment::firstOrCreate([
                'student_id' => $studentId,
                'course_id' => $courseId,
            ], [
                'class_id' => $classId,
                'enrolled_at' => now(),
            ]);
        }
    }

    // New helper: Generate course code
    protected function generateCourseCode()
    {
        do {
            $randomChars = Str::random(6);
            $code = 'skeeme.com/enroll/' . Str::slug($this->courseName) . '-' . $randomChars;
        } while (Course::where('code', $code)->exists());

        return $code;
    }

    public function getAvailableStudents()
    {
        return User::where('school_id', auth()->user()->school_id)
            ->where('role', 'student')
            ->whereNull('class_id')
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();
    }

    public function getAvailableClassesForStudent()
    {
        return SchoolClass::where('school_id', auth()->user()->school_id)
            ->where('id', '!=', $this->classId)
            ->orderBy('name')
            ->get();
    }

    // New: Get available courses for this class
    public function getAvailableCourses()
    {
        $assignedCourseIds = DB::table('class_courses')
            ->where('class_id', $this->classId)
            ->pluck('course_id');

        return Course::where('school_id', auth()->user()->school_id)
            ->whereNotIn('id', $assignedCourseIds)
            ->orderBy('name')
            ->get();
    }

    public function closeModals()
    {
        $this->showEditCourseModal = false;
        $this->showAddStudentToClassModal = false;
        $this->showMoveStudentModal = false;
        $this->showRemoveStudentModal = false;
        $this->showAddCourseModal = false; // New
        $this->showCreateCourseModal = false; // New
        $this->selectedCourse = null;
        $this->selectedStudent = null;
        $this->editCourseName = '';
        $this->editCourseDescription = '';
        $this->editLecturerId = '';
        $this->selectedStudentId = '';
        $this->targetClassId = '';
        $this->selectedCourseId = ''; // New
        $this->courseName = ''; // New
        $this->courseDescription = ''; // New
    }

    protected function notifyLecturersAboutCourseAssignment($courseId, $classId)
    {
        // Get all lecturers assigned to this course
        $lecturers = DB::table('course_lecturers')
            ->join('users', 'course_lecturers.user_id', '=', 'users.id')
            ->where('course_lecturers.course_id', $courseId)
            ->where('users.school_id', auth()->user()->school_id)
            ->select('users.id', 'users.first_name', 'users.last_name')
            ->get();

        $course = Course::find($courseId);
        $class = SchoolClass::find($classId);

        foreach ($lecturers as $lecturer) {
            $this->toastBroadcast(
                "You have been assigned to teach '{$course->name}' in class '{$class->name}'. Please prepare your course materials.",
                [$lecturer->id],
                'info',
                'New Course Assignment'
            );
        }
    }

    protected function notifyStudentsAboutNewCourse($courseId, $classId)
    {
        // Get all students in the class
        $students = User::where('class_id', $classId)
            ->where('role', 'student')
            ->where('school_id', auth()->user()->school_id)
            ->select('id', 'first_name', 'last_name')
            ->get();

        $course = Course::find($courseId);
        $class = SchoolClass::find($classId);

        foreach ($students as $student) {
            $this->toastBroadcast(
                "A new course '{$course->name}' has been added to your class '{$class->name}'.",
                [$student->id],
                'info',
                'New Course Added'
            );
        }
    }

    public function getAvailableLecturers()
    {
        return User::where('school_id', auth()->user()->school_id)
            ->where('role', 'lecturer')
            ->orderBy('first_name')
            ->get();
    }

    public function render()
    {
        return view('livewire.manage-class', [
            'availableStudents' => $this->getAvailableStudents(),
            'availableClasses' => $this->getAvailableClassesForStudent(),
            'availableCourses' => $this->getAvailableCourses(), // New
            'availableLecturers' => $this->getAvailableLecturers(),
        ]);
    }
}
