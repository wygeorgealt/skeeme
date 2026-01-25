<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

use Illuminate\Support\Facades\DB;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;

class DatabaseStats extends Page
{
    protected string $view = 'filament.pages.database-stats';

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-circle-stack';

    protected static \UnitEnum|string|null $navigationGroup = 'System Tools';

    public function getTableStats(): array
    {
        $tables = [
            'users', 'schools', 'courses', 'classes', 
            'exams', 'exam_sessions', 'enrollments', 
            'invoices', 'payments', 'demo_requests'
        ];

        $stats = [];
        $dbName = config('database.connections.mysql.database');

        foreach ($tables as $table) {
            if (!\Illuminate\Support\Facades\Schema::hasTable($table)) {
                continue;
            }

            $count = DB::table($table)->count();
            
            // Get size for MySQL
            $sizeResult = DB::select("
                SELECT (data_length + index_length) / 1024 / 1024 AS size 
                FROM information_schema.TABLES 
                WHERE table_schema = ? AND table_name = ?
            ", [$dbName, $table]);

            $stats[] = [
                'name' => $table,
                'count' => $count,
                'size' => number_format($sizeResult[0]->size ?? 0, 2) . ' MB',
            ];
        }

        return $stats;
    }

    public function getDatabaseSize(): string
    {
        $dbName = config('database.connections.mysql.database');
        $result = DB::select("
            SELECT SUM(data_length + index_length) / 1024 / 1024 AS size 
            FROM information_schema.TABLES 
            WHERE table_schema = ?
        ", [$dbName]);

        return number_format($result[0]->size ?? 0, 2) . ' MB';
    }
}
