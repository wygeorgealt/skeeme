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
use Illuminate\Support\Facades\Auth;

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
        set_time_limit(300);
        error_log("[DEBUG] Flashcard streamGenerate hit by User: " . (Auth::id() ?? 'Guest'));

        $user = $request->user();

        try {
            $validated = $request->validate([
                'topic'          => 'nullable|string|max:255',
                'file'           => 'nullable|file|mimes:pdf,doc,docx,txt,md|max:10240',
                'card_count'     => 'required|integer|min:5|max:50',
                'difficulty'     => 'nullable|string|in:easy,medium,hard,mixed',
                'deck_id'        => 'nullable|integer|exists:flashcard_decks,id',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            error_log("[DEBUG] Flashcard Validation FAILED: " . json_encode($e->errors()));
            Log::warning("[AI Flashcard Validation Failed]", [
                'user_id' => $user->id,
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            return response()->json(['message' => 'Validation error', 'errors' => $e->errors()], 422);
        }

        // 2. Find the pre-created deck
        $deck = FlashcardDeck::where('user_id', $user->id)->find($validated['deck_id']);
        if (!$deck) {
            return response()->json(['message' => 'Deck not found or missing ID'], 404);
        }

        $title = $deck->title;
        $sourceContent = Cache::get("deck_{$deck->id}_source");

        if (empty(trim((string)$sourceContent))) {
            return response()->json(['message' => 'No content found for generation. Please recreate the deck.'], 400);
        }

        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $flashcardRates = $pricingConfig['rates']['flashcard_flat'] ?? ['free' => 30, 'paid' => 25];
        $totalCost = is_array($flashcardRates) ? ($flashcardRates[$planTier] ?? 25) : $flashcardRates;

        if (!$user->is_unlimited_student && $user->credits < $totalCost) {
            return response()->json(['message' => "Insufficient credits. You need $totalCost credits."], 403);
        }

        $requestId = (string) Str::uuid();

        return response()->stream(function () use ($request, $user, $validated, $totalCost, $requestId, $title, $deck, $sourceContent) {
            $emit = function (array $payload) {
                echo "data: " . json_encode($payload) . "\n\n";
                if (ob_get_level() > 0) ob_flush();
                flush();
            };

            $fullContent = '';
            
            try {
                // 1. Initial Status
                $emit(['type' => 'status', 'message' => 'Skeeming...']);

                // 3. Document Condensing (if needed)
                if (str_word_count($sourceContent) >= 3000) {
                    $emit(['type' => 'status', 'message' => 'Analyzing key concepts...']);
                    $sourceContent = $this->deepseek->condenseMaterial($sourceContent, (int) $validated['card_count'], 'flashcards');
                }

                $emit(['type' => 'status', 'message' => 'Generating Flashcards...']);

                $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
                $activeProvider = $aiConfig['provider'];
                $useDeepseek = ($activeProvider === 'deepseek');
                
                $modelUsed = $useDeepseek ? 'deepseek-chat' : AIService::MODEL_HAIKU;
                $service = $useDeepseek ? $this->deepseek : $this->aiService;

                $params = [
                    'model' => $modelUsed,
                    'max_tokens' => $this->aiService->calculateMaxTokens('flashcard', $validated['card_count']),
                    'system' => "You are an expert tutor creating highly effective flashcards. Return ONLY valid JSON in a flat array: [{\"front\":\"\",\"back\":\"\"}]. No markdown, no preambles.",
                    'messages' => [
                        ['role' => 'user', 'content' => "Generate " . ($validated['card_count'] ?? 10) . " " . ($validated['difficulty'] ?? 'medium') . " difficulty flashcards on: " . $sourceContent]
                    ],
                    'temperature' => 0.7,
                ];

                $onChunk = function ($chunk) use (&$fullContent, $useDeepseek, $emit) {
                    $text = '';
                    if ($useDeepseek) {
                        $text = $chunk['choices'][0]['delta']['content'] ?? '';
                    } else {
                        if ($chunk['type'] === 'content_block_delta') {
                            $text = $chunk['delta']['text'] ?? '';
                        }
                    }

                    if ($text !== '') {
                        $fullContent .= $text;
                        $emit(['text' => $text]);
                    }
                };

                try {
                    $service->streamRequest($params, $onChunk);
                } catch (\Exception $e) {
                    if (!$useDeepseek) {
                        Log::warning("Flashcard Stream Fallback: Claude failed, using DeepSeek. Error: " . $e->getMessage());
                        $modelUsed = 'deepseek-chat';
                        $params['model'] = $modelUsed;
                        $this->deepseek->streamRequest($params, $onChunk);
                    } else {
                        throw $e;
                    }
                }

                // 4. Credit Deduction (Atomic)
                $user->deductCredits(
                    $totalCost,
                    'flashcard_generation',
                    "Flashcard Generation (Streaming): " . $title,
                    $requestId,
                    $modelUsed
                );

                // Final Persistence logic (Ensure all are saved)
                try {
                    $cleanJson = preg_replace('/```(?:json)?|```/s', '', $fullContent);
                    $cardsData = json_decode(trim($cleanJson), true);
                    
                    if (is_array($cardsData)) {
                        DB::transaction(function () use ($cardsData, $deck) {
                            $existingCount = $deck->flashcards()->count();
                            
                            $toInsert = [];
                            foreach ($cardsData as $idx => $c) {
                                if (empty($c['front']) || empty($c['back'])) continue;
                                
                                // Avoid duplicates if possible (simple check by index or content)
                                if ($idx < $existingCount) continue;

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
                        });
                    }
                } catch (\Exception $saveEx) {
                    Log::error("Failed to final save streamed flashcards: " . $saveEx->getMessage());
                }

                echo "data: [DONE]\n\n";
            } catch (\Exception $e) {
                Log::error("[Streaming Flashcards Error] " . $e->getMessage(), [
                    'user_id' => $user->id,
                    'request_id' => $requestId,
                    'trace' => substr($e->getTraceAsString(), 0, 1000)
                ]);

                $msg = "Skeeme is down, Please try again later.";
                if ($e->getCode() === 403 || str_contains($e->getMessage(), 'credits')) {
                    $msg = $e->getMessage();
                }
                
                echo "data: " . json_encode(['error' => $msg]) . "\n\n";
                echo "data: [DONE]\n\n";
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
            'Content-Encoding' => 'none',
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
     * Create an empty deck
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf,doc,docx,txt,md|max:5120',
            'extraction_id' => 'nullable|string',
        ]);

        $title = $validated['topic'] ?? 'New Flashcard Set';
        
        if ($request->has('extraction_id')) {
            $extractionData = Cache::get("extraction_{$validated['extraction_id']}");
            if ($extractionData && isset($extractionData['original_name'])) {
                $title = $extractionData['original_name'];
            }
        } elseif ($request->hasFile('file')) {
            $title = $request->file('file')->getClientOriginalName();
        }

        $deck = FlashcardDeck::create([
            'user_id' => $request->user()->id,
            'title' => $title,
            'source_type' => ($request->hasFile('file') || $request->has('extraction_id')) ? 'file' : 'topic',
        ]);

        $sourceContent = '';
        if ($request->has('extraction_id')) {
            $extractionData = Cache::get("extraction_{$validated['extraction_id']}");
            $sourceContent = $extractionData ? $extractionData['text'] : '';
        } elseif ($request->hasFile('file')) {
            $file = $request->file('file');
            $sourceContent = $this->extractionService->extractText($file->getPathname(), $file->getClientOriginalExtension());
        } else {
            $sourceContent = $validated['topic'] ?? '';
        }

        if (!empty(trim((string)$sourceContent))) {
            Cache::put("deck_{$deck->id}_source", $sourceContent, now()->addMinutes(60));
        }

        return response()->json(['data' => $deck]);
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
     * Delete a deck
     */
    public function destroy(Request $request, $id)
    {
        $deck = FlashcardDeck::where('user_id', $request->user()->id)->findOrFail($id);
        $deck->delete();
        return response()->json(['message' => 'Deck deleted.']);
    }
}
