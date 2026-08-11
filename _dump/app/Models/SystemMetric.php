<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemMetric extends Model
{
    protected $table = 'system_metrics';

    protected $fillable = [
        'cpu_usage',
        'memory_usage',
        'disk_usage',
        'active_users',
        'total_requests',
        'response_time_ms',
        'failed_requests',
        'uptime_percentage',
        'service_status',
        'recorded_at',
    ];

    protected $casts = [
        'service_status' => 'array',
        'recorded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function recordMetric($data)
    {
        return self::create(array_merge($data, [
            'recorded_at' => now(),
        ]));
    }

    public static function getLatest()
    {
        return self::latest('recorded_at')->first();
    }

    public static function getLast24Hours()
    {
        return self::where('recorded_at', '>=', now()->subDay())
            ->orderBy('recorded_at')
            ->get();
    }
}
