<?php

namespace App\Livewire;

use App\Models\Course;
use App\Models\User;
use App\Models\SchoolClass;
use Livewire\Component;
use Illuminate\Support\Facades\DB;
use App\Traits\HasToastNotifications;

class AdminCourseManagement extends Component
{
    use HasToastNotifications;

    public $courses = [];
    public $filter = 'all'; // all, active, archived
    public $sortBy = 'name'; // name, created, lecturers
    public $search = '';

    // Create Course Modal
    public $showCreateModal = false;
    public $createName = '';
    public $createDescription = '';
    public $createLecturerId = '';

    // Edit Course Modal
    public $showEditModal = false;
    public $editingCourse = null;
    public $editName = '';
    public $editDescription = '';
    public $editLecturerId = '';

    protected $listeners = [
        'refreshCourses' => 'loadCourses'
    ];

    public function mount()
    {
        $this->loadCourses();
    }

    public function loadCourses()
    {
        $query = Course::with(['creator', 'lecturers', 'classes'])
            ->where('school_id', auth()->user()->school_id);

        // Apply filter
        switch ($this->filter) {
            case 'active':
                $query->where('status', 'active');
                break;
            case 'archived':
                $query->where('status', 'archived');
                break;
        }

        // Apply search
        if ($this->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', '%' . $this->search . '%')
                  ->orWhere('code', 'like', '%' . $this->search . '%');
            });
        }

        // Apply sorting
        switch ($this->sortBy) {
            case 'created':
                $query->orderBy('created_at', 'desc');
                break;
            case 'lecturers':
                $query->withCount('lecturers')->orderBy('lecturers_count', 'desc');
                break;
            default:
                $query->orderBy('name');
        }

        $this->courses = $query->get();
    }

    public function updatedFilter()
    {
        $this->loadCourses();
    }

    public function updatedSortBy()
    {
        $this->loadCourses();
    }

    public function updatedSearch()
    {
        $this->loadCourses();
    }

    public function openCreateModal()
    {
        $this->resetCreateForm();
        $this->showCreateModal = true;
    }

    public function createCourse()
    {
        $this->validate([
            'createName' => 'required|string|max:255',
            'createDescription' => 'nullable|string|max:1000',
            'createLecturerId' => 'required|exists:users,id',
        ]);

        // Verify lecturer belongs to same school
        $lecturer = User::where('id', $this->createLecturerId)
            ->where('school_id', auth()->user()->school_id)
            ->where('role', 'lecturer')
            ->first();

        if (!$lecturer) {
            $this->toastError('Invalid lecturer selected', 'Error');
            return;
        }

        $code = Course::generateCourseCode($this->createName);
        $courseLink = Course::generateCourseLink();

        $course = Course::create([
            'name' => $this->createName,
            'description' => $this->createDescription,
            'code' => $code,
            'course_link' => $courseLink,
            'school_id' => auth()->user()->school_id,
            'created_by' => auth()->id(), // Admin created
            'status' => 'active',
        ]);

        // Assign lecturer
        $course->lecturers()->attach($this->createLecturerId);

        $this->toastSuccess('Course created and lecturer assigned successfully!', 'Success');

        // Notify the assigned lecturer
        $this->toastBroadcast(
            "You have been assigned to teach the course '{$course->name}'.",
            [$this->createLecturerId],
            'info',
            'New Course Assignment'
        );

        $this->closeModals();
        $this->loadCourses();
    }

    public function openEditModal($courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($course) {
            $this->editingCourse = $course;
            $this->editName = $course->name;
            $this->editDescription = $course->description ?? '';
            $this->editLecturerId = $course->lecturers->first()?->id ?? '';
            $this->showEditModal = true;
        }
    }

    public function updateCourse()
    {
        $this->validate([
            'editName' => 'required|string|max:255',
            'editDescription' => 'nullable|string|max:1000',
            'editLecturerId' => 'required|exists:users,id',
        ]);

        // Verify lecturer belongs to same school
        $lecturer = User::where('id', $this->editLecturerId)
            ->where('school_id', auth()->user()->school_id)
            ->where('role', 'lecturer')
            ->first();

        if (!$lecturer) {
            $this->toastError('Invalid lecturer selected', 'Error');
            return;
        }

        if (!$this->editingCourse) return;

        $this->editingCourse->update([
            'name' => $this->editName,
            'description' => $this->editDescription,
        ]);

        // Update lecturer assignment
        $this->editingCourse->lecturers()->sync([$this->editLecturerId]);

        $this->toastSuccess('Course updated successfully!', 'Success');
        $this->closeModals();
        $this->loadCourses();
    }

    public function openAssignLecturerModal($courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($course) {
            $this->assigningCourse = $course;
            $this->selectedLecturers = $course->lecturers->pluck('id')->toArray();
            $this->showAssignLecturerModal = true;
        }
    }

    public function assignLecturers()
    {
        if (!$this->assigningCourse) return;

        DB::transaction(function () {
            // Remove existing assignments
            DB::table('course_lecturers')
                ->where('course_id', $this->assigningCourse->id)
                ->delete();

            // Add new assignments
            foreach ($this->selectedLecturers as $lecturerId) {
                DB::table('course_lecturers')->insert([
                    'course_id' => $this->assigningCourse->id,
                    'lecturer_id' => $lecturerId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        $this->toastSuccess('Lecturers assigned successfully!', 'Success');

        // Notify newly assigned lecturers
        foreach ($this->selectedLecturers as $lecturerId) {
            $this->toastBroadcast(
                "You have been assigned to teach the course '{$this->assigningCourse->name}'.",
                [$lecturerId],
                'info',
                'New Course Assignment'
            );
        }

        $this->closeModals();
        $this->loadCourses();
    }

    public function openAssignClassModal($courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($course) {
            $this->assigningCourseClass = $course;
            $this->selectedClasses = $course->classes->pluck('id')->toArray();
            $this->showAssignClassModal = true;
        }
    }

    public function assignToClasses()
    {
        if (!$this->assigningCourseClass) return;

        DB::transaction(function () {
            // Remove existing assignments
            DB::table('class_courses')
                ->where('course_id', $this->assigningCourseClass->id)
                ->delete();

            // Add new assignments and enroll students
            foreach ($this->selectedClasses as $classId) {
                DB::table('class_courses')->insert([
                    'class_id' => $classId,
                    'course_id' => $this->assigningCourseClass->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Auto-enroll all students in the class
                $this->autoEnrollClassStudentsInCourse($classId, $this->assigningCourseClass->id);
            }
        });

        $this->toastSuccess('Course assigned to classes successfully!', 'Success');

        // Notify students in the assigned classes
        foreach ($this->selectedClasses as $classId) {
            $students = User::where('class_id', $classId)
                ->where('role', 'student')
                ->where('school_id', auth()->user()->school_id)
                ->pluck('id')
                ->toArray();

            if (!empty($students)) {
                $class = SchoolClass::find($classId);
                $this->toastBroadcast(
                    "A new course '{$this->assigningCourseClass->name}' has been added to your class '{$class->name}'.",
                    $students,
                    'info',
                    'New Course Added'
                );
            }
        }

        $this->closeModals();
        $this->loadCourses();
    }

    public function toggleStatus($courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($course) {
            $newStatus = $course->status === 'active' ? 'archived' : 'active';
            $course->update(['status' => $newStatus]);

            $this->toastSuccess("Course {$newStatus} successfully!", 'Success');
            $this->loadCourses();
        }
    }

    public function deleteCourse($courseId)
    {
        $course = Course::where('id', $courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if ($course && $course->canBeEditedBy(auth()->user())) {
            $course->delete();
            $this->toastSuccess('Course deleted successfully!', 'Success');
            $this->loadCourses();
        } else {
            $this->toastError('Cannot delete this course.', 'Error');
        }
    }

    protected function autoEnrollClassStudentsInCourse($classId, $courseId)
    {
        $students = User::where('class_id', $classId)
            ->where('role', 'student')
            ->pluck('id');

        foreach ($students as $studentId) {
            DB::table('enrollments')->updateOrInsert(
                [
                    'student_id' => $studentId,
                    'course_id' => $courseId,
                ],
                [
                    'class_id' => $classId,
                    'enrolled_at' => now(),
                ]
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

    public function getAvailableClasses()
    {
        return SchoolClass::where('school_id', auth()->user()->school_id)
            ->orderBy('name')
            ->get();
    }

    public function resetCreateForm()
    {
        $this->createName = '';
        $this->createDescription = '';
        $this->createLecturerId = '';
    }

    public function closeModals()
    {
        $this->showCreateModal = false;
        $this->showEditModal = false;
        $this->showAssignLecturerModal = false;
        $this->showAssignClassModal = false;
        $this->editingCourse = null;
        $this->assigningCourse = null;
        $this->assigningCourseClass = null;
        $this->selectedLecturers = [];
        $this->selectedClasses = [];
        $this->resetCreateForm();
    }

    public function render()
    {
        return view('livewire.admin-course-management', [
            'availableLecturers' => $this->getAvailableLecturers(),
            'availableClasses' => $this->getAvailableClasses(),
        ]);
    }
}
