<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Traits\HasToastNotifications;
use App\Notifications\StudentEnrollment;

class LecturerDashboard extends Component
{
    use HasToastNotifications;

    /** @var \Illuminate\Support\Collection|null */
    public $courses;
    public $stats = [];
    public $recent_activities = [];
    public $announcements = [];
    public $lecturer = null;
    public $school = null;
    public $totalStudents = 0;
    public $coursesWithRep = 0;
    public $coursesWithoutRep = 0;
    public $selectedCourseId = null;
    public $selectedCourse = null;
    public $showViewModal = false;
    public $selectedAnnouncement = null;
    public $showCalendar = false;
    /** @var \Illuminate\Support\Collection|null */
    public $enrolledStudents;

    public function mount()
    {
        $this->loadDashboardData();
    }

    public function loadDashboardData()
    {
        $user = Auth::user();
        $this->lecturer = $user;
        $this->school = $user->school;

        // Fetch courses taught by the lecturer
        $this->courses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->leftJoin('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->leftJoin('course_lecturers as cl2', function($join) use ($user) {
                $join->on('courses.id', '=', 'cl2.course_id')
                     ->where('cl2.user_id', '!=', $user->id);
            })
            ->leftJoin('users as other_lecturers', 'cl2.user_id', '=', 'other_lecturers.id')
            ->where('course_lecturers.user_id', $user->id)
            ->select(
                'courses.*',
                DB::raw('COUNT(DISTINCT enrollments.student_id) as student_count'),
                DB::raw('GROUP_CONCAT(DISTINCT other_lecturers.first_name, " ", other_lecturers.last_name SEPARATOR ", ") as other_lecturers')
            )
            ->groupBy('courses.id')
            ->orderBy('courses.created_at', 'desc')
            ->get();

        // Get total students across all lecturer's courses
        $this->totalStudents = DB::table('enrollments')
            ->join('course_lecturers', 'enrollments.course_id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->distinct('enrollments.student_id')
            ->count('enrollments.student_id');

        // Get number of courses with appointed representatives
        $this->coursesWithRep = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->whereNotNull('courses.course_rep_id')
            ->count();

        // Get number of courses without appointed representatives
        $this->coursesWithoutRep = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->whereNull('courses.course_rep_id')
            ->count();

        // Enhanced stats
        $this->stats = [
            'total_courses' => $this->courses->count(),
            'total_students' => $this->totalStudents,
            'avg_class_size' => $this->courses->count() > 0 ? round($this->totalStudents / $this->courses->count(), 1) : 0,
            'active_students_percentage' => $this->totalStudents > 0 ? round(($this->totalStudents / $this->totalStudents) * 100) : 0,
            'draft_courses' => 0, // Placeholder, assuming no draft logic yet
        ];

        // Recent activities
        $this->recent_activities = collect(DB::select("
            SELECT 'course_update' as type, c.name AS course_name, c.updated_at AS created_at, 'Course Updated' as title, c.name as description,
                   u.first_name, u.last_name
            FROM courses c
            JOIN course_lecturers cl ON c.id = cl.course_id
            JOIN users u ON u.id = cl.user_id
            WHERE cl.user_id = ? AND c.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC LIMIT 10
        ", [$user->id]));

        // Fetch announcements
        $this->announcements = DB::table('announcements')
            ->join('users', 'announcements.sender_id', '=', 'users.id')
            ->where('announcements.school_id', $user->school_id)
            ->where(function($query) {
                $query->where('target_type', 'all_lecturers')
                      ->orWhere('target_type', 'all');
            })
            ->select('announcements.*', 'users.first_name', 'users.last_name')
            ->orderBy('announcements.created_at', 'desc')
            ->get();


    }

    public function openAnnouncement($id)
    {
        $announcement = DB::table('announcements')
            ->leftJoin('users', 'announcements.sender_id', '=', 'users.id')
            ->where('announcements.id', $id)
            ->where('announcements.school_id', Auth::user()->school_id)
            ->select('announcements.*', 'users.first_name', 'users.last_name')
            ->first();

        if ($announcement) {
            $this->selectedAnnouncement = [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'published_at' => $announcement->published_at,
                'first_name' => $announcement->first_name ?? 'Unknown',
                'last_name' => $announcement->last_name ?? '',
            ];
            $this->showViewModal = true;
        }
    }

    public function closeViewModal()
    {
        $this->showViewModal = false;
        $this->selectedAnnouncement = null;
    }

    /**
     * Format activity type for display with role specification
     */
    public function getActivityLabel($activity)
    {
        $labels = [
            'course_update' => 'Course Updated',
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
        return view('livewire.lecturer-dashboard');
    }
}
