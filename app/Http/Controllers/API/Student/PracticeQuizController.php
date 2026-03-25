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
     * Generate a practice quiz from topic or file
     */
    public function generate(Request $request)
    {
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->input('idempotency_key');
        if ($idempotencyKey && Cache::has("idempotency_{$idempotencyKey}")) {
            Log::info("Quiz Generation: Idempotency cache hit", ['key' => $idempotencyKey]);
            return response()->json(Cache::get("idempotency_{$idempotencyKey}"));
        }

        set_time_limit(600); // Massive boost for 50+ page documents
        Log::info("Quiz Generation Started", $request->except(['file']));

        try {
            // Log 1: Validation
            $validated = $request->validate([
                'topic' => 'required_without:file|nullable|string|max:255',
                'file' => 'required_without:topic|nullable|file|mimes:pdf,docx,txt,md|max:10240',
                'question_count' => 'required|integer|min:10|max:50',
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
                $safeName = time() . '_' . \Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                Log::info("Uploading to R2...", ['name' => $safeName]);
                $r2Path = $file->storeAs('student-uploads/quizzes/' . $user->id, $safeName, config('filesystems.default'));
                Log::info("R2 Upload Success", ['path' => $r2Path]);
            } else {
                $sourceContent = $validated['topic'];
                Log::info("Processing Topic", ['topic' => $sourceContent]);
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

            $baseCost = $validated['question_count'] * 1; 
            $chunks = (int) ceil($wordCount / 500); 
            $weightCost = $chunks * 5; // 5 credits per 500 words
            
            $totalCost = $baseCost + $weightCost;
            if ($totalCost < 10) $totalCost = 10;
            Log::info("Cost Calculated", ['cost' => $totalCost, 'words' => $wordCount, 'chunks' => $chunks]);

            // 3. Check & Lock Credits (Atomic)
            $canProceed = DB::transaction(function() use ($user, $totalCost) {
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

            $useDeepseek = Cache::get('use_deepseek_fallback', false);

            try {
                if ($useDeepseek) {
                    Log::info("Circuit Breaker Active: Auto-routing Quiz to DeepSeek.");
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
                    Log::info("Calling primary AI (Claude 3.5 Haiku) for quiz generation...");
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
                if (!$useDeepseek) {
                    Log::warning("Claude API Failed! Circuit Breaker tripped. Failing over to DeepSeek. Error: " . $e->getMessage());
                    Cache::put('use_deepseek_fallback', true, now()->addMinutes(30));
                    
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
                throw new \Exception('AI returned no questions. Please try a different topic or document.');
            }

            // 6. Deduct Usage (Atomic) - Only AFTER successful generation
            if (!$user->is_unlimited_student) {
                DB::transaction(function() use ($user, $totalCost, $validated) {
                    $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                    $lockedUser->decrement('credits', $totalCost);
                    
                    try {
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'amount' => -$totalCost,
                            'description' => "Practice Quiz: " . ($validated['question_count'] ?? 10) . " questions on " . ($validated['topic'] ?? 'File'),
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
            Log::error("API Quiz Gen Critical Error", [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => substr($e->getTraceAsString(), 0, 1000)
            ]);
            return response()->json(['message' => $e->getMessage()], 500);
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
            $useDeepseek = Cache::get('use_deepseek_fallback', false);
            try {
                if ($useDeepseek) {
                    $result = $this->deepseek->gradeTheoryAnswer($validated['question_text'], $validated['student_answer'], $validated['model_answer'] ?? '', [], 10.0);
                } else {
                    $result = $this->aiService->gradeTheoryAnswer($validated['question_text'], $validated['student_answer'], $validated['model_answer'] ?? '', [], 10.0);
                }
            } catch (\Exception $e) {
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
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}

