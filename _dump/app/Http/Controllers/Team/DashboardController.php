<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\ErrorLog;
use App\Models\Announcement;
use App\Models\Contact;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function index()
    {
        $teamMember = auth()->user()->teamMember;

        // Basic metrics
        $metrics = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'total_schools' => User::where('role', 'admin')->distinct('school_id')->count(),
            'total_subscriptions' => Subscription::count(),
            'active_subscriptions' => Subscription::where('is_active', true)->count(),
        ];

        // This month metrics
        $thisMonth = now()->startOfMonth();
        $metrics['signups_this_month'] = User::where('created_at', '>=', $thisMonth)->count();
        $metrics['revenue_this_month'] = Payment::where('status', 'completed')
            ->where('created_at', '>=', $thisMonth)
            ->sum('amount');

        // Last 7 days data for charts
        $last7Days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            $last7Days->push([
                'date' => $date->format('M d'),
                'signups' => User::where('created_at', '>=', $date)
                    ->where('created_at', '<', $date->addDay())
                    ->count(),
            ]);
        }

        // Recent errors
        $recentErrors = ErrorLog::where('is_resolved', false)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Recent critical payments
        $failedPayments = Payment::where('status', 'failed')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // System announcements (latest)
        $announcements = Announcement::orderByDesc('published_at')
            ->limit(8)
            ->get();

        // Contact us messages (latest)
        $contactMessages = Contact::orderByDesc('created_at')
            ->limit(8)
            ->get();

        return view('team.dashboard.index', [
            'metrics' => $metrics,
            'last7Days' => $last7Days,
            'recentErrors' => $recentErrors,
            'failedPayments' => $failedPayments,
            'announcements' => $announcements,
            'contactMessages' => $contactMessages,
            'teamMember' => $teamMember,
        ]);
    }
}
