<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RedisMonitor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'skeeme:redis-check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Measure Redis latency and cache reliability for performance auditing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🚀 Starting Redis Performance Audit...");

        try {
            // 1. Connection Check
            $start = microtime(true);
            Redis::ping();
            $latency = (microtime(true) - $start) * 1000;
            
            $this->info(sprintf("✅ Connection: Success (Latency: %.2f ms)", $latency));

            // 2. Read/Write Test
            $testKey = 'skeeme:perf_test:' . time();
            $start = microtime(true);
            Cache::put($testKey, "performance_payload", 60);
            $writeLatency = (microtime(true) - $start) * 1000;

            $start = microtime(true);
            $value = Cache::get($testKey);
            $readLatency = (microtime(true) - $start) * 1000;

            if ($value === "performance_payload") {
                $this->info(sprintf("✅ Write Latency: %.2f ms", $writeLatency));
                $this->info(sprintf("✅ Read Latency: %.2f ms", $readLatency));
            } else {
                $this->error("❌ Cache Read/Write integrity check failed!");
            }

            // 3. Stats Retrieval (Aiven specific)
            $info = Redis::info();
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Used Memory', $info['used_memory_human'] ?? 'N/A'],
                    ['Connected Clients', $info['connected_clients'] ?? 'N/A'],
                    ['Uptime', ($info['uptime_in_days'] ?? '0') . ' days'],
                    ['Total Commands', $info['total_commands_processed'] ?? 'N/A'],
                ]
            );

            // 4. Summary Verdict
            if ($latency < 50) {
                $this->info("\n💎 Verdict: Redis performance is EXCELLENT (Sub-50ms roundtrip).");
            } elseif ($latency < 150) {
                $this->warn("\n⚠️ Verdict: Redis performance is FAIR. Latency is noticeable.");
            } else {
                $this->error("\n🚨 Verdict: Redis performance is POOR. Check geographical alignment of services.");
            }

        } catch (\Exception $e) {
            $this->error("❌ Redis Error: " . $e->getMessage());
            Log::error("Redis Audit Failed", ['error' => $e->getMessage()]);
        }
    }
}
