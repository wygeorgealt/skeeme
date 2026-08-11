<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

use Illuminate\Support\Facades\Artisan;
use Filament\Notifications\Notification;

class Optimization extends Page
{
    protected string $view = 'filament.pages.optimization';

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-bolt';

    protected static \UnitEnum|string|null $navigationGroup = 'System Tools';

    public function getSystemInfo(): array
    {
        return [
            'PHP Version' => PHP_VERSION,
            'Laravel Version' => app()->version(),
            'Server Software' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
            'OPcache Enabled' => function_exists('opcache_get_status') && opcache_get_status() ? '✅ Yes' : '❌ No',
            'Environment' => app()->environment(),
            'Debug Mode' => config('app.debug') ? '⚠️ Enabled' : '✅ Disabled',
            'Disk Free' => $this->getFreeDiskSpace(),
        ];
    }

    protected function getFreeDiskSpace(): string
    {
        $bytes = disk_free_space(base_path());
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024; $i++) $bytes /= 1024;
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function clearCache(): void
    {
        Artisan::call('cache:clear');
        $this->notifySuccess('Application cache cleared.');
    }

    public function clearConfig(): void
    {
        Artisan::call('config:clear');
        $this->notifySuccess('Configuration cache cleared.');
    }

    public function clearView(): void
    {
        Artisan::call('view:clear');
        $this->notifySuccess('Compiled views cleared.');
    }

    public function runOptimize(): void
    {
        Artisan::call('optimize');
        $this->notifySuccess('Platform optimized successfully.');
    }

    protected function notifySuccess(string $message): void
    {
        Notification::make()
            ->title('Action Successful')
            ->body($message)
            ->success()
            ->send();
    }
}
