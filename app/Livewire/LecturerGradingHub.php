<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Auth;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamSession;
use Livewire\Attributes\Layout;

#[Layout('team.layout')]
class LecturerGradingHub extends Component
{
    public $selectedCourseId = null;

    public function mount()
    {
        // Default to first course with pending items if available
        $firstActionableCourse = $this->courses->first(function($course) {
            return $course->pending_count > 0;
        });
        
        if ($firstActionableCourse) {
            $this->selectedCourseId = $firstActionableCourse->id;
        } elseif ($this->courses->isNotEmpty()) {
            $this->selectedCourseId = $this->courses->first()->id;
        }
    }

    public function getCoursesProperty()
    {
        return Auth::user()->courses()
            ->withCount(['exams as pending_count' => function ($query) {
                $query->whereHas('sessions', function ($q) {
                    $q->whereIn('status', ['submitted', 'graded']);
                });
            }])
            ->get();
    }

    public function getExamsProperty()
    {
        if (!$this->selectedCourseId) {
            return collect();
        }

        return Exam::where('course_id', $this->selectedCourseId)
            ->withCount(['sessions as submitted_count' => function ($query) {
                $query->where('status', 'submitted');
            }])
            ->withCount(['sessions as graded_count' => function ($query) {
                $query->where('status', 'graded');
            }])
            ->having('submitted_count', '>', 0)
            ->orHaving('graded_count', '>', 0)
            ->get();
    }

    public function render()
    {
        return view('livewire.lecturer-grading-hub');
    }
}
