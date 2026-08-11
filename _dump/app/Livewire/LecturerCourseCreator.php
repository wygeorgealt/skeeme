<?php

namespace App\Livewire;

use App\Models\Course;
use Livewire\Component;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasToastNotifications;

class LecturerCourseCreator extends Component
{
    use HasToastNotifications;

    public $courseName = '';
    public $courseDescription = '';
    public $showModal = false;

    protected $rules = [
        'courseName' => 'required|string|max:255',
        'courseDescription' => 'nullable|string|max:1000',
    ];

    public $courseId = null;
    public $isEditing = false;

    protected $listeners = ['editCourse'];

    public function editCourse($id)
    {
        $this->resetValidation();
        $user = Auth::user();
        
        $course = Course::where('id', $id)
            ->where('created_by', $user->id)
            ->firstOrFail();

        $this->courseId = $course->id;
        $this->courseName = $course->name;
        $this->courseDescription = $course->description;
        $this->isEditing = true;
        $this->showModal = true;
    }

    public function cancel()
    {
        $this->reset();
        $this->showModal = false;
    }

    public function saveCourse()
    {
        $this->validate();

        $user = Auth::user();

        // Verify lecturer can create courses
        if (!$user->canCreateCourse()) {
            $this->toastError('You do not have permission to create courses', 'Permission Denied');
            return;
        }

        if ($this->isEditing) {
            $course = Course::where('id', $this->courseId)
                ->where('created_by', $user->id)
                ->firstOrFail();

            $course->update([
                'name' => $this->courseName,
                'description' => $this->courseDescription,
            ]);

            $this->toastSuccess('Course updated successfully!', 'Course Updated');
        } else {
            $code = Course::generateCourseCode($this->courseName);
            $courseLink = Course::generateCourseLink();

            $course = Course::create([
                'name' => $this->courseName,
                'description' => $this->courseDescription,
                'code' => $code,
                'course_link' => $courseLink,
                'school_id' => $user->school_id,
                'created_by' => $user->id,
                'status' => 'active',
            ]);

            $this->toastSuccess(
                'Course created successfully! Admin will assign it to classes.',
                'Course Created'
            );
        }

        $this->reset();
        $this->showModal = false;
        $this->dispatch('courseCreated'); // Reuse this event to reload list
    }

    public function render()
    {
        return view('livewire.lecturer-course-creator');
    }
}
