<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\DeepseekAIService;
use App\Models\FlashcardDeck;
use App\Models\Flashcard;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessAIFlashcards implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected array $notes;
    protected int $count;
    protected string $difficulty;
    protected string $topic;
    protected string $title;
    protected string $sourceType;
    protected int $userId;
    protected string $jobId;
    protected int $cost;

    /**
     * Create a new job instance.
     */
    public function __construct(array $notes, int $count, string $difficulty, string $topic, string $title, string $sourceType, int $userId, string $jobId, int $cost)
    {
        $this->notes = $notes;
        $this->count = $count;
        $this->difficulty = $difficulty;
        $this->topic = $topic;
        $this->title = $title;
        $this->sourceType = $sourceType;
        $this->userId = $userId;
        $this->jobId = $jobId;
        $this->cost = $cost;
    }

    /**
     * Execute the job.
     */
    public function handle(DeepseekAIService $aiService): void
    {
        Cache::put("ai_job_status:{$this->jobId}", "processing", 1800);

        try {
            // 1. Generate Cards
            $cardsData = $aiService->generateFlashcards(
                $this->notes,
                $this->count,
                $this->difficulty,
                $this->topic
            );

            if (empty($cardsData)) {
                throw new \Exception('AI returned no flashcards.');
            }

            // 2. Save to DB (Atomic Transaction)
            $deckId = DB::transaction(function() use ($cardsData) {
                $deck = FlashcardDeck::create([
                    'user_id' => $this->userId,
                    'title' => $this->title,
                    'source_type' => $this->sourceType,
                ]);

                $cardsToInsert = [];
                foreach ($cardsData as $index => $c) {
                    $cardsToInsert[] = [
                        'flashcard_deck_id' => $deck->id,
                        'front' => $c['front'],
                        'back' => $c['back'],
                        'order_column' => $index,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                Flashcard::insert($cardsToInsert);

                return $deck->id;
            });

            // 3. Store result in cache
            Cache::put("ai_job_status:{$this->jobId}", "completed", 1800);
            Cache::put("ai_job_result:{$this->jobId}", ['deck_id' => $deckId], 1800);

            Log::info("AI Flashcard Job Success", ['job_id' => $this->jobId, 'deck_id' => $deckId]);

        } catch (\Exception $e) {
            Log::error("AI Flashcard Job Failed", [
                'job_id' => $this->jobId,
                'error' => $e->getMessage()
            ]);

            Cache::put("ai_job_status:{$this->jobId}", "failed", 1800);
            Cache::put("ai_job_error:{$this->jobId}", $e->getMessage(), 1800);

            // Refund credits
            if ($this->cost > 0) {
                $user = User::find($this->userId);
                if ($user && !$user->is_unlimited_student) {
                    DB::transaction(function() use ($user) {
                        User::where('id', $user->id)->lockForUpdate()->increment('credits', $this->cost);
                    });
                    Log::info("Refunded credits for failed AI flashcard job", ['user_id' => $this->userId, 'amount' => $this->cost]);
                }
            }
        }
    }
}
