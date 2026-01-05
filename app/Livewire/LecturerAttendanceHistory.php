<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LecturerAttendanceHistory extends Component
{
    public $attendanceRecords = [];
    public $selectedCourse = '';
    public $courses = [];

    public function mount()
    {
        $this->loadCourses();
        $this->loadAttendanceHistory();
    }

    public function loadCourses()
    {
        $user = Auth::user();
        $this->courses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function loadAttendanceHistory()
    {
        $user = Auth::user();
        $query = DB::table('attendances')
            ->join('courses', 'attendances.course_id', '=', 'courses.id')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->leftJoin('users as students', 'attendances.student_id', '=', 'students.id')
            ->where('course_lecturers.user_id', $user->id)
            ->select(
                'attendances.*',
                'courses.name as course_name',
                'courses.code as course_code',
                DB::raw('CONCAT(students.first_name, " ", students.last_name) as student_name'),
                'students.email as student_email'
            )
            ->orderBy('attendances.date', 'desc')
            ->orderBy('courses.name');

        if ($this->selectedCourse) {
            $query->where('attendances.course_id', $this->selectedCourse);
        }

        $this->attendanceRecords = $query->get();
    }

    public function updatedSelectedCourse()
    {
        $this->loadAttendanceHistory();
    }

    public function render()
    {
        return view('livewire.lecturer-attendance-history');
    }
}
