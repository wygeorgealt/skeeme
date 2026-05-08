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
     * Solve a question from a scanned image (Streaming SSE).
     */
    public function streamSolve(Request $request)
    {
        $request->validate(['image' => 'required|string']);
        $user = $request->user();

        // 1. Credit Check (Same as sync solve)
        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $scanRates = $pricingConfig['rates']['scan_solve'] ?? ['free' => 50, 'paid' => 25];
        $scanCost = is_array($scanRates) ? ($scanRates[$planTier] ?? 25) : $scanRates;

        if (!$user->is_unlimited && $user->credits < $scanCost) {
            return response()->json(['message' => "Insufficient credits."], 403);
        }

        $requestId = (string) Str::uuid();

        return response()->stream(function () use ($request, $user, $scanCost, $requestId) {
            $fullContent = '';
            $modelUsed = AIService::MODEL_SONNET;

            try {
                $params = [
                    'model' => $modelUsed,
                    'max_tokens' => 2048,
                    'system' => "You are a world-class tutor. Look at the image and solve every question you see. Return ONLY a raw JSON object matching this schema: {\"results\":[{\"question\":\"\",\"topic\":\"\",\"type\":\"\",\"solution\":\"\",\"steps\":[],\"explanation\":\"\",\"summary\":\"\"}]}",
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'image',
                                    'source' => [
                                        'type' => 'base64',
                                        'media_type' => 'image/jpeg',
                                        'data' => preg_replace('/^data:image\/(png|jpeg|jpg|gif|webp);base64,/', '', $request->input('image')),
                                    ]
                                ],
                                [
                                    'type' => 'text',
                                    'text' => "Solve this now."
                                ]
                            ]
                        ]
                    ],
                    'temperature' => 0.3,
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

                // Finalize Credit Deduction
                if (!$user->is_unlimited) {
                    $user->decrement('credits', $scanCost);
                    $user->transactions()->create([
                        'type' => 'usage',
                        'action_type' => 'scan_solve',
                        'amount' => -$scanCost,
                        'description' => "Scan & Solve (Streaming)",
                        'model_used' => $modelUsed,
                        'request_id' => $requestId,
                    ]);
                }

                echo "data: [DONE]\n\n";
            } catch (\Exception $e) {
                Log::error("Streaming Scan Error: " . $e->getMessage());
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
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $scanRates = $pricingConfig['rates']['scan_solve'] ?? ['free' => 50, 'paid' => 25];
        $scanCost = is_array($scanRates) ? ($scanRates[$planTier] ?? 25) : $scanRates;

        Log::info('Scan & Solve: Credit Check Passed', ['user_id' => $user->id]);



        // 3. Preliminary Check & Lock Credits (Atomic)
        $canProceed = DB::transaction(function () use ($user, $scanCost) {
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

            $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
            $activeProvider = $aiConfig['provider'];
            $isManualOverride = $aiConfig['is_manual'] ?? false;

            if ($activeProvider === 'none') {
                throw new \Exception('Skeeme AI is currently undergoing scheduled maintenance. Please try again later.');
            }

            $useDeepseek = ($activeProvider === 'deepseek');
            $modelUsed = $useDeepseek ? 'deepseek-chat' : 'claude-haiku-4-5-20251001';

            // Complex images (like medical scripts) take Claude a long time to parse.
            // Give the AI 3 full minutes (180s) to generate the response before timing out.
            $timeout = 180; 

            $this->aiService->setTimeout($timeout);
            $this->deepseek->setTimeout($timeout);

            try {
                if ($useDeepseek) {
                    Log::info("Circuit Breaker Active: Auto-routing Scan to DeepSeek (OCR Fallback).");
                    $result = $this->deepseek->solveFromImage($request->input('image'));
                } else {
                    Log::info("Calling primary Vision AI (Claude) for scan solve...");
                    $result = $this->aiService->solveFromImage($request->input('image'));
                }
            } catch (\Exception $e) {
                if ($isManualOverride) {
                    \App\Models\SystemSetting::triggerManualFailureAlert($activeProvider, 'Scan & Solve Generation', $e->getMessage());
                    throw $e;
                }

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
                DB::transaction(function () use ($user, $finalCost, $solutionsCount, $modelUsed, $requestId) {
                    $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);
                    $lockedUser->decrement('credits', $finalCost);

                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'action_type' => 'scan_solve',
                            'amount' => -$finalCost,
                            'description' => "Scan & Solve: " . $solutionsCount . " questions processed",
                            'model_used' => $modelUsed ?? 'claude-haiku-4-5-20251001',
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
            if (
                str_contains(strtolower($message), 'failed') ||
                str_contains(strtolower($message), 'error 28') ||
                str_contains(strtolower($message), 'exception')
            ) {
                $message = "Skeeme is down, Please try again later.";
            }
            return response()->json(['message' => $message], 500);
        }
    }

    /**
     * Stream solve a question from a scanned image (SSE)
     */
    public function streamSolve(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        $requestId = $idempotencyKey ?? (string) Str::uuid();

        set_time_limit(240); // 4 minutes

        Log::info('Scan & Solve Stream Request Received', [
            'user_id' => $request->user()?->id,
            'image_size' => strlen($request->input('image', '')),
        ]);
        $request->validate([
            'image' => 'required|string', // base64-encoded image
        ]);

        if (strlen($request->input('image')) > 5 * 1024 * 1024) {
            return response()->json(['message' => 'Image payload too large. Please use a smaller photo.'], 422);
        }

        $user = $request->user();

        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $scanRates = $pricingConfig['rates']['scan_solve'] ?? ['free' => 50, 'paid' => 25];
        $scanCost = is_array($scanRates) ? ($scanRates[$planTier] ?? 25) : $scanRates;

        $canProceed = DB::transaction(function () use ($user, $scanCost) {
            $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);
            if (!$lockedUser->is_unlimited && $lockedUser->credits < $scanCost) {
                return false;
            }
            return true;
        });

        if (!$canProceed) {
            return response()->json(['message' => "Insufficient credits."], 403);
        }

        return response()->stream(function () use ($request, $user, $scanCost, $requestId) {
            $fullContent = '';
            $modelUsed = 'claude-sonnet-4-6';

            try {
                $timeout = 180;
                $this->aiService->setTimeout($timeout);
                
                $this->aiService->streamSolveFromImage($request->input('image'), function ($chunk) use (&$fullContent) {
                    if ($chunk['type'] === 'content_block_delta') {
                        $text = $chunk['delta']['text'] ?? '';
                        $fullContent .= $text;
                        echo "data: " . json_encode(['text' => $text]) . "\n\n";
                        if (ob_get_level() > 0) ob_flush();
                        flush();
                    }
                });

                // Credit Deduction
                if (!$user->is_unlimited) {
                    $user->decrement('credits', $scanCost);
                    $user->transactions()->create([
                        'type' => 'usage',
                        'action_type' => 'scan_solve',
                        'amount' => -$scanCost,
                        'description' => "Scan & Solve (Streaming)",
                        'model_used' => $modelUsed,
                        'request_id' => $requestId,
                    ]);
                    Cache::forget("user_credits_{$user->id}");
                    \App\Jobs\CheckLowCredits::dispatch($user->id);
                }

                echo "data: [DONE]\n\n";
            } catch (\Exception $e) {
                Log::error("Streaming Scan Error: " . $e->getMessage());
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }
}
