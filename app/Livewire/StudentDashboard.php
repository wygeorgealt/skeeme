<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentDashboard extends Component
{
    public $courses;
    public $stats = [];
    public $recent_activities = [];
    public $announcements = [];
    public $student = null;
    public $currentPage = 1;
    public $perPage = 3;
    public $showViewModal = false;
    public $viewAnnouncement = null;
    private $allCourses = [];

    public function mount()
    {
        $this->loadDashboardData();
    }

    public function loadDashboardData()
    {
        $user = Auth::user();
        $this->student = $user;

        // Fetch all enrolled courses with progress for stats
        $allCoursesQuery = DB::table('courses')
            ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->leftJoin('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->leftJoin('users as lecturers', 'course_lecturers.user_id', '=', 'lecturers.id')
            ->leftJoin('scheme_of_work', 'courses.id', '=', 'scheme_of_work.course_id')
            ->leftJoin('grades', function($join) use ($user) {
                $join->on('courses.id', '=', 'grades.course_id')
                     ->where('grades.student_id', $user->id);
            })
            ->where('enrollments.student_id', $user->id)
            ->select(
                'courses.*',
                'enrollments.enrolled_at',
                DB::raw('GROUP_CONCAT(DISTINCT lecturers.first_name, " ", lecturers.last_name SEPARATOR ", ") as lecturer_names'),
                DB::raw('COUNT(DISTINCT scheme_of_work.id) as total_topics'),
                DB::raw('COUNT(DISTINCT CASE WHEN scheme_of_work.status = "completed" THEN scheme_of_work.id END) as completed_topics'),
                DB::raw('AVG(grades.score) as average_grade')
            )
            ->groupBy('courses.id', 'enrollments.enrolled_at')
            ->orderBy('enrollments.enrolled_at', 'desc');

        $this->allCourses = $allCoursesQuery->get();

        // Set courses to collection for view (limit to 4 for display)
        $this->courses = $this->allCourses->take(4);

        // Enhanced stats
        $this->stats = [
            'total_courses' => $this->allCourses->count(),
            'overall_progress' => 0,
            'gpa' => null,
        ];

        // Calculate overall progress
        $total_topics = $this->allCourses->sum('total_topics');
        $completed_topics = $this->allCourses->sum('completed_topics');
        $this->stats['overall_progress'] = $total_topics > 0 ? round(($completed_topics / $total_topics) * 100, 1) : 0;

        // Calculate GPA
        $grades = $this->allCourses->pluck('average_grade')->filter()->values();
        $this->stats['gpa'] = $grades->count() > 0 ? round($grades->avg(), 2) : null;

        // Recent activities
        $this->recent_activities = collect(DB::select("
            SELECT 'course_enrollment' as type, c.name as course_name, e.enrolled_at as created_at
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ? AND e.enrolled_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER by created_at DESC LIMIT 4
        ", [$user->id]));

        // Check if student is course rep
        $repCourses = DB::table('courses')
            ->where('course_rep_id', $user->id)
            ->pluck('name')
            ->toArray();

        $this->stats['rep_courses'] = $repCourses;

        // Fetch announcements
        $this->announcements = collect(DB::table('announcements')
            ->join('users', 'announcements.sender_id', '=', 'users.id')
            ->where('announcements.school_id', $user->school_id)
            ->where(function($query) {
                $query->where('target_type', 'all_students')
                      ->orWhere('target_type', 'all');
            })
            ->select('announcements.*', 'users.first_name', 'users.last_name')
            ->orderBy('announcements.created_at', 'desc')
            ->get());
    }

    public function updatedCurrentPage()
    {
        $this->loadDashboardData();
    }

    public function getCoursesProperty()
    {
        if (!$this->courses) {
            $this->loadDashboardData();
        }
        return $this->courses;
    }

    public function viewAnnouncement($id)
    {
        $announcement = DB::table('announcements')
            ->leftJoin('users', 'announcements.sender_id', '=', 'users.id')
            ->where('announcements.id', $id)
            ->where('announcements.school_id', Auth::user()->school_id)
            ->select('announcements.*', 'users.first_name', 'users.last_name')
            ->first();

        if ($announcement) {
            $this->viewAnnouncement = (array) $announcement;
            $this->showViewModal = true;
        }
    }

    public function closeViewModal()
    {
        $this->showViewModal = false;
        $this->viewAnnouncement = null;
    }

    /**
     * Format activity type for display with role specification
     */
    public function getActivityLabel($activity)
    {
        $labels = [
            'course_enrollment' => 'Course Enrollment',
            'enrollment' => 'Course Published',
            'user_registration' => function($activity) {
                if (!isset($activity->role)) {
                    return 'User Registration';
                }
                $roleLabels = [
                    'lecturer' => 'Lecturer Registration',
                    'student' => 'Student Registration',
                    'admin' => 'Admin Registration',
                    'head' => 'Head Registration'
                ];
                return $roleLabels[$activity->role] ?? ucwords(str_replace('_', ' ', $activity->role)) . ' Registration';
            }
        ];

        if (isset($labels[$activity->type])) {
            $label = $labels[$activity->type];
            return is_callable($label) ? $label($activity) : $label;
        }

        return ucwords(str_replace('_', ' ', $activity->type));
    }

    public function render()
    {
        return view('livewire.student-dashboard');
    }
}
