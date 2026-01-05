<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentAnalyticsService
{
    /**
     * Get revenue summary for dashboard
     */
    public function getRevenueSummary(int $schoolId = null, int $daysBack = 30): array
    {
        $query = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [now()->subDays($daysBack), now()]);

        if ($schoolId) {
            $query->whereHas('subscription', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        $payments = $query->get();

        // Calculate totals
        $totalRevenue = $payments->sum('amount');
        $totalTransactions = $payments->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        // Group by currency
        $revenueByCurrency = $payments->groupBy('currency')
            ->map(function ($group) {
                return [
                    'currency' => $group->first()->currency,
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                ];
            })
            ->values()
            ->toArray();

        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_transactions' => $totalTransactions,
            'average_transaction' => round($averageTransaction, 2),
            'by_currency' => $revenueByCurrency,
            'period_days' => $daysBack,
        ];
    }

    /**
     * Get revenue trend data for charts
     */
    public function getRevenueTrend(int $schoolId = null, int $daysBack = 30): array
    {
        $query = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [now()->subDays($daysBack), now()]);

        if ($schoolId) {
            $query->whereHas('subscription', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        // Group by date
        $dailyRevenue = $query
            ->selectRaw('DATE(paid_at) as date, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill in missing dates with zero
        $trends = [];
        for ($i = $daysBack; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayData = $dailyRevenue->firstWhere('date', $date);

            $trends[] = [
                'date' => $date,
                'revenue' => $dayData ? round($dayData->total, 2) : 0,
                'transactions' => $dayData ? $dayData->count : 0,
            ];
        }

        return $trends;
    }

    /**
     * Get payment status breakdown
     */
    public function getPaymentStatusBreakdown(int $schoolId = null): array
    {
        $query = Payment::query();

        if ($schoolId) {
            $query->whereHas('subscription', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        $breakdown = $query
            ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'total' => round($item->total, 2),
                ];
            })
            ->toArray();

        return $breakdown;
    }

    /**
     * Get subscription metrics
     */
    public function getSubscriptionMetrics(int $schoolId = null): array
    {
        $query = Subscription::query();

        if ($schoolId) {
            $query->where('school_id', $schoolId);
        }

        $activeSubscriptions = (clone $query)->where('status', 'active')->count();
        $expiredSubscriptions = (clone $query)->where('status', 'expired')->count();
        $totalSubscriptions = (clone $query)->count();

        // Calculate MoM growth
        $currentMonth = (clone $query)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        $previousMonth = (clone $query)
            ->whereBetween('created_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth(),
            ])
            ->count();

        $momGrowth = $previousMonth > 0 ? round((($currentMonth - $previousMonth) / $previousMonth) * 100, 1) : 0;

        // Average subscription value
        $avgSubscriptionValue = 0;
        if ($query->count() > 0) {
            $subscriptionIds = (clone $query)->pluck('id');
            $avgSubscriptionValue = Payment::where('status', 'completed')
                ->whereIn('subscription_id', $subscriptionIds)
                ->avg('amount');
        }

        return [
            'active' => $activeSubscriptions,
            'expired' => $expiredSubscriptions,
            'total' => $totalSubscriptions,
            'mom_growth_percent' => $momGrowth,
            'avg_subscription_value' => round($avgSubscriptionValue, 2),
        ];
    }

    /**
     * Get payment method statistics
     */
    public function getPaymentMethodStats(int $schoolId = null): array
    {
        $query = Payment::where('status', 'completed');

        if ($schoolId) {
            $query->whereHas('subscription', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        return $query
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $item->payment_method ?: 'Unknown',
                    'count' => $item->count,
                    'total' => round($item->total, 2),
                ];
            })
            ->toArray();
    }

    /**
     * Get payment health metrics
     */
    public function getPaymentHealthMetrics(int $schoolId = null): array
    {
        $query = Payment::query();

        if ($schoolId) {
            $query->whereHas('subscription', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        $totalPayments = (clone $query)->count();
        $successfulPayments = (clone $query)->where('status', 'completed')->count();
        $failedPayments = (clone $query)->where('status', 'failed')->count();
        $abandonedPayments = (clone $query)->where('status', 'abandoned')->count();

        $successRate = $totalPayments > 0 ? round(($successfulPayments / $totalPayments) * 100, 1) : 0;

        return [
            'total_payments' => $totalPayments,
            'successful' => $successfulPayments,
            'failed' => $failedPayments,
            'abandoned' => $abandonedPayments,
            'success_rate_percent' => $successRate,
        ];
    }

    /**
     * Get top paying schools
     */
    public function getTopPayingSchools(int $limit = 10): array
    {
        return DB::table('payments')
            ->join('subscriptions', 'payments.subscription_id', '=', 'subscriptions.id')
            ->join('schools', 'subscriptions.school_id', '=', 'schools.id')
            ->where('payments.status', 'completed')
            ->selectRaw('schools.id, schools.name, SUM(payments.amount) as total_revenue, COUNT(payments.id) as transaction_count')
            ->groupBy('schools.id', 'schools.name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'school_id' => $item->id,
                    'school_name' => $item->name,
                    'total_revenue' => round($item->total_revenue, 2),
                    'transaction_count' => $item->transaction_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get upcoming renewal dates
     */
    public function getUpcomingRenewals(int $daysAhead = 30): array
    {
        return Subscription::where('status', 'active')
            ->whereBetween('expiry_date', [now(), now()->addDays($daysAhead)])
            ->with('school')
            ->orderBy('expiry_date')
            ->get()
            ->map(function ($subscription) {
                $daysLeft = $subscription->expiry_date->diffInDays(now());
                return [
                    'subscription_id' => $subscription->id,
                    'school_name' => $subscription->school->name,
                    'school_id' => $subscription->school_id,
                    'expiry_date' => $subscription->expiry_date->format('Y-m-d'),
                    'days_left' => $daysLeft,
                    'plan_type' => $subscription->plan_type,
                ];
            })
            ->toArray();
    }
}
