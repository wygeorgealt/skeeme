<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HealthCheck extends Model
{
    protected $fillable = [
        'service_name',
        'status',
        'error_message',
        'response_time_ms',
        'consecutive_failures',
        'last_checked_at',
        'last_failure_at',
    ];

    protected $casts = [
        'last_checked_at' => 'datetime',
        'last_failure_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function updateOrCreateCheck($serviceName, $data)
    {
        return self::updateOrCreate(
            ['service_name' => $serviceName],
            array_merge($data, ['last_checked_at' => now()])
        );
    }

    public function markHealthy()
    {
        $this->update([
            'status' => 'healthy',
            'error_message' => null,
            'consecutive_failures' => 0,
            'last_checked_at' => now(),
        ]);
    }

    public function markDegraded($errorMessage = null)
    {
        $this->increment('consecutive_failures');
        $this->update([
            'status' => 'degraded',
            'error_message' => $errorMessage,
            'last_checked_at' => now(),
            'last_failure_at' => now(),
        ]);
    }

    public function markDown($errorMessage = null)
    {
        $this->update([
            'status' => 'down',
            'error_message' => $errorMessage,
            'last_checked_at' => now(),
            'last_failure_at' => now(),
        ]);
    }

    public function isHealthy()
    {
        return $this->status === 'healthy';
    }

    public static function getUnhealthyServices()
    {
        return self::whereIn('status', ['degraded', 'down'])->get();
    }
}
