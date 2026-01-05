<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\SystemMetric;
use App\Models\HealthCheck;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function index()
    {
        $latestMetric = SystemMetric::getLatest();
        $metrics24h = SystemMetric::getLast24Hours();
        $healthChecks = HealthCheck::all();
        $unhealthy = HealthCheck::getUnhealthyServices();

        return view('team.monitoring.index', compact('latestMetric', 'metrics24h', 'healthChecks', 'unhealthy'));
    }

    public function health()
    {
        $healthChecks = HealthCheck::orderBy('status')->get();
        $healthy = HealthCheck::where('status', 'healthy')->count();
        $degraded = HealthCheck::where('status', 'degraded')->count();
        $down = HealthCheck::where('status', 'down')->count();

        return view('team.monitoring.health', compact('healthChecks', 'healthy', 'degraded', 'down'));
    }

    public function performance()
    {
        $metrics24h = SystemMetric::getLast24Hours();
        $latestMetric = SystemMetric::getLatest();
        
        $avgResponseTime = $metrics24h->avg('response_time_ms');
        $avgCpuUsage = $metrics24h->avg('cpu_usage');
        $avgMemoryUsage = $metrics24h->avg('memory_usage');
        $peakRequests = $metrics24h->max('total_requests');

        return view('team.monitoring.performance', compact(
            'metrics24h',
            'latestMetric',
            'avgResponseTime',
            'avgCpuUsage',
            'avgMemoryUsage',
            'peakRequests'
        ));
    }

    public function database()
    {
        $latestMetric = SystemMetric::getLatest();
        $diskUsageHistory = SystemMetric::getLast24Hours()
            ->map(fn($m) => ['timestamp' => $m->recorded_at, 'usage' => $m->disk_usage]);

        return view('team.monitoring.database', compact('latestMetric', 'diskUsageHistory'));
    }

    public function backups()
    {
        // Placeholder for backup monitoring
        $backupStatus = [
            'last_backup' => now()->subHours(2),
            'next_scheduled' => now()->addHours(22),
            'backup_size' => '12.5 GB',
            'status' => 'healthy',
        ];

        return view('team.monitoring.backups', compact('backupStatus'));
    }

    public function recordMetric(Request $request)
    {
        if ($request->header('Authorization') !== 'Bearer ' . config('app.monitoring_token')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        SystemMetric::recordMetric($request->all());

        return response()->json(['status' => 'recorded']);
    }

    public function recordHealthCheck(Request $request)
    {
        if ($request->header('Authorization') !== 'Bearer ' . config('app.monitoring_token')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'service_name' => 'required|string',
            'status' => 'required|in:healthy,degraded,down',
            'error_message' => 'nullable|string',
            'response_time_ms' => 'numeric',
        ]);

        HealthCheck::updateOrCreateCheck($validated['service_name'], $validated);

        return response()->json(['status' => 'recorded']);
    }
}
