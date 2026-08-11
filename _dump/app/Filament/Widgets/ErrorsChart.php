<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\ErrorLog;
use Carbon\Carbon;

class ErrorsChart extends ChartWidget
{
    protected ?string $heading = 'System Errors (Last 14 Days)';
    protected static ?int $sort = 5;

    protected function getData(): array
    {
        $labels = [];
        $errors = [];
        $warnings = [];
        $critical = [];

        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('M d');

            $errors[] = ErrorLog::where('severity', 'error')
                ->whereDate('created_at', $date)
                ->count();

            $warnings[] = ErrorLog::where('severity', 'warning')
                ->whereDate('created_at', $date)
                ->count();

            $critical[] = ErrorLog::where('severity', 'critical')
                ->whereDate('created_at', $date)
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Critical',
                    'data' => $critical,
                    'borderColor' => '#dc2626',
                    'backgroundColor' => 'rgba(220, 38, 38, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Errors',
                    'data' => $errors,
                    'borderColor' => '#f59e0b',
                    'backgroundColor' => 'rgba(245, 158, 11, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Warnings',
                    'data' => $warnings,
                    'borderColor' => '#6366f1',
                    'backgroundColor' => 'rgba(99, 102, 241, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
