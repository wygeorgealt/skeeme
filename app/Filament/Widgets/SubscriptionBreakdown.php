<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\IndividualSubscription;

class SubscriptionBreakdown extends ChartWidget
{
    protected static ?string $heading = 'Subscription Breakdown';
    protected static ?int $sort = 6;

    protected function getData(): array
    {
        $free = IndividualSubscription::query()->where('plan_name', 'Free')->active()->count();
        $standard = IndividualSubscription::query()->where('plan_name', 'Standard')->active()->count();
        $elite = IndividualSubscription::query()->where('plan_name', 'Elite')->active()->count();

        return [
            'datasets' => [
                [
                    'data' => [$free, $standard, $elite],
                    'backgroundColor' => ['#94a3b8', '#f59e0b', '#10b981'],
                ],
            ],
            'labels' => ['Free', 'Standard', 'Elite'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
