<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\DeepseekAIService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Support\AiJobCache;

class ProcessAIQuiz implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected array $notes;
    protected int $count;
    protected string $difficulty;
    protected array $types;
    protected string $topic;
    protected int $userId;
    protected string $jobId;
    protected int $cost;

    /**
     * Create a new job instance.
     */
    public function __construct(array $notes, int $count, string $difficulty, array $types, string $topic, int $userId, string $jobId, int $cost)
    {
        $this->notes = $notes;
        $this->count = $count;
        $this->difficulty = $difficulty;
        $this->types = $types;
        $this->topic = $topic;
        $this->userId = $userId;
        $this->jobId = $jobId;
        $this->cost = $cost;
    }

    /**
     * Execute the job.
     */
    public function handle(DeepseekAIService $aiService): void
    {
        if (Cache::get("ai_job_status:{$this->jobId}") === 'completed') {
            Log::info("AI Quiz Job already processed successfully.", ['job_id' => $this->jobId]);
            return;
        }

        Cache::put("ai_job_status:{$this->jobId}", "processing", AiJobCache::TTL_SECONDS);
        AiJobCache::register($this->jobId, $this->userId);

        try {
            $user = User::find($this->userId);
            
            $questions = $aiService->generateQuestions(
                $this->notes,
                $this->count,
                $this->difficulty,
                $this->types,
                $this->topic,
                false,
                null,
                $user ? $user->ai_preferences : null
            );

            if (empty($questions)) {
                throw new \Exception('AI returned no questions.');
            }

            // Cleanup MC formatting (same as controller logic)
            foreach ($questions as &$q) {
                if ($q['question_type'] === 'multiple_choice' && !empty($q['options'])) {
                    $originalCorrectKey = $q['correct_answer'];
                    $keyMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'E' => 4];
                    $correctIndex = $keyMap[strtoupper($originalCorrectKey)] ?? 0;
                    $correctText = $q['options'][$correctIndex] ?? $q['options'][0] ?? '';
                    shuffle($q['options']);
                    $q['correct_answer'] = $correctText;
                }
            }

            // Store result in cache for retrieval
            Cache::put("ai_job_status:{$this->jobId}", "completed", 1800);
            Cache::put("ai_job_result:{$this->jobId}", $questions, 1800);
            
            Log::info("AI Quiz Job Success", ['job_id' => $this->jobId, 'count' => count($questions)]);

        } catch (\Exception $e) {
            Log::error("AI Quiz Job Failed", [
                'job_id' => $this->jobId,
                'error' => $e->getMessage()
            ]);

            Cache::put("ai_job_status:{$this->jobId}", "failed", 1800);
            Cache::put("ai_job_error:{$this->jobId}", $e->getMessage(), 1800);

            // Refund credits if generation failed
            if ($this->cost > 0) {
                $user = User::find($this->userId);
                if ($user && !$user->is_unlimited_student) {
                    \Illuminate\Support\Facades\DB::transaction(function() use ($user) {
                        User::where('id', $user->id)->lockForUpdate()->increment('credits', $this->cost);
                    });
                    Log::info("Refunded credits for failed AI job", ['user_id' => $this->userId, 'amount' => $this->cost]);
                }
            }
        }
    }
}
