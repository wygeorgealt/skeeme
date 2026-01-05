<?php

namespace App\Http\Controllers\Team\Analytics;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Enrollment;
use App\Models\AnalyticsSnapshot;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'week');
        
        $startDate = match($period) {
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            default => now()->subWeek(), // week
        };

        // Real data from database
        $signups = User::whereBetween('created_at', [$startDate, now()])->count();
        $activeUsers = User::where('status', 'active')->count();
        $totalRevenue = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$startDate, now()])
            ->sum('total_amount');
        
        $totalEnrollments = Enrollment::whereBetween('created_at', [$startDate, now()])->count();

        // Previous period for comparison
        $prevStartDate = $startDate->copy()->subtract($startDate->diffInDays(now()), 'day');
        $prevSignups = User::whereBetween('created_at', [$prevStartDate, $startDate])->count();
        $prevRevenue = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$prevStartDate, $startDate])
            ->sum('total_amount');

        // Calculate percentage changes
        $signupChange = $prevSignups > 0 ? (($signups - $prevSignups) / $prevSignups) * 100 : 0;
        $activeUsersChange = 12; // Placeholder for now
        $conversionRate = $totalEnrollments > 0 ? ($totalRevenue / ($totalEnrollments * 100)) : 0;
        $revenueChange = $prevRevenue > 0 ? (($totalRevenue - $prevRevenue) / $prevRevenue) * 100 : 0;

        // Get analytics data for charts
        $signupsByDay = $this->getSignupsByDay($startDate);
        $revenueByDay = $this->getRevenueByDay($startDate);
        $activityByDay = $this->getActivityByDay($startDate);
        $planDistribution = $this->getPlanDistribution();

        return view('team.analytics.dashboard', [
            'signups' => $signups,
            'signupChange' => round($signupChange, 1),
            'activeUsers' => $activeUsers,
            'activeUsersChange' => $activeUsersChange,
            'conversionRate' => round($conversionRate, 1),
            'totalRevenue' => $totalRevenue,
            'revenueChange' => round($revenueChange, 1),
            'period' => $period,
            'signupsByDay' => $signupsByDay,
            'revenueByDay' => $revenueByDay,
            'activityByDay' => $activityByDay,
            'planDistribution' => $planDistribution,
        ]);
    }

    private function getSignupsByDay($startDate)
    {
        $users = User::whereBetween('created_at', [$startDate, now()])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $users->pluck('count')->toArray();
    }

    private function getRevenueByDay($startDate)
    {
        $invoices = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$startDate, now()])
            ->selectRaw('DATE(paid_at) as date, SUM(total_amount) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $invoices->pluck('amount')->toArray();
    }

    private function getActivityByDay($startDate)
    {
        $enrollments = Enrollment::whereBetween('created_at', [$startDate, now()])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $enrollments->pluck('count')->toArray();
    }

    private function getPlanDistribution()
    {
        $plans = User::selectRaw('COUNT(*) as count')
            ->groupBy('role')
            ->get()
            ->toArray();

        return $plans;
    }
}
