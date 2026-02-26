<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FlashcardDeck;
use App\Models\Flashcard;
use App\Services\DeepseekAIService;
use App\Services\FileExtractionService;
use App\Services\StreakService;
use Illuminate\Support\Facades\Log;

class FlashcardController extends Controller
{
    protected $aiService;
    protected $extractionService;

    public function __construct(DeepseekAIService $aiService, FileExtractionService $extractionService)
    {
        $this->aiService = $aiService;
        $this->extractionService = $extractionService;
    }

    /**
     * List all flashcard decks for the user
     */
    public function index(Request $request)
    {
        $decks = FlashcardDeck::where('user_id', $request->user()->id)
            ->withCount('flashcards')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $decks]);
    }

    /**
     * Get a specific deck and its cards
     */
    public function show(Request $request, $id)
    {
        $deck = FlashcardDeck::where('user_id', $request->user()->id)
            ->with(['flashcards' => function($q) {
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
                $safeName = time() . '_' . \Str::slug($title) . '.' . $file->getClientOriginalExtension();
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

        // 2. Calculate dynamic cost
        $wordCount = str_word_count($sourceContent);
        $costPerQuestion = match($validated['difficulty'] ?? 'medium') {
            'easy' => 0.5,
            'medium' => 1,
            'hard' => 1.5,
            'mixed' => 1.2,
            default => 1,
        };
        $baseContentCost = max(floor($wordCount / 500), 1);
        $totalCost = (int) ceil(($validated['card_count'] * $costPerQuestion) + $baseContentCost);
        Log::info("Cost Calculated", ['cost' => $totalCost, 'words' => $wordCount]);

        // 3. Check credits
        if (!$user->is_unlimited && $user->credits < $totalCost) {
            Log::warning("Insufficient Credits", ['user_id' => $user->id, 'credits' => $user->credits, 'needed' => $totalCost]);
            return response()->json([
                'message' => "Insufficient credits. Generating this deck requires ~$totalCost credits.",
                'required' => $totalCost,
                'available' => $user->credits
            ], 403);
        }

        // 4. Generate Cards
        Log::info("Calling Deepseek AI...");
        try {
            $cardsData = $this->aiService->generateFlashcards(
                [$sourceContent],
                $validated['card_count'],
                $validated['difficulty'] ?? 'medium',
                $validated['topic'] ?? ''
            );

            // 5. Save everything to DB
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

            // 6. Deduct credits
            if (!$user->is_unlimited) {
                $user->decrement('credits', $totalCost);
                // Try logging billing transaction, ignore if fails
                try {
                    $user->transactions()->create([
                        'type' => 'usage',
                        'amount' => -$totalCost,
                        'description' => "Generated Flashcard Deck: $title ($totalCost credits)",
                    ]);
                } catch (\Exception $e) {}
            }

            $user->refresh();

            // Update User Streak
            app(StreakService::class)->logActivity($user->id);

            // Return full deck with cards
            Log::info("Flashcard Generation Success", ['deck_id' => $deck->id, 'cards' => count($cardsToInsert)]);
            return response()->json([
                'data' => $deck->load('flashcards'),
                'deck_id' => $deck->id,
                'remaining_credits' => $user->credits,
            ]);

        } catch (\Exception $e) {
            Log::error('Flashcard Generation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Generation failed: ' . $e->getMessage()], 500);
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
