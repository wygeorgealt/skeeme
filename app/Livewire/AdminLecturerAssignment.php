<?php

namespace App\Livewire;

use App\Models\Course;
use App\Models\User;
use Livewire\Component;
use Illuminate\Support\Facades\DB;
use App\Traits\HasToastNotifications;

class AdminLecturerAssignment extends Component
{
    use HasToastNotifications;

    public $courseId;
    public $course = null;
    public $assignedLecturers = [];
    public $availableLecturers = [];

    // Add Lecturer Modal
    public $showAddModal = false;
    public $selectedLecturerId = '';

    public function mount($courseId)
    {
        $this->courseId = $courseId;
        $this->loadData();
    }

    public function loadData()
    {
        $this->course = Course::with(['lecturers', 'creator'])
            ->where('id', $this->courseId)
            ->where('school_id', auth()->user()->school_id)
            ->first();

        if (!$this->course) {
            abort(404, 'Course not found.');
        }

        $this->assignedLecturers = $this->course->lecturers;
        $this->loadAvailableLecturers();
    }

    public function loadAvailableLecturers()
    {
        $assignedIds = $this->assignedLecturers->pluck('id');
        $this->availableLecturers = User::where('school_id', auth()->user()->school_id)
            ->where('role', 'lecturer')
            ->whereNotIn('id', $assignedIds)
            ->orderBy('first_name')
            ->get();
    }

    public function openAddModal()
    {
        $this->showAddModal = true;
    }

    public function addLecturer()
    {
        $this->validate([
            'selectedLecturerId' => 'required|exists:users,id',
        ]);

        // Check if already assigned
        $alreadyAssigned = DB::table('course_lecturers')
            ->where('course_id', $this->courseId)
            ->where('lecturer_id', $this->selectedLecturerId)
            ->exists();

        if ($alreadyAssigned) {
            $this->toastError('Lecturer already assigned to this course.', 'Error');
            return;
        }

        DB::table('course_lecturers')->insert([
            'course_id' => $this->courseId,
            'lecturer_id' => $this->selectedLecturerId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->toastSuccess('Lecturer assigned successfully!', 'Success');
        $this->closeModals();
        $this->loadData();
    }

    public function removeLecturer($lecturerId)
    {
        DB::table('course_lecturers')
            ->where('course_id', $this->courseId)
            ->where('lecturer_id', $lecturerId)
            ->delete();

        $this->toastSuccess('Lecturer removed from course.', 'Success');
        $this->loadData();
    }

    public function closeModals()
    {
        $this->showAddModal = false;
        $this->selectedLecturerId = '';
    }

    public function render()
    {
        return view('livewire.admin-lecturer-assignment');
    }
}
