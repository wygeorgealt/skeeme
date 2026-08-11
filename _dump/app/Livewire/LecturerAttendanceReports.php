<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LecturerAttendanceReports extends Component
{
    public $reports = [];
    public $selectedCourse = '';
    public $courses = [];
    public $startDate = '';
    public $endDate = '';

    public function mount()
    {
        $this->loadCourses();
        $this->generateReport();
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

    public function generateReport()
    {
        $user = Auth::user();
        $query = DB::table('attendances')
            ->join('courses', 'attendances.course_id', '=', 'courses.id')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->select(
                'courses.name as course_name',
                'courses.code as course_code',
                DB::raw('COUNT(*) as total_sessions'),
                DB::raw('SUM(CASE WHEN attendances.status = "present" THEN 1 ELSE 0 END) as present_count'),
                DB::raw('SUM(CASE WHEN attendances.status = "absent" THEN 1 ELSE 0 END) as absent_count'),
                DB::raw('SUM(CASE WHEN attendances.status = "late" THEN 1 ELSE 0 END) as late_count'),
                DB::raw('ROUND((SUM(CASE WHEN attendances.status = "present" THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as attendance_percentage')
            )
            ->groupBy('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name');

        if ($this->selectedCourse) {
            $query->where('attendances.course_id', $this->selectedCourse);
        }

        if ($this->startDate && $this->endDate) {
            $query->whereBetween('attendances.date', [$this->startDate, $this->endDate]);
        }

        $this->reports = $query->get();
    }

    public function updatedSelectedCourse()
    {
        $this->generateReport();
    }

    public function updatedStartDate()
    {
        $this->generateReport();
    }

    public function updatedEndDate()
    {
        $this->generateReport();
    }

    public function render()
    {
        return view('livewire.lecturer-attendance-reports');
    }
}
