<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use App\Traits\HasToastNotifications;

class LecturerAttendance extends Component
{
    use HasToastNotifications;

    public $courses = [];
    public $selectedCourse = null;
    public $students = [];
    public $attendanceDate;
    public $showAttendanceForm = false;

    public function mount()
    {
        $this->loadCourses();
        $this->attendanceDate = now()->format('Y-m-d');
    }

    public function loadCourses()
    {
        $user = Auth::user();

        $this->courses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->leftJoin('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->select(
                'courses.id',
                'courses.name',
                'courses.code',
                DB::raw('COUNT(DISTINCT enrollments.student_id) as enrollments_count')
            )
            ->groupBy('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function selectCourse($courseId)
    {
        $this->selectedCourse = $courseId;
        $this->loadStudents();
        $this->showAttendanceForm = true;
    }

    public function loadStudents()
    {
        if (!$this->selectedCourse) return;

        $this->students = DB::table('users')
            ->join('enrollments', 'users.id', '=', 'enrollments.student_id')
            ->where('enrollments.course_id', $this->selectedCourse)
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.email')
            ->orderBy('users.first_name')
            ->get()
            ->map(function ($student) {
                $existingAttendance = Attendance::where('course_id', $this->selectedCourse)
                    ->where('student_id', $student->id)
                    ->where('date', $this->attendanceDate)
                    ->first();

                $student->attendance_status = $existingAttendance ? $existingAttendance->status : 'present';
                return $student;
            });
    }

    public function updatedAttendanceDate()
    {
        if ($this->selectedCourse) {
            $this->loadStudents();
        }
    }

    public function takeAttendance()
    {
        $this->validate([
            'attendanceDate' => 'required|date',
            'selectedCourse' => 'required',
        ]);

        foreach ($this->students as $student) {
            Attendance::updateOrCreate(
                [
                    'course_id' => $this->selectedCourse,
                    'student_id' => $student->id,
                    'date' => $this->attendanceDate,
                ],
                [
                    'lecturer_id' => Auth::id(),
                    'status' => $student->attendance_status,
                ]
            );
        }

        $this->toastSuccess('Attendance recorded successfully!', 'Success');
        $this->showAttendanceForm = false;
        $this->selectedCourse = null;
    }

    public function viewHistory()
    {
        // This would redirect to attendance history view
        return redirect()->route('lecturer.attendance.history');
    }

    public function render()
    {
        return view('livewire.lecturer-attendance');
    }
}
