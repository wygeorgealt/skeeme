<?php

namespace App\Http\Controllers\API\Student;

use App\Services\AnthropicAIService as AIService;
use App\Services\DeepseekAIService;
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
    protected DeepseekAIService $deepseek;

    public function __construct(AIService $aiService, DeepseekAIService $deepseek)
    {
        $this->aiService = $aiService;
        $this->deepseek = $deepseek;
    }

    /**
     * Solve a question from a scanned image.
     */
    public function solve(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        $requestId = $idempotencyKey ?? (string) Str::uuid();
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
        
        // Use the Flat Rate "Buffer Average" strategy (Option A)
        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $scanCost = $pricingConfig['rates']['scan_solve'] ?? 25;

        Log::info('Scan & Solve: Credit Check Passed', ['user_id' => $user->id]);

        // 3. Preliminary Check & Lock Credits (Atomic)
        $canProceed = DB::transaction(function() use ($user, $scanCost) {
            $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);
            
            if (!$lockedUser->is_unlimited && $lockedUser->credits < $scanCost) {
                return false;
            }
            return true;
        });

        if (!$canProceed) {
            return response()->json([
                'message' => "Insufficient credits. You need at least {$scanCost} credits for a scan.",
                'required' => $scanCost,
                'available' => $user->credits,
            ], 403);
        }

        try {
            // 4. Generate Synchronously (Circuit Breaker implementation)
            Log::info('Processing Scan & Solve Synchronously...', ['user_id' => $user->id]);
            
            $activeProvider = Cache::get('skeeme:active_ai_provider', 'claude');
            if ($activeProvider === 'none') {
                throw new \Exception('Skeeme AI is currently undergoing scheduled maintenance. Please try again later.');
            }

            $useDeepseek = ($activeProvider === 'deepseek') || Cache::get('use_deepseek_fallback', false);
            $modelUsed = $useDeepseek ? 'deepseek-chat' : 'claude-3-5-haiku-20241022';

            // Dynamic Timeout based on Network Quality Header
            $networkType = $request->header('X-Network-Type');
            $networkGen = $request->header('X-Network-Generation');
            // Give Vision a bit more time because images are large
            $timeout = ($networkType === 'cellular' && in_array($networkGen, ['2g', '3g', 'edge'])) ? 30 : 60;
            
            $this->aiService->setTimeout($timeout);
            $this->deepseek->setTimeout($timeout + 60);

            try {
                if ($useDeepseek) {
                    Log::info("Circuit Breaker Active: Auto-routing Scan to DeepSeek (OCR Fallback).");
                    $result = $this->deepseek->solveFromImage($request->input('image'));
                } else {
                    Log::info("Calling primary Vision AI (Claude) for scan solve...");
                    $result = $this->aiService->solveFromImage($request->input('image'));
                }
            } catch (\Exception $e) {
                if (!$useDeepseek) {
                    Log::warning("Claude Vision API Failed! Circuit Breaker tripped. Failing over to DeepSeek. Error: " . $e->getMessage());
                    Cache::put('use_deepseek_fallback', true, now()->addMinutes(30));
                    $modelUsed = 'deepseek-chat';
                    $result = $this->deepseek->solveFromImage($request->input('image'));
                } else {
                    throw $e;
                }
            }

            $solutions = $result['results'] ?? [];
            $solutionsCount = count($solutions);
            
            // 5. Final Cost (Flat Rate)
            $finalCost = $scanCost;

            // 6. Deduct Usage (Atomic)
            if (!$user->is_unlimited) {
                DB::transaction(function() use ($user, $finalCost, $solutionsCount, $modelUsed, $requestId) {
                    $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);
                    $lockedUser->decrement('credits', $finalCost);
                    
                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'action_type' => 'scan_solve',
                            'amount' => -$finalCost,
                            'description' => "Scan & Solve: " . $solutionsCount . " questions processed",
                            'model_used' => $modelUsed ?? 'claude-3-5-haiku-20241022',
                            'request_id' => $requestId,
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
            Log::error("API Quiz Gen Critical Error: " . $e->getMessage());
            
            $message = $e->getMessage();
            if (str_contains(strtolower($message), 'failed') || 
                str_contains(strtolower($message), 'error 28') || 
                str_contains(strtolower($message), 'exception')) {
                $message = "Skeeme is down, Please try again later.";
            }
            return response()->json(['message' => $message], 500);
        }
    }
}
