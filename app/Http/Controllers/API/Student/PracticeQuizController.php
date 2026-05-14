<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AnthropicAIService as AIService;
use App\Services\DeepseekAIService;
use App\Services\FileExtractionService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Jobs\ProcessAIQuiz;

class PracticeQuizController extends Controller
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
     * Generate a practice quiz from topic or file (Streaming SSE)
     */
    public function streamGenerate(Request $request)
    {
        set_time_limit(600);

        try {
            $validated = $request->validate([
                'topic' => 'required_without:file|nullable|string|max:255',
                'file' => 'required_without:topic|nullable|file|mimes:pdf,docx,txt,md|max:10240',
                'question_count' => 'required|integer|min:10|max:30',
                'question_types' => 'required|array|min:1',
                'question_types.*' => 'in:mcq,theory',
                'difficulty' => 'nullable|in:easy,medium,hard',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation error', 'errors' => $e->errors()], 422);
        }

        $user = $request->user();
        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
        $quizRates = $pricingConfig['rates']['quiz_flat'] ?? ['free' => 30, 'paid' => 30];
        $totalCost = is_array($quizRates) ? ($quizRates[$planTier] ?? 30) : $quizRates;

        if (!$user->is_unlimited_student && $user->credits < $totalCost) {
            return response()->json(['message' => "Insufficient credits. You need $totalCost credits."], 403);
        }

        $requestId = (string) Str::uuid();

        return response()->stream(function () use ($request, $user, $validated, $totalCost, $requestId) {
            $emit = function (array $payload) {
                echo "data: " . json_encode($payload) . "\n\n";
                if (ob_get_level() > 0) ob_flush();
                flush();
            };

            $fullContent = '';
            
            try {
                // 1. Initial Status
                $emit(['type' => 'status', 'message' => 'Skeeming...']);

                // 2. Resource Extraction (Moved inside stream to avoid 504/Blocking)
                $sourceContent = '';
                if ($request->hasFile('file')) {
                    $emit(['type' => 'status', 'message' => 'Analyzing Document...']);
                    $sourceContent = $this->extractionService->extractText($request->file('file')->getPathname(), $request->file('file')->getClientOriginalExtension());
                } else {
                    $sourceContent = $validated['topic'];
                }

                if (empty(trim($sourceContent))) {
                    $emit(['error' => 'No content found to generate quiz from.']);
                    echo "data: [DONE]\n\n";
                    return;
                }

                // 3. Document Condensing (if needed)
                if (str_word_count($sourceContent) >= 3000) {
                    $emit(['type' => 'status', 'message' => 'Summarizing material...']);
                    $sourceContent = $this->deepseek->condenseMaterial($sourceContent, (int) $validated['question_count'], 'quiz');
                }

                $emit(['type' => 'status', 'message' => 'Generating Questions...']);

                $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
                $activeProvider = $aiConfig['provider'];
                $useDeepseek = ($activeProvider === 'deepseek');
                
                $modelUsed = $useDeepseek ? 'deepseek-chat' : AIService::MODEL_HAIKU;
                $service = $useDeepseek ? $this->deepseek : $this->aiService;

                $params = [
                    'model' => $modelUsed,
                    'max_tokens' => $this->aiService->calculateMaxTokens("mcq_" . ($validated['difficulty'] ?? 'medium'), $validated['question_count']),
                    'system' => "You are a quiz generator. Return ONLY raw JSON array matching the requested schema. No conversational text, no markdown. Schema: [{\"question_text\":\"\",\"options\":[\"\",\"\",\"\",\"\"],\"correct_answer\":\"\",\"explanation\":\"\",\"question_type\":\"multiple_choice|essay\"}]",
                    'messages' => [
                        ['role' => 'user', 'content' => "Generate a " . ($validated['difficulty'] ?? 'medium') . " quiz with " . ($validated['question_count'] ?? 10) . " questions on the following topic/material: " . $sourceContent]
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
                        Log::warning("Quiz Stream Fallback: Claude failed, using DeepSeek. Error: " . $e->getMessage());
                        $modelUsed = 'deepseek-chat';
                        $params['model'] = $modelUsed;
                        $this->deepseek->streamRequest($params, $onChunk);
                    } else {
                        throw $e;
                    }
                }

                // 4. Credit Deduction (Atomic)
                if (!$user->is_unlimited_student) {
                    DB::transaction(function () use ($user, $totalCost, $modelUsed, $requestId, $validated) {
                        $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                        $lockedUser->decrement('credits', $totalCost);
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'action_type' => 'quiz_generation',
                            'amount' => -$totalCost,
                            'description' => "Practice Quiz (Streaming): " . ($validated['topic'] ?? 'File Content'),
                            'model_used' => $modelUsed,
                            'request_id' => $requestId,
                        ]);
                    });
                }

                echo "data: [DONE]\n\n";
            } catch (\Exception $e) {
                Log::error("[Streaming Quiz Error] " . $e->getMessage(), [
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
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Generate a practice quiz from topic or file
     */
    public function generate(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        $requestId = $idempotencyKey ?? (string) Str::uuid();
        if ($idempotencyKey && Cache::has("idempotency_{$idempotencyKey}")) {
            Log::info("Quiz Generation: Idempotency cache hit", ['key' => $idempotencyKey]);
            return response()->json(Cache::get("idempotency_{$idempotencyKey}"));
        }

        set_time_limit(600); // Massive boost for 50+ page documents
        Log::info("[AI Quiz] Generation Started", [
            'user_id' => Auth::id(),
            'idempotency_key' => $request->header('Idempotency-Key'),
            'topic' => $request->input('topic'),
            'question_count' => $request->input('question_count'),
            'difficulty' => $request->input('difficulty')
        ]);

        try {
            // Log 1: Validation
            $validated = $request->validate([
                'topic' => 'required_without:file|nullable|string|max:255',
                'file' => 'required_without:topic|nullable|file|mimes:pdf,docx,txt,md|max:10240',
                'question_count' => 'required|integer|min:10|max:30',
                'question_types' => 'required|array|min:1',
                'question_types.*' => 'in:mcq,theory',
                'difficulty' => 'nullable|in:easy,medium,hard',
            ]);
            Log::info("Validation Passed");

            $user = Auth::user();
            $sourceContent = '';

            // 1. Handle File Upload & Extraction
            if ($request->hasFile('file')) {
                Log::info("Processing File Upload");
                $file = $request->file('file');
                $tempPath = $file->getRealPath();

                // Extract text immediately for AI analysis
                $sourceContent = $this->extractionService->extractText($tempPath, $file->getClientOriginalExtension());
                if (!$sourceContent) {
                    Log::error("Text extraction failed for path: " . $tempPath);
                    throw new \Exception("Could not extract text from the uploaded file.");
                }
                Log::info("Text Extracted", ['length' => strlen($sourceContent)]);

                // Upload to R2 for persistent storage
                $safeName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                Log::info("Uploading to R2...", ['name' => $safeName]);
                $r2Path = $file->storeAs('student-uploads/quizzes/' . $user->id, $safeName, config('filesystems.default'));
                Log::info("R2 Upload Success", ['path' => $r2Path]);
            } else {
                $sourceContent = $validated['topic'];
                Log::info("Processing Topic", ['topic' => $sourceContent]);
            }

            // 1b. Pre-summarize long documents to reduce AI token costs
            if ($request->hasFile('file') && str_word_count($sourceContent) >= 3000) {
                $sourceContent = $this->deepseek->condenseMaterial(
                    $sourceContent,
                    $validated['question_count'] ?? 10,
                    'quiz'
                );
            }

            // 2. Calculate Dynamic Cost
            $wordCount = str_word_count($sourceContent);

            // Hard Word Limit Protector
            if ($wordCount > 40000) {
                Log::warning("Word limit exceeded", ['user_id' => $user->id, 'word_count' => $wordCount]);
                return response()->json([
                    'message' => "This document is too large for AI processing. Please limit it to 40,000 words (approx. 80-100 pages).",
                ], 422);
            }

            $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
            $rates = $pricingConfig['rates'] ?? [];

            // Flat tiered cost based on subscription plan
            $planTier = $user->getStudentPlan() === 'free' ? 'free' : 'paid';
            $quizRates = $rates['quiz_flat'] ?? ['free' => 30, 'paid' => 30];
            $totalCost = is_array($quizRates) ? ($quizRates[$planTier] ?? 30) : $quizRates;

            Log::info("[AI Quiz] Cost Calculated", ['cost' => $totalCost, 'words' => $wordCount, 'plan' => $planTier]);

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
                    'message' => "Insufficient credits. This generation costs $totalCost credits.",
                    'credits' => $user->credits,
                    'required_credits' => $totalCost
                ], 403);
            }

            // 5. Generate Synchronously (Circuit Breaker implementation)
            $types = [];
            foreach ($validated['question_types'] as $type) {
                if ($type === 'mcq') $types[] = 'multiple_choice';
                if ($type === 'theory') $types[] = 'essay';
            }

            // --- AI Provider Baseline (Fast Routing) ---
            $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
            $activeProvider = $aiConfig['provider'];
            $isManualOverride = $aiConfig['is_manual'] ?? false;

            if ($activeProvider === 'none') {
                Log::error("[AI Quiz] Global AI Outage active. Rejecting request instantly.");
                throw new \Exception('Skeeme AI is currently undergoing scheduled maintenance. Please try again later.');
            }

            $useDeepseek = ($activeProvider === 'deepseek');
            $modelUsed = $useDeepseek ? 'deepseek-chat' : 'claude-haiku-4-5-20251001';

            // Dynamic Timeout based on Network Quality Header
            $networkType = $request->header('X-Network-Type');
            $networkGen = $request->header('X-Network-Generation');
            $timeout = ($networkType === 'cellular' && in_array($networkGen, ['2g', '3g', 'edge'])) ? 30 : 60;

            $this->aiService->setTimeout($timeout);
            $this->deepseek->setTimeout($timeout + 60); // Give fallback more room (120s max)

            try {
                if ($useDeepseek) {
                    Log::info("[AI Quiz] Circuit Breaker Active: Auto-routing to DeepSeek.");
                    $questions = $this->deepseek->generateQuestions(
                        [$sourceContent],
                        $validated['question_count'] ?? 10,
                        $validated['difficulty'] ?? 'medium',
                        $types,
                        $validated['topic'] ?? 'General Knowledge',
                        false,
                        null,
                        $user->ai_preferences
                    );
                } else {
                    Log::info("[AI Quiz] Calling primary AI service...", [
                        'user_id' => $user->id,
                        'service' => 'Anthropic',
                        'prompt_preview' => substr($sourceContent, 0, 100)
                    ]);
                    $questions = $this->aiService->generateQuestions(
                        [$sourceContent],
                        $validated['question_count'] ?? 10,
                        $validated['difficulty'] ?? 'medium',
                        $types,
                        $validated['topic'] ?? 'General Knowledge',
                        false,
                        null,
                        $user->ai_preferences
                    );
                }
            } catch (\Exception $e) {
                if ($isManualOverride) {
                    \App\Models\SystemSetting::triggerManualFailureAlert($activeProvider, 'Practice Quiz Generation', $e->getMessage());
                    throw $e; // Bubble up to outer catch for standard "Skeeme is down" 500
                }

                if (!$useDeepseek) {
                    Log::warning("Claude API Failed! Circuit Breaker tripped. Failing over to DeepSeek. Error: " . $e->getMessage());
                    Cache::put('use_deepseek_fallback', true, now()->addMinutes(30));
                    $modelUsed = 'deepseek-chat';
                    $questions = $this->deepseek->generateQuestions(
                        [$sourceContent],
                        $validated['question_count'] ?? 10,
                        $validated['difficulty'] ?? 'medium',
                        $types,
                        $validated['topic'] ?? 'General Knowledge',
                        false,
                        null,
                        $user->ai_preferences
                    );
                } else {
                    throw $e;
                }
            }

            if (empty($questions)) {
                Log::error("[AI Quiz] AI returned empty questions array");
                throw new \Exception('AI returned no questions. Please try a different topic or document.');
            }

            Log::info("[AI Quiz] Success! Questions generated.", ['count' => count($questions)]);

            // 6. Deduct Usage (Atomic) - Only AFTER successful generation
            if (!$user->is_unlimited_student) {
                DB::transaction(function () use ($user, $totalCost, $validated, $modelUsed, $requestId) {
                    $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                    $lockedUser->decrement('credits', $totalCost);

                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'action_type' => 'quiz_generation',
                            'amount' => -$totalCost,
                            'description' => "Practice Quiz: " . ($validated['question_count'] ?? 10) . " questions on " . ($validated['topic'] ?? 'File'),
                            'model_used' => $modelUsed ?? 'claude-haiku-4-5-20251001',
                            'request_id' => $requestId,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to log quiz transaction: " . $e->getMessage());
                    }
                });
                Log::info("Credits Deducted", ['new_total' => $user->fresh()->credits]);

                // Check if user is running low on credits
                \App\Jobs\CheckLowCredits::dispatch($user->id);
            }

            // 8. Cleanup MCQ formatting to ensure correct answer text is preserved after shuffle
            foreach ($questions as &$q) {
                if ($q['question_type'] === 'multiple_choice' && !empty($q['options'])) {
                    $originalCorrectValue = trim($q['correct_answer']);
                    $keyMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'E' => 4];
                    $correctText = '';

                    // Match logic: Letter Key (A) or Full Text
                    if (isset($keyMap[strtoupper($originalCorrectValue)])) {
                        $index = $keyMap[strtoupper($originalCorrectValue)];
                        $correctText = $q['options'][$index] ?? $q['options'][0] ?? '';
                    } else {
                        // Search for the text match in options if index fails
                        foreach ($q['options'] as $opt) {
                            if (strtolower(trim($opt)) === strtolower($originalCorrectValue)) {
                                $correctText = $opt;
                                break;
                            }
                        }
                        if (!$correctText) $correctText = $q['options'][0] ?? $originalCorrectValue;
                    }

                    shuffle($q['options']);
                    $q['correct_answer'] = $correctText;
                }
            }

            $responseData = [
                'questions' => $questions,
                'credits_deducted' => $totalCost,
                'remaining_credits' => $user->fresh()->credits
            ];

            if ($idempotencyKey) {
                Cache::put("idempotency_{$idempotencyKey}", $responseData, now()->addHours(24));
            }

            return response()->json($responseData);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning("Validation Failed", $e->errors());
            return response()->json(['message' => 'Validation error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error("[AI Quiz] Critical Error: " . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => substr($e->getTraceAsString(), 0, 500)
            ]);

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
     * Grade a student's theory/essay answer using AI
     */
    public function gradeTheory(Request $request)
    {
        $validated = $request->validate([
            'question_text'  => 'required|string',
            'student_answer' => 'required|string|min:5',
            'model_answer'   => 'nullable|string',
        ]);

        try {
            $aiConfig = \App\Models\SystemSetting::getActiveAIProvider();
            $activeProvider = $aiConfig['provider'];
            $isManualOverride = $aiConfig['is_manual'] ?? false;

            if ($activeProvider === 'none') {
                throw new \Exception('Skeeme AI is currently undergoing scheduled maintenance. Please try again later.');
            }
            $useDeepseek = ($activeProvider === 'deepseek');

            $networkType = $request->header('X-Network-Type');
            $timeout = ($networkType === 'cellular') ? 15 : 30;
            $this->aiService->setTimeout($timeout);
            $this->deepseek->setTimeout($timeout + 30);

            try {
                if ($useDeepseek) {
                    $result = $this->deepseek->gradeTheoryAnswer($validated['question_text'], $validated['student_answer'], $validated['model_answer'] ?? '', [], 10.0);
                } else {
                    $result = $this->aiService->gradeTheoryAnswer($validated['question_text'], $validated['student_answer'], $validated['model_answer'] ?? '', [], 10.0);
                }
            } catch (\Exception $e) {
                if ($isManualOverride) {
                    \App\Models\SystemSetting::triggerManualFailureAlert($activeProvider, 'Practice Quiz Grading', $e->getMessage());
                    throw $e;
                }

                if (!$useDeepseek) {
                    Log::warning("Claude API Failed on Grading! Circuit Breaker tripped. Error: " . $e->getMessage());
                    Cache::put('use_deepseek_fallback', true, now()->addMinutes(30));
                    $result = $this->deepseek->gradeTheoryAnswer($validated['question_text'], $validated['student_answer'], $validated['model_answer'] ?? '', [], 10.0);
                } else {
                    throw $e;
                }
            }

            return response()->json([
                'score'    => $result['marks'] ?? 0,
                'max'      => 10.0,
                'feedback' => $result['ai_feedback'] ?? 'No feedback available.',
                'passed'   => ($result['marks'] ?? 0) >= 5,
            ]);
        } catch (\Exception $e) {
            Log::error('Theory grading error: ' . $e->getMessage());
            $message = $e->getMessage();
            if (str_contains(strtolower($message), 'failed') || str_contains(strtolower($message), 'exception')) {
                $message = "Skeeme is down, Please try again later.";
            }
            return response()->json(['message' => $message], 500);
        }
    }
}
