<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\User;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\ErrorLog;
use App\Models\IndividualSubscription;
use Carbon\Carbon;

class CreatorStatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;
    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $today = $now->copy()->startOfDay();

        // Total Users
        $totalUsers = User::count();
        $newUsersToday = User::whereDate('created_at', $today)->count();

        // Paystack Revenue (completed payments this month)
        $monthlyRevenue = Payment::where('status', 'completed')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount');

        // Credits Used this month (negative transactions = usage)
        $creditsUsed = abs(Transaction::where('type', 'usage')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount'));

        // Credits Dispatched today (positive = rewards/purchases/refill)
        $creditsDispatchedToday = Transaction::whereIn('type', ['reward', 'purchase', 'refund'])
            ->whereDate('created_at', $today)
            ->sum('amount');

        // Active Subscriptions
        $activeSubscriptions = IndividualSubscription::active()->count();

        // Errors today
        $errorsToday = ErrorLog::whereDate('created_at', $today)->count();

        // Weekly user growth for sparkline
        $weeklyUsers = [];
        for ($i = 6; $i >= 0; $i--) {
            $weeklyUsers[] = User::whereDate('created_at', $now->copy()->subDays($i))->count();
        }

        // Weekly revenue for sparkline
        $weeklyRevenue = [];
        for ($i = 6; $i >= 0; $i--) {
            $weeklyRevenue[] = (float) Payment::where('status', 'completed')
                ->whereDate('created_at', $now->copy()->subDays($i))
                ->sum('amount');
        }

        return [
            Stat::make('Total Users', number_format($totalUsers))
                ->description("+{$newUsersToday} today")
                ->descriptionIcon('heroicon-m-user-plus')
                ->chart($weeklyUsers)
                ->color('success'),

            Stat::make('Revenue (This Month)', '₦' . number_format($monthlyRevenue, 2))
                ->description('Completed payments')
                ->descriptionIcon('heroicon-m-banknotes')
                ->chart($weeklyRevenue)
                ->color('warning'),

            Stat::make('Credits Used (Month)', number_format($creditsUsed))
                ->description('Total AI credit consumption')
                ->descriptionIcon('heroicon-m-bolt')
                ->color('info'),

            Stat::make('Credits Dispatched Today', number_format($creditsDispatchedToday))
                ->description('Rewards + purchases + refills')
                ->descriptionIcon('heroicon-m-arrow-up-circle')
                ->color('primary'),

            Stat::make('Active Subscribers', number_format($activeSubscriptions))
                ->description('Standard + Elite plans')
                ->descriptionIcon('heroicon-m-credit-card')
                ->color('success'),

            Stat::make('Errors Today', number_format($errorsToday))
                ->description($errorsToday > 10 ? '⚠️ High error rate' : 'System healthy')
                ->descriptionIcon($errorsToday > 10 ? 'heroicon-m-exclamation-triangle' : 'heroicon-m-check-circle')
                ->color($errorsToday > 10 ? 'danger' : 'success'),
        ];
    }
}
