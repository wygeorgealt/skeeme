<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FlashcardDeck;
use App\Models\Flashcard;
use App\Services\AnthropicAIService as AIService;
use App\Services\DeepseekAIService;
use App\Services\FileExtractionService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Jobs\ProcessAIFlashcards;

class FlashcardController extends Controller
{
    protected $aiService;
    protected $deepseek;
    protected $extractionService;

    public function __construct(AIService $aiService, DeepseekAIService $deepseek, FileExtractionService $extractionService)
    {
        $this->aiService = $aiService;
        $this->deepseek = $deepseek;
        $this->extractionService = $extractionService;
    }

    /**
     * Generate a new flashcard deck using AI (Streaming SSE)
     */
    public function streamGenerate(Request $request)
    {
        $validated = $request->validate([
            'topic'          => 'nullable|string|max:255',
            'file'           => 'nullable|file|mimes:pdf,doc,docx,txt,md|max:5120',
            'card_count'     => 'required|integer|min:5|max:50',
            'difficulty'     => 'nullable|string|in:easy,medium,hard,mixed',
        ]);

        $user = $request->user();
        $sourceContent = '';

        if ($request->hasFile('file')) {
            $sourceContent = $this->extractionService->extractText($request->file('file')->getPathname(), $request->file('file')->getClientOriginalExtension());
        } else {
            $sourceContent = $validated['topic'];
        }

        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $flashcardRates = $pricingConfig['rates']['flashcard_flat'] ?? ['free' => 30, 'paid' => 25];
        $totalCost = is_array($flashcardRates) ? ($flashcardRates[$planTier] ?? 25) : $flashcardRates;

        if (!$user->is_unlimited_student && $user->credits < $totalCost) {
            return response()->json(['message' => "Insufficient credits."], 403);
        }

        $requestId = (string) Str::uuid();

        return response()->stream(function () use ($request, $user, $sourceContent, $validated, $totalCost, $requestId) {
            $fullContent = '';
            $modelUsed = AIService::MODEL_HAIKU;

            try {
                $params = [
                    'model' => $modelUsed,
                    'max_tokens' => $this->aiService->calculateMaxTokens('flashcard', $validated['card_count']),
                    'system' => "You are an expert tutor creating highly effective flashcards. Return only JSON. Schema: [{\"front\":\"\",\"back\":\"\"}]",
                    'messages' => [
                        ['role' => 'user', 'content' => "Generate " . ($validated['card_count'] ?? 10) . " flashcards on: " . $sourceContent]
                    ],
                    'temperature' => 0.7,
                ];

                $this->aiService->streamRequest($params, function ($chunk) use (&$fullContent) {
                    if ($chunk['type'] === 'content_block_delta') {
                        $text = $chunk['delta']['text'] ?? '';
                        $fullContent .= $text;
                        echo "data: " . json_encode(['text' => $text]) . "\n\n";
                        if (ob_get_level() > 0) ob_flush();
                        flush();
                    }
                });

                // Credit Deduction
                if (!$user->is_unlimited_student) {
                    $user->decrement('credits', $totalCost);
                    $user->transactions()->create([
                        'type' => 'usage',
                        'action_type' => 'flashcard_generation',
                        'amount' => -$totalCost,
                        'description' => "Flashcard Generation (Streaming)",
                        'model_used' => $modelUsed,
                        'request_id' => $requestId,
                    ]);
                }

                // Persistence logic
                try {
                    $cleanJson = preg_replace('/```(?:json)?|```/s', '', $fullContent);
                    $cardsData = json_decode(trim($cleanJson), true);
                    
                    if (is_array($cardsData)) {
                        $title = $validated['topic'] ?? 'New Flashcard Deck';
                        $deck = DB::transaction(function () use ($cardsData, $user, $title) {
                            $deck = \App\Models\FlashcardDeck::create([
                                'user_id' => $user->id,
                                'title' => $title,
                                'source_type' => 'ai_stream',
                            ]);
                            
                            $toInsert = [];
                            foreach ($cardsData as $idx => $c) {
                                if (empty($c['front']) || empty($c['back'])) continue;
                                $toInsert[] = [
                                    'flashcard_deck_id' => $deck->id,
                                    'front' => $c['front'],
                                    'back' => $c['back'],
                                    'order_column' => $idx,
                                    'created_at' => now(),
                                    'updated_at' => now()
                                ];
                            }
                            if (!empty($toInsert)) {
                                \App\Models\Flashcard::insert($toInsert);
                            }
                            return $deck;
                        });
                        echo "data: " . json_encode(['db_id' => $deck->id]) . "\n\n";
                    }
                } catch (\Exception $saveEx) {
                    Log::error("Failed to save streamed flashcards: " . $saveEx->getMessage());
                }

                echo "data: [DONE]\n\n";
            } catch (\Exception $e) {
                Log::error("Streaming Flashcards Error: " . $e->getMessage());
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * List all flashcard decks for the user
     */
    public function index(Request $request)
    {
        $limit = min((int) $request->input('limit', 20), 50); // cap at 50
        $cursor = $request->input('cursor');

        $query = FlashcardDeck::where('user_id', $request->user()->id)
            ->withCount('flashcards')
            ->orderBy('id', 'desc');

        if ($cursor) {
            $query->where('id', '<', $cursor);
        }

        // Fetch limit + 1 to determine if there are more results
        $decks = $query->take($limit + 1)->get();

        $nextCursor = null;
        if ($decks->count() > $limit) {
            $decks->pop();
            $nextCursor = $decks->last()->id;
        }

        return response()->json(['data' => $decks, 'next_cursor' => $nextCursor]);
    }

    /**
     * Get a specific deck and its cards
     */
    public function show(Request $request, $id)
    {
        $deck = FlashcardDeck::where('user_id', $request->user()->id)
            ->with(['flashcards' => function ($q) {
                $q->orderBy('order_column');
            }])
            ->findOrFail($id);

        return response()->json(['data' => $deck]);
    }

    /**
     * Generate a new flashcard deck using AI
     */
    public function generate(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        $requestId = $idempotencyKey ?? (string) Str::uuid();
        if ($idempotencyKey && Cache::has("idempotency_{$idempotencyKey}")) {
            Log::info("Flashcard Generation: Idempotency cache hit", ['key' => $idempotencyKey]);
            return response()->json(Cache::get("idempotency_{$idempotencyKey}"));
        }

        set_time_limit(180);
        Log::info("Flashcard Generation Started", $request->except(['file']));

        $validated = $request->validate([
            'topic'          => 'nullable|string|max:255',
            'file'           => 'nullable|file|mimes:pdf,doc,docx,txt,md|max:5120',
            'card_count'     => 'required|integer|min:5|max:50',
            'difficulty'     => 'nullable|string|in:easy,medium,hard,mixed',
        ]);

        Log::info("Validation Passed");

        if (empty($validated['topic']) && !$request->hasFile('file')) {
            return response()->json(['message' => 'Please provide a topic or upload a file.'], 422);
        }

        $user = $request->user();
        $sourceType = 'topic';
        $title = $validated['topic'] ?? 'Flashcards from File';
        $sourceContent = $validated['topic'] ?? '';

        // 1. Extract content if file provided
        if ($request->hasFile('file')) {
            Log::info("Processing File Upload");
            $sourceType = 'file';
            $file = $request->file('file');
            // Decode URL-encoded names (e.g. "My%20File.pdf" -> "My File")
            $title = urldecode(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));

            try {
                $sourceContent = $this->extractionService->extractText($file->getPathname(), $file->getClientOriginalExtension());
                if (empty(trim($sourceContent))) {
                    Log::error("Text extraction failed for flashcards.");
                    return response()->json(['message' => 'Could not extract text from this file. Try a different document.'], 422);
                }
                Log::info("Text Extracted", ['length' => strlen($sourceContent)]);

                // Upload to R2 for persistent storage
                $safeName = time() . '_' . Str::slug($title) . '.' . $file->getClientOriginalExtension();
                Log::info("Uploading to R2...", ['name' => $safeName]);
                $r2Path = $file->storeAs('student-uploads/flashcards/' . $user->id, $safeName, config('filesystems.default'));
                Log::info("R2 Upload Success", ['path' => $r2Path]);
            } catch (\Exception $e) {
                Log::error("File extraction failed in Flashcards: " . $e->getMessage());
                return response()->json(['message' => 'Failed to read file: ' . $e->getMessage()], 422);
            }
        } else {
            Log::info("Processing Topic", ['topic' => $sourceContent]);
        }

        // 1b. Pre-summarize long documents to reduce AI token costs
        if ($sourceType === 'file' && str_word_count($sourceContent) >= 3000) {
            $sourceContent = $this->deepseek->condenseMaterial(
                $sourceContent,
                (int) ($validated['card_count'] ?? 10),
                'flashcards'
            );
        }

        // 2. Calculate dynamic cost
        $wordCount = str_word_count($sourceContent);

        // Hard Word Limit Protector
        if ($wordCount > 8000) {
            Log::warning("Word limit exceeded in flashcards", ['user_id' => $user->id, 'word_count' => $wordCount]);
            return response()->json([
                'message' => "This document is too large. Please limit it to 8,000 words.",
            ], 422);
        }

        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $rates = $pricingConfig['rates'] ?? [];

        // Flat tiered cost based on subscription plan
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $flashcardRates = $rates['flashcard_flat'] ?? ['free' => 30, 'paid' => 25];
        $totalCost = is_array($flashcardRates) ? ($flashcardRates[$planTier] ?? 25) : $flashcardRates;

        Log::info("Cost Calculated", ['cost' => $totalCost, 'words' => $wordCount, 'plan' => $planTier]);

        // 3. Check & Lock Credits (Atomic)
        $canProceed = DB::transaction(function () use ($user, $totalCost) {
            $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();

            if (!$lockedUser->is_unlimited_student && $lockedUser->credits < $totalCost) {
                return false;
            }
            return true;
        });

        if (!$canProceed) {
            Log::warning("Insufficient Credits", ['user_id' => $user->id, 'credits' => $user->credits, 'needed' => $totalCost]);
            return response()->json([
                'message' => "Insufficient credits. Generating this deck requires ~$totalCost credits.",
                'required' => $totalCost,
                'available' => $user->credits
            ], 403);
        }

        // 4. Generate Synchronously (Circuit Breaker implementation)
        try {
            $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
            $activeProvider = $aiConfig['provider'];
            $isManualOverride = $aiConfig['is_manual'] ?? false;

            if ($activeProvider === 'none') {
                throw new \Exception('Skeeme AI is currently undergoing scheduled maintenance. Please try again later.');
            }

            $useDeepseek = ($activeProvider === 'deepseek');
            $modelUsed = $useDeepseek ? 'deepseek-chat' : 'claude-haiku-4-5-20251001';

            // Dynamic Timeout based on Network Quality Header
            $networkType = $request->header('X-Network-Type');
            $networkGen = $request->header('X-Network-Generation');
            $timeout = ($networkType === 'cellular' && in_array($networkGen, ['2g', '3g', 'edge'])) ? 30 : 60;

            $this->aiService->setTimeout($timeout);
            $this->deepseek->setTimeout($timeout + 60);

            try {
                if ($useDeepseek) {
                    Log::info("Circuit Breaker Active: Auto-routing Flashcards to DeepSeek.");
                    $cardsData = $this->deepseek->generateFlashcards(
                        [$sourceContent],
                        (int) ($validated['card_count'] ?? 10),
                        $validated['difficulty'] ?? 'medium',
                        $validated['topic'] ?? 'General Topics'
                    );
                } else {
                    Log::info("Calling primary AI (Claude) for flashcard generation...");
                    $cardsData = $this->aiService->generateFlashcards(
                        [$sourceContent],
                        (int) ($validated['card_count'] ?? 10),
                        $validated['difficulty'] ?? 'medium',
                        $validated['topic'] ?? 'General Topics'
                    );
                }
            } catch (\Exception $e) {
                if ($isManualOverride) {
                    \App\Models\SystemSetting::triggerManualFailureAlert($activeProvider, 'Flashcard Generation', $e->getMessage());
                    throw $e;
                }

                if (!$useDeepseek) {
                    Log::warning("Claude API unavailable for Flashcards. Circuit Breaker tripped → routing to DeepSeek. Reason: " . $e->getMessage());
                    Cache::put('use_deepseek_fallback', true, now()->addMinutes(30));
                    $modelUsed = 'deepseek-chat';

                    $cardsData = $this->deepseek->generateFlashcards(
                        [$sourceContent],
                        (int) ($validated['card_count'] ?? 10),
                        $validated['difficulty'] ?? 'medium',
                        $validated['topic'] ?? 'General Topics'
                    );
                } else {
                    throw $e;
                }
            }

            if (empty($cardsData)) {
                throw new \Exception('AI returned no flashcards.');
            }

            // 5. Save to DB (Atomic Transaction)
            $deck = DB::transaction(function () use ($cardsData, $user, $title, $sourceType, $totalCost, $modelUsed, $requestId) {
                $deck = FlashcardDeck::create([
                    'user_id' => $user->id,
                    'title' => $title,
                    'source_type' => $sourceType,
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

                // Deduct Usage immediately (Atomic)
                if (!$user->is_unlimited_student) {
                    $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                    $lockedUser->decrement('credits', $totalCost);

                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'action_type' => 'flashcard_generation',
                            'amount' => -$totalCost,
                            'description' => "Generating Flashcard Deck: " . $title,
                            'model_used' => $modelUsed ?? 'claude-haiku-4-5-20251001',
                            'request_id' => $requestId,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to log flashcard transaction: " . $e->getMessage());
                    }

                    // Check if user is running low on credits (dispatched after transaction)
                    \App\Jobs\CheckLowCredits::dispatch($user->id);
                }

                return $deck;
            });

            $responseData = [
                'message' => 'AI flashcard generation success.',
                'data' => $deck->load('flashcards')->toArray(),
                'credits_deducted' => $user->is_unlimited_student ? 0 : $totalCost,
                'remaining_credits' => $user->fresh()->credits
            ];

            if ($idempotencyKey) {
                Cache::put("idempotency_{$idempotencyKey}", $responseData, now()->addHours(24));
            }

            return response()->json($responseData);
        } catch (\Exception $e) {
            Log::error("Flashcard generation failed: " . $e->getMessage());
            $message = $e->getMessage();
            if (str_contains(strtolower($message), 'failed') || str_contains(strtolower($message), 'exception') || str_contains(strtolower($message), 'error 28')) {
                $message = "Skeeme is down, Please try again later.";
            }
            return response()->json(['message' => $message], 500);
        }
    }

    /**
     * Delete a deck
     */
    public function destroy(Request $request, $id)
    {
        $deck = FlashcardDeck::where('user_id', $request->user()->id)->findOrFail($id);
        $deck->delete();
        return response()->json(['message' => 'Deck deleted.']);
    }
}
