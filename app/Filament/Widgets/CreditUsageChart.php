<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Transaction;
use Carbon\Carbon;

class CreditUsageChart extends ChartWidget
{
    protected ?string $heading = 'Daily Credit Usage (Last 14 Days)';
    protected static ?int $sort = 4;

    protected function getData(): array
    {
        $labels = [];
        $used = [];
        $dispatched = [];

        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('M d');

            $used[] = abs(Transaction::where('type', 'usage')
                ->whereDate('created_at', $date)
                ->sum('amount'));

            $dispatched[] = (int) Transaction::whereIn('type', ['reward', 'purchase', 'refund'])
                ->whereDate('created_at', $date)
                ->sum('amount');
        }

        return [
            'datasets' => [
                [
                    'label' => 'Credits Used',
                    'data' => $used,
                    'backgroundColor' => '#ef4444',
                ],
                [
                    'label' => 'Credits Dispatched',
                    'data' => $dispatched,
                    'backgroundColor' => '#3b82f6',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
