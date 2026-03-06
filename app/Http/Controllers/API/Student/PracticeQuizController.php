<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
    protected $extractionService;

    public function __construct(DeepseekAIService $aiService, FileExtractionService $extractionService)
    {
        $this->aiService = $aiService;
        $this->extractionService = $extractionService;
    }

    /**
     * Generate a practice quiz from topic or file
     */
    public function generate(Request $request)
    {
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
            if ($wordCount > 8000) {
                Log::warning("Word limit exceeded", ['user_id' => $user->id, 'word_count' => $wordCount]);
                return response()->json([
                    'message' => "This document is too large for AI processing. Please limit it to 8,000 words (approx. 16 pages).",
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

            // 4. AI Generation
            // 4. Prepare for AI Generation (Dispatch Job)
            Log::info("Preparing to dispatch AI quiz generation job...");
            $types = [];
            foreach ($validated['question_types'] as $type) {
                if ($type === 'mcq') $types[] = 'multiple_choice';
                if ($type === 'theory') $types[] = 'essay';
            }
            $difficulty = $validated['difficulty'] ?? 'medium';

            // 6. Deduct Usage (Atomic)
            if (!$user->is_unlimited_student) {
                DB::transaction(function() use ($user, $totalCost) {
                    \App\Models\User::where('id', $user->id)->lockForUpdate()->decrement('credits', $totalCost);
                });
                Log::info("Credits Deducted", ['new_total' => $user->fresh()->credits]);
            }

            // 7. Dispatch Background Job
            $jobId = (string) Str::uuid();
            Cache::put("ai_job_status:{$jobId}", "pending", 1800);

            ProcessAIQuiz::dispatch(
                $sourceContent, // Changed from $notes to $sourceContent
                $validated['question_count'] ?? 10,
                $validated['difficulty'] ?? 'medium',
                $types, // Changed from $validated['question_types'] ?? ['multiple_choice'] to $types
                $validated['topic'] ?? 'General Knowledge',
                $user->id,
                $jobId,
                $user->is_unlimited_student ? 0 : $totalCost
            );

            return response()->json([
                'message' => 'AI quiz generation started. You can check the status using the job_id.',
                'job_id' => $jobId,
                'status' => 'pending',
                'credits_deducted' => $user->is_unlimited_student ? 0 : $totalCost,
                'remaining_credits' => $user->fresh()->credits
            ]);

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
            return response()->json(['message' => 'Failed to generate quiz: ' . $e->getMessage()], 500);
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
            $result = $this->aiService->gradeTheoryAnswer(
                $validated['question_text'],
                $validated['student_answer'],
                $validated['model_answer'] ?? '',
                [],
                10.0
            );

            return response()->json([
                'score'    => $result['marks'] ?? 0,
                'max'      => 10.0,
                'feedback' => $result['ai_feedback'] ?? 'No feedback available.',
                'passed'   => ($result['marks'] ?? 0) >= 5,
            ]);
        } catch (\Exception $e) {
            Log::error('Theory grading error: ' . $e->getMessage());
            return response()->json(['message' => 'Grading failed: ' . $e->getMessage()], 500);
        }
    }
}

