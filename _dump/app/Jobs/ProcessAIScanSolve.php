<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\DeepseekAIService;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Support\AiJobCache;

class ProcessAIScanSolve implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected string $image;
    protected int $userId;
    protected string $jobId;
    protected int $initialCost;
    protected int $baseCost;
    protected int $costPerSolution;

    /**
     * Create a new job instance.
     */
    public function __construct(string $image, int $userId, string $jobId, int $initialCost, int $baseCost, int $costPerSolution)
    {
        $this->image = $image;
        $this->userId = $userId;
        $this->jobId = $jobId;
        $this->initialCost = $initialCost;
        $this->baseCost = $baseCost;
        $this->costPerSolution = $costPerSolution;
    }

    /**
     * Execute the job.
     */
    public function handle(DeepseekAIService $aiService): void
    {
        if (Cache::get("ai_job_status:{$this->jobId}") === 'completed') {
            Log::info("AI Scan Solve Job already processed successfully.", ['job_id' => $this->jobId]);
            return;
        }

        Cache::put("ai_job_status:{$this->jobId}", "processing", AiJobCache::TTL_SECONDS);
        AiJobCache::register($this->jobId, $this->userId);

        try {
            Log::info('Job: Calling Deepseek Multi-Solve AI...', ['job_id' => $this->jobId]);
            $result = $aiService->solveFromImage($this->image);

            $solutionsCount = count($result['results'] ?? []);
            $finalCost = $this->baseCost + ($solutionsCount * $this->costPerSolution);
            if ($solutionsCount === 0) $finalCost = $this->baseCost;

            // Adjust credits (Atomic)
            $user = User::find($this->userId);
            if ($user && !$user->is_unlimited_student) {
                $difference = $finalCost - $this->initialCost;
                
                DB::transaction(function() use ($user, $difference) {
                    $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
                    if ($difference > 0) {
                        $lockedUser->decrement('credits', $difference);
                    } else if ($difference < 0) {
                        $lockedUser->increment('credits', abs($difference));
                    }
                });
            }

            // Store result in cache
            Cache::put("ai_job_status:{$this->jobId}", "completed", 1800);
            Cache::put("ai_job_result:{$this->jobId}", [
                'results' => $result['results'] ?? [],
                'cost' => $finalCost
            ], 1800);

            Log::info("AI Scan Job Success", ['job_id' => $this->jobId, 'solutions' => $solutionsCount, 'final_cost' => $finalCost]);

        } catch (\Exception $e) {
            Log::error("AI Scan Job Failed", [
                'job_id' => $this->jobId,
                'error' => $e->getMessage()
            ]);

            Cache::put("ai_job_status:{$this->jobId}", "failed", 1800);
            Cache::put("ai_job_error:{$this->jobId}", $e->getMessage(), 1800);

            // Refund ALL initial credits if it failed (since we didn't provide a solution)
            if ($this->initialCost > 0) {
                $user = User::find($this->userId);
                if ($user && !$user->is_unlimited_student) {
                    DB::transaction(function() use ($user) {
                        User::where('id', $user->id)->lockForUpdate()->increment('credits', $this->initialCost);
                    });
                    Log::info("Refunded initial cost for failed AI scan job", ['user_id' => $this->userId, 'amount' => $this->initialCost]);
                }
            }
        }
    }
}
