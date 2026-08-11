<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Subscription;


class AdminDashboard extends Component
{
    public $stats = [];
    public $recent_activities = [];
    public $classes = [];
    public $announcements = [];
    public $schoolSettings = null;
    public $subscription = null;
    public $days_left = null;
    public $student_limit_reached = false;
    public $subscription_expired = false;
    public $processingRenewal = false;
    public $payment_analytics = [];
    public $revenue_summary = [];
    public $subscription_metrics = [];
    public $payment_health = [];
    public $onlineUsers = [];

    public function mount()
    {
        $this->loadDashboardData();
    }

    public function loadDashboardData()
    {
        $user = Auth::user();
        $school_id = $user->school_id;

        // Get school settings
        $this->schoolSettings = DB::table('schools')->where('id', $school_id)->first();

        if (!$this->schoolSettings) {
            abort(403, 'School not found for your account. Please contact support.');
        }

        // Get subscription info
        $this->subscription = $user->school->activeSubscription;
        $this->days_left = ($this->subscription && !$this->subscription->isFree()) ? $this->subscription->daysRemaining() : null;
        $this->student_limit_reached = $this->subscription ? !$user->school->canAddStudents(0) : false;
        $this->subscription_expired = ($this->subscription && !$this->subscription->isFree()) ? $this->subscription->isExpired() : false;

        // Enhanced Stats
        $this->stats = [
            'total_students' => DB::table('users')->where('school_id', $school_id)->where('role', 'student')->where('status', 'active')->count(),
            'total_lecturers' => DB::table('users')->where('school_id', $school_id)->where('role', 'lecturer')->where('status', 'active')->count(),
            'total_classes' => DB::table('classes')->where('school_id', $school_id)->count(),
            'total_courses' => DB::table('courses')->where('school_id', $school_id)->count(),
            'pending_lecturers' => DB::table('users')->where('school_id', $school_id)->where('role', 'lecturer')->where('status', 'pending')->count(),
            'recent_enrollments' => DB::table('enrollments')
                ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                ->where('courses.school_id', $school_id)
                ->where('enrollments.enrolled_at', '>=', now()->subDays(30))
                ->count(),
        ];

        // Calculate MoM growth for students
        $current_month_students = DB::table('users')
            ->where('school_id', $school_id)
            ->where('role', 'student')
            ->where('status', 'active')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
        $previous_month_students = DB::table('users')
            ->where('school_id', $school_id)
            ->where('role', 'student')
            ->where('status', 'active')
            ->whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])
            ->count();
        $this->stats['students_mom_growth'] = $previous_month_students > 0 ? round((($current_month_students - $previous_month_students) / $previous_month_students) * 100, 1) : 0;

        // Calculate active students this week (based on recent enrollments or logins if available)
        $this->stats['active_students_week'] = DB::table('enrollments')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->where('courses.school_id', $school_id)
            ->where('enrollments.enrolled_at', '>=', now()->subDays(7))
            ->distinct('enrollments.student_id')
            ->count();

        // Calculate new lecturers this month
        $this->stats['new_lecturers_month'] = DB::table('users')
            ->where('school_id', $school_id)
            ->where('role', 'lecturer')
            ->where('status', 'active')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        // Calculate draft courses (assuming status field exists, otherwise count all as published)
        $this->stats['draft_courses'] = DB::table('courses')
            ->where('school_id', $school_id)
            ->where('status', 'draft')
            ->count();

        // Calculate engagement rate
        $total_possible_enrollments = $this->stats['total_students'] * $this->stats['total_courses'];
        $this->stats['engagement_rate'] = $total_possible_enrollments > 0 ? round(($this->stats['recent_enrollments'] / $total_possible_enrollments) * 100, 1) : 0;

        // Calculate average session time (if sessions table has last_activity or similar)
        // For now, use a mock calculation based on engagement
        $this->stats['avg_session_time'] = $this->stats['engagement_rate'] > 0 ? round($this->stats['engagement_rate'] * 0.3, 0) : 0; // minutes

        // Recent activities
        $this->recent_activities = collect(DB::select("
            SELECT 'enrollment' as type, u.first_name, u.last_name, c.name as course_name, e.enrolled_at as created_at,
                   'success' as status_color, 'fa-user-plus' as icon
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE c.school_id = ?
            UNION ALL
            SELECT 'user_registration' as type, u.first_name, u.last_name, u.role as course_name, u.created_at,
                   CASE u.role
                       WHEN 'lecturer' THEN 'info'
                       WHEN 'student' THEN 'primary'
                       ELSE 'secondary'
                   END as status_color,
                   CASE u.role
                       WHEN 'lecturer' THEN 'fa-chalkboard-teacher'
                       WHEN 'student' THEN 'fa-user-graduate'
                       ELSE 'fa-user'
                   END as icon
            FROM users u
            WHERE u.school_id = ? AND u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER by created_at DESC LIMIT 18
        ", [$school_id, $school_id]));

        // Get classes
        $this->classes = collect(DB::table('classes')
            ->leftJoin('users', function($join) {
                $join->on('users.class_id', '=', 'classes.id')
                     ->where('users.role', '=', 'student')
                     ->where('users.status', '=', 'active');
            })
            ->leftJoin('class_courses', function($join) {
                $join->on('class_courses.class_id', '=', 'classes.id');
            })
            ->leftJoin('courses', 'class_courses.course_id', '=', 'courses.id')
            ->where('classes.school_id', $school_id)
            ->select('classes.*', DB::raw('COUNT(DISTINCT users.id) as student_count'), DB::raw('GROUP_CONCAT(DISTINCT courses.name SEPARATOR \', \') as courses'))
            ->groupBy('classes.id')
            ->orderBy('classes.created_at', 'desc')
            ->get());

        // Fetch announcements
        $this->announcements = collect(DB::table('announcements')
            ->join('users', 'announcements.sender_id', '=', 'users.id')
            ->where('announcements.school_id', $school_id)
            ->select('announcements.*', 'users.first_name', 'users.last_name')
            ->orderBy('announcements.created_at', 'desc')
            ->get());

        // Load payment analytics
        $analyticsService = app(\App\Services\PaymentAnalyticsService::class);
        $this->revenue_summary = $analyticsService->getRevenueSummary($school_id, 30);
        $this->payment_health = $analyticsService->getPaymentHealthMetrics($school_id);
        $this->subscription_metrics = $analyticsService->getSubscriptionMetrics($school_id);

        // Fetch Online Users
        $this->fetchOnlineUsers();
    }

    /**
     * Fetch users who are currently online (active in the last 5 minutes)
     */
    public function fetchOnlineUsers()
    {
        $school_id = Auth::user()->school_id;
        $current_user_id = Auth::id();

        // Query the sessions table to find active users
        $this->onlineUsers = DB::table('sessions')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->where('users.school_id', $school_id)
            ->where('users.id', '!=', $current_user_id)
            ->where('sessions.last_activity', '>=', now()->subMinutes(5)->getTimestamp())
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'users.role',
                'users.email',
                'sessions.last_activity'
            )
            ->get()
            // Ensure unique users (a user might have multiple sessions)
            ->unique('id')
            ->values();
    }




    public function resetStudentPassword($student_id)
    {
        $user = Auth::user();
        $student = DB::table('users')
            ->where('id', $student_id)
            ->where('school_id', $user->school_id)
            ->where('role', 'student')
            ->where('status', 'active')
            ->first();

        if ($student) {
            DB::table('users')->where('id', $student_id)->update([
                'password' => bcrypt('password123')
            ]);

            // Log the password reset
            DB::table('security_logs')->insert([
                'user_id' => $user->id,
                'action' => 'Admin password reset for student',
                'details' => "Student: {$student->first_name} {$student->last_name} (ID: $student_id)",
                'created_at' => now()
            ]);

            session()->flash('message', "Password for {$student->first_name} {$student->last_name} has been reset to 'password123'.");
        } else {
            session()->flash('error', 'Student not found or access denied.');
        }

        $this->loadDashboardData();
    }

    public function bulkResetPasswords($student_ids)
    {
        $user = Auth::user();
        $success_count = 0;
        $failed_count = 0;

        foreach ($student_ids as $student_id) {
            $student = DB::table('users')
                ->where('id', $student_id)
                ->where('school_id', $user->school_id)
                ->where('role', 'student')
                ->where('status', 'active')
                ->first();

            if ($student) {
                DB::table('users')->where('id', $student_id)->update([
                    'password' => bcrypt('password123')
                ]);
                $success_count++;
            } else {
                $failed_count++;
            }
        }

        // Log the bulk password reset
        DB::table('security_logs')->insert([
            'user_id' => $user->id,
            'action' => 'Bulk password reset for students',
            'details' => "Success: $success_count, Failed: $failed_count",
            'created_at' => now()
        ]);

        if ($success_count > 0) {
            session()->flash('message', "Successfully reset passwords for $success_count student(s) to 'password123'.");
        }
        if ($failed_count > 0) {
            session()->flash('warning', "$failed_count student(s) could not be processed.");
        }

        $this->loadDashboardData();
    }

    public function saveSettings($data)
    {
        $user = Auth::user();

        DB::table('schools')->where('id', $user->school_id)->update([
            'name' => $data['name'],
            'address' => $data['address'] ?? '',
            'email' => $data['email'] ?? '',
            'phone' => $data['phone'] ?? '',
            'academic_year' => $data['academic_year'] ?? '',
            'allow_student_password_change' => isset($data['allow_student_password_change']) ? 1 : 0,
        ]);

        session()->flash('message', 'Settings saved successfully!');
        $this->loadDashboardData();
    }

    public function render()
    {
        return view('livewire.admin-dashboard');
    }

    /**
     * Navigate to subscription and billing page
     */
    public function goToSubscriptionBilling()
    {
        return redirect()->route('settings.subscription-billing');
    }

    /**
     * Format activity type for display with role specification
     */
    public function getActivityLabel($activity)
    {
        $labels = [
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
}
