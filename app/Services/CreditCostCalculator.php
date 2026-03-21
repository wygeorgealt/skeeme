<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\FileExtractionService;

class CreditCostCalculator
{
    protected $extractionService;

    public function __construct(FileExtractionService $extractionService)
    {
        $this->extractionService = $extractionService;
    }

    /**
     * Calculate the credit cost for a given request.
     */
    public function calculate(Request $request): int
    {
        $path = $request->path();

        $rates = \App\Models\SystemSetting::getPricingConfig()['rates'];

        // Scan & Solve
        if (Str::contains($path, 'scan/solve')) {
            return $rates['scan_solve'] ?? 15;
        }

        // Quiz Builder
        if (Str::contains($path, 'quizzes/generate')) {
            return $this->calculateQuizCost($request, $rates);
        }

        // Flashcards
        if (Str::contains($path, 'flashcards/generate')) {
            return $this->calculateFlashcardCost($request, $rates);
        }

        // Theory Grading
        if (Str::contains($path, 'quizzes/grade-theory')) {
            return $rates['theory_grading'] ?? 2;
        }

        return 0;
    }

    /**
     * Quiz cost: base per question + weight per 500 words.
     */
    protected function calculateQuizCost(Request $request, array $rates): int
    {
        $count = (int) $request->input('question_count', 10);
        $baseCost = $count * ($rates['quiz_base'] ?? 1);
        
        $content = $this->getOrExtractContent($request);
        $wordCount = str_word_count($content);
        $chunks = (int) ceil($wordCount / 500); 
        $weightCost = $chunks * ($rates['quiz_weight'] ?? 5);
        
        return (int) max(10, $baseCost + $weightCost);
    }

    /**
     * Flashcard cost: dynamic per-difficulty + weight per 500 words.
     */
    protected function calculateFlashcardCost(Request $request, array $rates): int
    {
        $count = (int) $request->input('card_count', 10);
        $difficulty = $request->input('difficulty', 'medium');
        
        $multiplier = match($difficulty) {
            'easy' => 0.5,
            'medium' => 1,
            'hard' => 1.5,
            'mixed' => 1.2,
            default => 1,
        };
        
        $baseCostPerCard = ($rates['flashcard_base'] ?? 1) * $multiplier;
        
        $content = $this->getOrExtractContent($request);
        $wordCount = str_word_count($content);
        $chunks = (int) ceil($wordCount / 500);
        $weightCost = $chunks * ($rates['flashcard_weight'] ?? 5);
        
        return (int) ceil(($count * $baseCostPerCard) + $weightCost);
    }

    /**
     * Helper to get content from topic or file, caching in request.
     */
    public function getOrExtractContent(Request $request): string
    {
        if ($request->attributes->has('extracted_text')) {
            return $request->attributes->get('extracted_text');
        }

        $content = $request->input('topic', '');
        
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extracted = $this->extractionService->extractText($file->getRealPath(), $file->getClientOriginalExtension());
            
            if (!$extracted || empty(trim($extracted))) {
                \Log::error("CreditCostCalculator: Extraction failed or empty content.");
                throw new \Exception("Could not extract content from the uploaded file for credit assessment.");
            }
            
            $content = $extracted;
            $request->attributes->set('extracted_text', $content);
        }

        return $content;
    }
}
