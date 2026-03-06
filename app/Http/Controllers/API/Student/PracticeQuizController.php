<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DeepseekAIService;
use App\Services\FileExtractionService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
            $baseCost = $validated['question_count'] * 1; 
            $weightCost = (int) ceil($wordCount / 50); 
            $totalCost = $baseCost + $weightCost;
            if ($totalCost < 10) $totalCost = 10;
            Log::info("Cost Calculated", ['cost' => $totalCost, 'words' => $wordCount]);

            // 3. Check Access
            if (!$user->is_unlimited_student && $user->credits < $totalCost) {
                Log::warning("Insufficient Credits", ['user_id' => $user->id, 'credits' => $user->credits, 'needed' => $totalCost]);
                return response()->json([
                    'message' => "Insufficient credits. This generation costs $totalCost credits.",
                    'credits' => $user->credits,
                    'required_credits' => $totalCost
                ], 403);
            }

            // 4. AI Generation
            Log::info("Calling Deepseek AI...");
            $types = [];
            foreach ($validated['question_types'] as $type) {
                if ($type === 'mcq') $types[] = 'multiple_choice';
                if ($type === 'theory') $types[] = 'essay';
            }
            $difficulty = $validated['difficulty'] ?? 'medium';

            $questions = $this->aiService->generateQuestions(
                [$sourceContent],
                $validated['question_count'],
                $difficulty,
                $types ?: ['multiple_choice'],
                $validated['topic'] ?? 'Mobile Practice File',
                false,
                null,
                $user->ai_preferences
            );
            
            if (empty($questions) || count($questions) === 0) {
                throw new \Exception('AI could not extract enough information to build a quiz. Please provide a more detailed topic or file.');
            }

            Log::info("AI Generation Success", ['count' => count($questions)]);

            // 5. Cleanup Multiple Choice formatting
            foreach ($questions as &$q) {
                if ($q['question_type'] === 'multiple_choice' && !empty($q['options'])) {
                    $originalCorrectKey = $q['correct_answer'];
                    $keyMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'E' => 4];
                    $correctIndex = $keyMap[strtoupper($originalCorrectKey)] ?? 0;
                    $correctText = $q['options'][$correctIndex] ?? $q['options'][0] ?? '';
                    
                    shuffle($q['options']);
                    $q['correct_answer'] = $correctText;
                }
            }

            // 6. Deduct Usage
            if (!$user->is_unlimited_student) {
                $user->decrement('credits', $totalCost);
                Log::info("Credits Deducted", ['new_total' => $user->fresh()->credits]);
            }

            return response()->json([
                'questions' => $questions,
                'remaining_credits' => $user->fresh()->credits,
                'cost' => $totalCost
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

