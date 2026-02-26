<?php

namespace App\Http\Controllers\API\Student;

use App\Services\DeepseekAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class ScanController extends Controller
{
    protected DeepseekAIService $aiService;

    public function __construct(DeepseekAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Solve a question from a scanned image.
     */
    public function solve(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // base64-encoded image
        ]);

        $user = $request->user();
        $baseCost = 2; // Flat fee for OCR scanning
        $costPerSolution = 4; // Fee per question solved

        Log::info('Scan & Solve Started', ['user_id' => $user->id]);

        // Preliminary check for base cost
        if (!$user->is_unlimited && $user->credits < ($baseCost + $costPerSolution)) {
            return response()->json([
                'message' => "Insufficient credits. You need at least 6 credits for a basic scan.",
                'required' => 6,
                'available' => $user->credits,
            ], 403);
        }

        try {
            Log::info('Calling Deepseek Multi-Solve AI...');
            $result = $this->aiService->solveFromImage($request->input('image'));

            $solutionsCount = count($result['results'] ?? []);
            $totalCost = $baseCost + ($solutionsCount * $costPerSolution);

            // If we solved 0 questions (hallucination or empty image), just charge base cost
            if ($solutionsCount === 0) $totalCost = $baseCost;

            // Final check after processing
            if (!$user->is_unlimited && $user->credits < $totalCost) {
                // Technically we already spent AI tokens, but if we can't deduct, we fail
                return response()->json([
                    'message' => "This scan generated $solutionsCount solutions which costs $totalCost credits. You only have $user->credits.",
                    'required' => $totalCost,
                    'available' => $user->credits,
                ], 403);
            }

            // Deduct credits
            if (!$user->is_unlimited) {
                $user->decrement('credits', $totalCost);
                Log::info('Scan Credits Deducted', ['count' => $solutionsCount, 'total_cost' => $totalCost, 'new_total' => $user->fresh()->credits]);
            }

            Log::info('Scan & Solve Success', ['solutions_found' => $solutionsCount]);

            return response()->json([
                'results' => $result['results'] ?? [],
                'cost' => $totalCost,
                'credits_remaining' => $user->fresh()->credits
            ]);

        } catch (\Exception $e) {
            Log::error('Scan & Solve Failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to solve this question. Please try a clearer photo.',
            ], 500);
        }
    }
}
