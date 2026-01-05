<?php

namespace App\Livewire;

use App\Models\Attendance;
use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class StudentAttendance extends Component
{
    public $attendanceRecords = [];
    public $attendanceStats = [];

    public function mount()
    {
        $this->loadAttendance();
    }

    public function loadAttendance()
    {
        $user = Auth::user();

        // Get enrolled course IDs for the student
        $enrolledCourseIds = DB::table('enrollments')
            ->where('student_id', $user->id)
            ->pluck('course_id');

        // Get attendance records using Eloquent to ensure casts are applied
        $this->attendanceRecords = Attendance::with(['course', 'lecturer'])
            ->where('student_id', $user->id)
            ->whereIn('course_id', $enrolledCourseIds)
            ->orderBy('date', 'desc')
            ->get();

        // Calculate attendance statistics per course
        $this->attendanceStats = DB::table('attendances')
            ->join('courses', 'attendances.course_id', '=', 'courses.id')
            ->where('attendances.student_id', $user->id)
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
            ->get();
    }

    public function render()
    {
        return view('livewire.student-attendance');
    }
}
