<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SystemHealthController extends Controller
{
    /**
     * Secret key for accessing the health dashboard.
     * In a production app, this should be in .env
     */
    protected $secretKey = 'skeeme-vital-stats-2026';

    public function index($key)
    {
        if ($key !== $this->secretKey) {
            abort(404);
        }

        $stats = $this->getRedisStats();

        return view('system.health', compact('stats'));
    }

    protected function getRedisStats()
    {
        $data = [
            'status' => 'Unknown',
            'latency' => 0,
            'write_latency' => 0,
            'read_latency' => 0,
            'info' => [],
            'verdict' => 'Pending',
            'verdict_class' => 'text-gray-500'
        ];

        try {
            // 1. Connection Check
            $start = microtime(true);
            Redis::ping();
            $data['latency'] = (microtime(true) - $start) * 1000;
            $data['status'] = 'Healthy';

            // 2. Read/Write Test
            $testKey = 'skeeme:health_web_test:' . time();
            
            $start = microtime(true);
            Cache::put($testKey, "health_check_payload", 60);
            $data['write_latency'] = (microtime(true) - $start) * 1000;

            $start = microtime(true);
            $value = Cache::get($testKey);
            $data['read_latency'] = (microtime(true) - $start) * 1000;

            if ($value !== "health_check_payload") {
                $data['status'] = 'Degraded (Integrity Failure)';
            }

            // 3. Info
            $redisInfo = Redis::info();
            $data['info'] = [
                'Memory' => $redisInfo['used_memory_human'] ?? 'N/A',
                'Clients' => $redisInfo['connected_clients'] ?? 'N/A',
                'Uptime' => ($redisInfo['uptime_in_days'] ?? '0') . ' days',
                'Commands' => $redisInfo['total_commands_processed'] ?? 'N/A',
                'Version' => $redisInfo['redis_version'] ?? 'N/A'
            ];

            // 4. Verdict
            if ($data['latency'] < 50) {
                $data['verdict'] = 'Excellent';
                $data['verdict_class'] = 'text-emerald-500';
            } elseif ($data['latency'] < 150) {
                $data['verdict'] = 'Fair';
                $data['verdict_class'] = 'text-amber-500';
            } else {
                $data['verdict'] = 'Poor (High Latency)';
                $data['verdict_class'] = 'text-rose-500';
            }

        } catch (\Exception $e) {
            $data['status'] = 'Error';
            $data['error'] = $e->getMessage();
            $data['verdict'] = 'Disconnected';
            $data['verdict_class'] = 'text-rose-600';
        }

        return $data;
    }
}
