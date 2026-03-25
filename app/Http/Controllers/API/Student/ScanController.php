<?php

namespace App\Http\Controllers\API\Student;

use App\Services\AnthropicAIService as AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Jobs\ProcessAIScanSolve;
use App\Http\Controllers\Controller;

class ScanController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Solve a question from a scanned image.
     */
    public function solve(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        if ($idempotencyKey && Cache::has("idempotency_{$idempotencyKey}")) {
            Log::info("Scan & Solve: Idempotency cache hit", ['key' => $idempotencyKey]);
            return response()->json(Cache::get("idempotency_{$idempotencyKey}"));
        }

        set_time_limit(240); // 4 minutes
        
        Log::info('Scan & Solve Request Received', [
            'user_id' => $request->user()?->id,
            'image_size' => strlen($request->input('image', '')),
        ]);
        $request->validate([
            'image' => 'required|string', // base64-encoded image
        ]);

        // Security: Payload size validation (max 5MB base64 string ~3.7MB image)
        if (strlen($request->input('image')) > 5 * 1024 * 1024) {
            return response()->json(['message' => 'Image payload too large. Please use a smaller photo.'], 422);
        }

        $user = $request->user();
        $baseCost = 2; // Flat fee for OCR scanning
        $costPerSolution = 4; // Fee per question solved

        Log::info('Scan & Solve: Credit Check Passed', ['user_id' => $user->id]);

        // 3. Preliminary Check & Lock Credits (Atomic)
        $canProceed = DB::transaction(function() use ($user, $baseCost, $costPerSolution) {
            $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
            
            if (!$lockedUser->is_unlimited && $lockedUser->credits < ($baseCost + $costPerSolution)) {
                return false;
            }
            return true;
        });

        if (!$canProceed) {
            return response()->json([
                'message' => "Insufficient credits. You need at least 6 credits for a basic scan.",
                'required' => 6,
                'available' => $user->credits,
            ], 403);
        }

        try {
            // 4. Generate Synchronously (Fixing Sync Issue for Mobile)
            Log::info('Processing Scan & Solve Synchronously...', ['user_id' => $user->id]);
            
            $result = $this->aiService->solveFromImage($request->input('image'));
            $solutions = $result['results'] ?? [];
            $solutionsCount = count($solutions);
            
            // 5. Calculate Final Cost
            $finalCost = $baseCost + ($solutionsCount * $costPerSolution);
            if ($solutionsCount === 0) $finalCost = $baseCost;

            // 6. Deduct Usage (Atomic)
            if (!$user->is_unlimited) {
                DB::transaction(function() use ($user, $finalCost, $solutionsCount) {
                    $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                    $lockedUser->decrement('credits', $finalCost);
                    
                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'amount' => -$finalCost,
                            'description' => "Scan & Solve: " . $solutionsCount . " questions processed",
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to log scan transaction: " . $e->getMessage());
                    }
                });

                // Invalidate credit cache
                Cache::forget("user_credits_{$user->id}");

                // Check if user is running low on credits
                \App\Jobs\CheckLowCredits::dispatch($user->id);
            }

            $responseData = [
                'message' => 'Image processed successfully.',
                'results' => $solutions,
                'cost' => $finalCost,
                'credits_deducted' => $user->is_unlimited ? 0 : $finalCost,
                'remaining_credits' => $user->fresh()->credits
            ];

            if ($idempotencyKey) {
                Cache::put("idempotency_{$idempotencyKey}", $responseData, now()->addHours(24));
            }

            return response()->json($responseData);

        } catch (\Exception $e) {
            Log::error('Scan & Solve Failed: ' . $e->getMessage());
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
