<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasToastNotifications;
use App\Models\Course;
use App\Models\User;
use App\Notifications\CourseRepAssigned;

class LecturerCourseReps extends Component
{
    use HasToastNotifications;

    public $showAssignModal = false;
    public $selectedCourseId = null;
    public $search = '';
    
    protected $queryString = ['search'];

    public function mount()
    {
        //
    }

    public function getCoursesProperty()
    {
        $user = Auth::user();
        
        return Course::whereHas('lecturers', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['courseRep', 'enrolledStudents'])
            ->withCount('enrolledStudents')
            ->when($this->search, function($query) {
                $query->where(function($q) {
                    $q->where('name', 'like', '%' . $this->search . '%')
                      ->orWhere('code', 'like', '%' . $this->search . '%');
                });
            })
            ->orderBy('name')
            ->get();
    }

    public function openAssignModal($courseId)
    {
        $this->selectedCourseId = $courseId;
        $this->showAssignModal = true;
    }

    public function closeAssignModal()
    {
        $this->showAssignModal = false;
        $this->selectedCourseId = null;
    }

    public function getAvailableStudentsProperty()
    {
        if (!$this->selectedCourseId) return collect();

        $course = Course::find($this->selectedCourseId);
        if (!$course) return collect();

        return $course->enrolledStudents()
            ->where('role', 'student')
            ->orderBy('first_name')
            ->get();
    }

    public function assignRep($studentId)
    {
        $course = Course::find($this->selectedCourseId);
        $student = User::find($studentId);

        if (!$course || !$student) {
            $this->toastError('Unable to assign representative.', 'Error');
            return;
        }

        // Ensure lecturer teaches this course
        if (!$course->hasLecturer(Auth::user())) {
            $this->toastError('You are not authorized to manage this course.', 'Unauthorized');
            return;
        }

        $course->update(['course_rep_id' => $studentId]);
        
        // Notify student
        $student->notify(new CourseRepAssigned($course));

        $this->toastSuccess("{$student->name} assigned as rep for {$course->name}.", 'Assigned');
        $this->closeAssignModal();
    }

    public function removeRep($courseId)
    {
        $course = Course::find($courseId);
        if (!$course || !$course->hasLecturer(Auth::user())) {
            $this->toastError('Unable to remove representative.', 'Error');
            return;
        }

        $course->update(['course_rep_id' => null]);
        $this->toastSuccess('Course representative removed.', 'Removed');
    }

    public function render()
    {
        return view('livewire.lecturer-course-reps', [
            'courses' => $this->courses,
            'availableStudents' => $this->availableStudents,
        ]);
    }
}
