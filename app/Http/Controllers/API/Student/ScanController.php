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
        set_time_limit(240);

        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        $requestId = $idempotencyKey ?? (string) Str::uuid();

        $sseHeaders = [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ];

        // Idempotency replay: re-emit cached result as a single full_result event
        if ($idempotencyKey && Cache::has("scan_idem_{$idempotencyKey}")) {
            $cached = Cache::get("scan_idem_{$idempotencyKey}");
            return response()->stream(function () use ($cached) {
                echo "data: " . json_encode(['type' => 'full_result', 'data' => $cached['data']]) . "\n\n";
                echo "data: " . json_encode(['type' => 'complete', 'credits_remaining' => $cached['credits_remaining']]) . "\n\n";
                echo "data: [DONE]\n\n";
                if (ob_get_level() > 0) ob_flush();
                flush();
            }, 200, $sseHeaders);
        }

        $request->validate(['image' => 'required|string']);

        if (strlen($request->input('image')) > 5 * 1024 * 1024) {
            return response()->json(['message' => 'Image payload too large. Please use a smaller photo.'], 422);
        }

        $user = $request->user();

        $scanCost = (int) $request->attributes->get('calculated_credit_cost', 0);
        if ($scanCost <= 0) {
            $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
            $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
            $scanRates = $pricingConfig['rates']['scan_solve'] ?? ['free' => 50, 'paid' => 25];
            $scanCost = is_array($scanRates) ? ($scanRates[$planTier] ?? 25) : $scanRates;
        }

        $canProceed = DB::transaction(function () use ($user, $scanCost) {
            $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);
            if (!$lockedUser->is_unlimited_student && $lockedUser->credits < $scanCost) {
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

        return response()->stream(function () use ($request, $user, $scanCost, $requestId, $idempotencyKey) {
            $emit = function (array $payload) {
                echo "data: " . json_encode($payload) . "\n\n";
                if (ob_get_level() > 0) ob_flush();
                flush();
            };

            // 1. Immediate Heartbeat/Status to avoid 504
            $emit(['type' => 'status', 'message' => 'Connected to Skeeme AI...']);

            $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
            $activeProvider = $aiConfig['provider'];
            $isManualOverride = $aiConfig['is_manual'] ?? false;

            if ($activeProvider === 'none') {
                $emit(['type' => 'error', 'message' => 'Skeeme AI is currently undergoing scheduled maintenance. Please try again later.']);
                echo "data: [DONE]\n\n";
                return;
            }

            $useDeepseek = ($activeProvider === 'deepseek');
            $modelUsed = $useDeepseek ? 'deepseek-chat' : AIService::MODEL_SONNET;
            $fullContent = '';
            $deepseekResult = null;

            $this->aiService->setTimeout(180);
            $this->deepseek->setTimeout(180);

            try {
                if ($useDeepseek) {
                    Log::info("Streaming Scan: Circuit Breaker active, using Deepseek (streaming OCR + SSE).");
                    $this->deepseek->streamSolveFromImage(
                        $request->input('image'), 
                        function ($chunk) use (&$fullContent, $emit, &$deepseekResult) {
                            $delta = $chunk['choices'][0]['delta']['content']
                                ?? $chunk['choices'][0]['delta']['text']
                                ?? null;

                            if (!is_string($delta) || $delta === '') {
                                return;
                            }

                            $fullContent .= $delta;
                            $emit(['type' => 'text_delta', 'text' => $delta]);
                        },
                        function ($status) use ($emit) {
                            $emit(['type' => 'status', 'message' => $status]);
                        }
                    );

                    $deepseekResult = $this->parseStreamedJson($fullContent);
                    $emit(['type' => 'full_result', 'data' => $deepseekResult ?? []]);
                } else {
                    $this->aiService->streamSolveFromImage($request->input('image'), function ($chunk) use (&$fullContent, $emit) {
                        if ($chunk['type'] === 'content_block_delta') {
                            $text = $chunk['delta']['text'] ?? '';
                            if ($text === '') return;
                            $fullContent .= $text;
                            $emit(['type' => 'text_delta', 'text' => $text]);
                        }
                    });

                    $parsedResult = $this->parseStreamedJson($fullContent);
                    if ($parsedResult) {
                        $emit(['type' => 'full_result', 'data' => $parsedResult]);
                    }
                }
            } catch (\Exception $e) {
                if (!$useDeepseek && !$isManualOverride) {
                    Log::warning("Claude stream failed, falling back to Deepseek: " . $e->getMessage());
                    Cache::put('use_deepseek_fallback', true, now()->addMinutes(30));
                    try {
                        $deepseekResult = $this->deepseek->solveFromImage($request->input('image'));
                        $modelUsed = 'deepseek-chat';
                        $emit(['type' => 'full_result', 'data' => $deepseekResult]);
                    } catch (\Exception $e2) {
                        Log::error("Deepseek fallback also failed: " . $e2->getMessage());
                        $emit(['type' => 'error', 'message' => 'Skeeme is down, Please try again later.']);
                        echo "data: [DONE]\n\n";
                        return;
                    }
                } else {
                    if ($isManualOverride) {
                        \App\Models\SystemSetting::triggerManualFailureAlert($activeProvider, 'Scan & Solve Streaming', $e->getMessage());
                    }
                    Log::error("Streaming Scan Error: " . $e->getMessage());
                    $emit(['type' => 'error', 'message' => 'Skeeme is down, Please try again later.']);
                    echo "data: [DONE]\n\n";
                    return;
                }
            }

            // Atomic credit deduction
            if (!$user->is_unlimited_student) {
                DB::transaction(function () use ($user, $scanCost, $modelUsed, $requestId) {
                    $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);
                    $lockedUser->decrement('credits', $scanCost);
                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'action_type' => 'scan_solve',
                            'amount' => -$scanCost,
                            'description' => "Scan & Solve (Streaming)",
                            'model_used' => $modelUsed,
                            'request_id' => $requestId,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to log scan transaction: " . $e->getMessage());
                    }
                });
                Cache::forget("user_credits_{$user->id}");
                \App\Jobs\CheckLowCredits::dispatch($user->id);
            }

            $remaining = $user->fresh()->credits;
            $emit(['type' => 'complete', 'credits_remaining' => $remaining]);

            // Idempotency cache (store final shape so replays look the same as live)
            if ($idempotencyKey) {
                $cachePayload = [
                    'credits_remaining' => $remaining,
                    'data' => $deepseekResult ?? $this->parseStreamedJson($fullContent),
                ];
                if ($cachePayload['data']) {
                    Cache::put("scan_idem_{$idempotencyKey}", $cachePayload, now()->addHours(24));
                }
            }

            echo "data: [DONE]\n\n";
            if (ob_get_level() > 0) ob_flush();
            flush();
        }, 200, $sseHeaders);
    }

    /**
     * Best-effort parse of streamed JSON content for idempotency caching.
     */
    protected function parseStreamedJson(string $content): ?array
    {
        $clean = trim(preg_replace('/```(?:json)?|```/', '', $content));
        $decoded = json_decode($clean, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
        if (preg_match('/\{[\s\S]*\}/', $content, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }
        return null;
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
        $scanCost = (int) $request->attributes->get('calculated_credit_cost', 0);
        if ($scanCost <= 0) {
            $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
            $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
            $scanRates = $pricingConfig['rates']['scan_solve'] ?? ['free' => 50, 'paid' => 25];
            $scanCost = is_array($scanRates) ? ($scanRates[$planTier] ?? 25) : $scanRates;
        }

        Log::info('Scan & Solve: Credit Check Passed', ['user_id' => $user->id]);



        // 3. Preliminary Check & Lock Credits (Atomic)
        $canProceed = DB::transaction(function () use ($user, $scanCost) {
            $lockedUser = \App\Models\User::where('id', '=', $user->id)->lockForUpdate()->first(['*']);

            if (!$lockedUser->is_unlimited_student && $lockedUser->credits < $scanCost) {
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
            if (!$user->is_unlimited_student) {
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
                'credits_deducted' => $user->is_unlimited_student ? 0 : $finalCost,
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
}
