<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class SystemLogs extends Page
{
    protected string $view = 'filament.pages.system-logs';

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-document-text';

    protected static \UnitEnum|string|null $navigationGroup = 'System Tools';

    public $logs = '';

    public function mount(): void
    {
        $this->loadLogs();
    }

    public function loadLogs(): void
    {
        $logPath = storage_path('logs/laravel.log');

        if (!file_exists($logPath)) {
            $this->logs = 'Log file not found.';
            return;
        }

        // Efficiently read the last 500 lines
        $this->logs = $this->tailCustom($logPath, 500);
    }

    /**
     * Tail a file in PHP
     */
    protected function tailCustom($filename, $lines = 500)
    {
        $handle = fopen($filename, "r");
        $linecounter = $lines;
        $pos = -2;
        $beginning = false;
        $text = [];

        while ($linecounter > 0) {
            $t = " ";
            while ($t != "\n") {
                if (fseek($handle, $pos, SEEK_END) == -1) {
                    $beginning = true;
                    break;
                }
                $t = fgetc($handle);
                $pos--;
            }
            $linecounter--;
            if ($beginning) {
                rewind($handle);
            }
            $text[] = fgets($handle);
            if ($beginning) break;
        }
        fclose($handle);
        
        return implode("", array_reverse($text));
    }

    public function clearLogs(): void
    {
        $logPath = storage_path('logs/laravel.log');
        if (file_exists($logPath)) {
            file_put_contents($logPath, '');
        }
        $this->loadLogs();
        
        $this->dispatch('notify', [
            'type' => 'success',
            'message' => 'Logs cleared successfully.',
        ]);
    }
}
