<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\FileExtractionService;
use Illuminate\Support\Facades\Log;

class CreditCostCalculator
{
    protected $extractionService;

    public function __construct(FileExtractionService $extractionService)
    {
        $this->extractionService = $extractionService;
    }

    /**
     * Resolve the plan tier for the authenticated user.
     */
    protected function getPlanTier(Request $request): string
    {
        $user = $request->user();
        if (!$user || !method_exists($user, 'getStudentPlan')) {
            return 'free';
        }
        return $user->getStudentPlan() === 'free' ? 'free' : 'paid';
    }

    /**
     * Read a tiered rate value (supports both old flat int and new array format).
     */
    protected function tieredRate(mixed $rate, string $planTier, int $fallback): int
    {
        if (is_array($rate)) {
            return (int) ($rate[$planTier] ?? $fallback);
        }
        return (int) ($rate ?? $fallback);
    }

    /**
     * Calculate the credit cost for a given request.
     */
    public function calculate(Request $request): int
    {
        $path = $request->path();

        $config = \App\Models\SystemSetting::getPricingConfig();
        $rates = $config['rates'] ?? [];
        $planTier = $this->getPlanTier($request);

        // Scan & Solve
        if (Str::endsWith($path, 'scan/solve') || Str::endsWith($path, 'scan/solve/stream')) {
            return $this->tieredRate($rates['scan_solve'] ?? null, $planTier, 25);
        }

        // Quiz Builder
        if (Str::endsWith($path, 'quizzes/generate') || Str::endsWith($path, 'quizzes/generate/stream')) {
            return $this->tieredRate($rates['quiz_flat'] ?? null, $planTier, 30);
        }

        // Flashcards
        if (Str::endsWith($path, 'flashcards/generate') || Str::endsWith($path, 'flashcards/generate/stream')) {
            return $this->tieredRate($rates['flashcard_flat'] ?? null, $planTier, 25);
        }

        // Theory Grading
        if (Str::endsWith($path, 'quizzes/grade-theory')) {
            return $rates['theory_grading'] ?? 2;
        }

        return 0;
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
                Log::error("CreditCostCalculator: Extraction failed or empty content.");
                throw new \Exception("Could not extract content from the uploaded file for credit assessment.");
            }
            
            $content = $extracted;
            $request->attributes->set('extracted_text', $content);
        }

        return $content;
    }
}
