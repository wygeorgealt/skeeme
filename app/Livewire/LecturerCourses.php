<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasToastNotifications;

class LecturerCourses extends Component
{
    use HasToastNotifications;

    public $courses = [];
    public $stats = [];
    public $createdCourses = [];
    public $assignedCourses = [];
    public $sharingCourse = null;
    public $showShareModal = false;

    protected $listeners = ['courseCreated' => 'loadCourses'];

    public function mount()
    {
        $this->loadCourses();
    }

    public function loadCourses()
    {
        $user = Auth::user();

        // Get courses created by this lecturer
        $this->createdCourses = DB::table('courses')
            ->leftJoin('schools', 'courses.school_id', '=', 'schools.id')
            ->where('courses.created_by', $user->id)
            ->select(
                'courses.*',
                'schools.name as school_name',
                DB::raw('(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = courses.id) as enrollments_count'),
                DB::raw('(SELECT COUNT(*) FROM scheme_of_work WHERE scheme_of_work.course_id = courses.id) as topics_count')
            )
            ->orderBy('courses.created_at', 'desc')
            ->get()
            ->map(function ($course) {
                $course->created_at = \Carbon\Carbon::parse($course->created_at);
                return $course;
            });

        // Get courses assigned to this lecturer
        $this->assignedCourses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->leftJoin('schools', 'courses.school_id', '=', 'schools.id')
            ->where('course_lecturers.user_id', $user->id)
            ->select(
                'courses.*',
                'schools.name as school_name',
                DB::raw('(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = courses.id) as enrollments_count'),
                DB::raw('(SELECT COUNT(*) FROM scheme_of_work WHERE scheme_of_work.course_id = courses.id) as topics_count'),
                DB::raw('(SELECT COUNT(*) FROM exams WHERE exams.course_id = courses.id) as exams_count')
            )
            ->orderBy('courses.name')
            ->get();

        // Calculate stats based on assigned courses
        $this->stats = [
            'total_courses' => $this->assignedCourses->count(),
            'total_students' => DB::table('enrollments')
                ->join('course_lecturers', 'enrollments.course_id', '=', 'course_lecturers.course_id')
                ->where('course_lecturers.user_id', $user->id)
                ->distinct('enrollments.student_id')
                ->count(),
            'completion_rate' => 0,
        ];

        // Calculate average completion rate
        if ($this->assignedCourses->count() > 0) {
            $completionRates = [];
            foreach ($this->assignedCourses as $course) {
                $totalTopics = DB::table('scheme_of_work')->where('course_id', $course->id)->count();
                $completedTopics = DB::table('scheme_of_work')
                    ->where('course_id', $course->id)
                    ->where('status', 'completed')
                    ->count();
                $rate = $totalTopics > 0 ? ($completedTopics / $totalTopics) * 100 : 0;
                $completionRates[] = $rate;
            }
            $this->stats['completion_rate'] = round(array_sum($completionRates) / count($completionRates), 1);
        }
    }

    public function unassignCourse($courseId)
    {
        $user = Auth::user();

        DB::table('course_lecturers')
            ->where('course_id', $courseId)
            ->where('user_id', $user->id)
            ->delete();

        $this->loadCourses();
        $this->toastSuccess('Successfully unassigned from course.', 'Success');
    }

    public function shareCourse($courseId)
    {
        $this->sharingCourse = \App\Models\Course::find($courseId);
        $this->showShareModal = true;
    }

    public function closeShareModal()
    {
        $this->sharingCourse = null;
        $this->showShareModal = false;
    }

    public $courseIdToDelete = null;
    public $showDeleteModal = false;

    // ... (existing listeners, mount, etc)

    public function editCourse($courseId)
    {
        $this->dispatch('editCourse', id: $courseId);
    }

    public function deleteCourse($courseId)
    {
        $user = Auth::user();
        
        // Verify ownership before opening modal
        $course = DB::table('courses')
            ->where('id', $courseId)
            ->where('created_by', $user->id)
            ->first();

        if ($course) {
            $this->courseIdToDelete = $courseId;
            $this->showDeleteModal = true;
        }
    }

    public function confirmDelete()
    {
        if ($this->courseIdToDelete) {
            $user = Auth::user();
            
            DB::table('courses')
                ->where('id', $this->courseIdToDelete)
                ->where('created_by', $user->id)
                ->delete();

            $this->toastSuccess('Course deleted successfully.', 'Success');
            $this->loadCourses();
            $this->showDeleteModal = false;
            $this->courseIdToDelete = null;
        }
    }

    public function render()
    {
        return view('livewire.lecturer-courses');
    }
}
