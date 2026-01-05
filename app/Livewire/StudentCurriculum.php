<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasToastNotifications;
use Livewire\Attributes\Url;

class StudentCurriculum extends Component
{
    use HasToastNotifications;

    public $curriculum = [];
    #[Url]
    public $selectedCourse = '';
    public $courses = [];

    public function mount()
    {
        $this->loadCourses();
        $this->loadCurriculum();
    }

    public function loadCourses()
    {
        $user = Auth::user();

        $this->courses = DB::table('courses')
            ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->where('enrollments.student_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function loadCurriculum()
    {
        $user = Auth::user();

        $query = DB::table('scheme_of_work')
            ->join('courses', 'scheme_of_work.course_id', '=', 'courses.id')
            ->join('enrollments', function($join) use ($user) {
                $join->on('courses.id', '=', 'enrollments.course_id')
                     ->where('enrollments.student_id', $user->id);
            })
            ->select(
                'scheme_of_work.*',
                'courses.name as course_name',
                'courses.code as course_code'
            )
            ->orderBy('scheme_of_work.week_number');

        if ($this->selectedCourse) {
            $query->where('scheme_of_work.course_id', $this->selectedCourse);
        }

        $this->curriculum = $query->get();
    }

    public function updatedSelectedCourse()
    {
        $this->loadCurriculum();
    }

    protected $listeners = [
        'curriculumUpdated' => 'handleCurriculumUpdate',
    ];

    public function handleCurriculumUpdate($data)
    {
        // Refresh the curriculum data
        $this->loadCurriculum();
 
        // The toast notification is now handled globally by the ToastNotification component.
        // This method will simply refresh the data on the page.
    }

    public function render()
    {
        return view('livewire.student-curriculum');
    }
}
