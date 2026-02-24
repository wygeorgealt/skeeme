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
        $validated = $request->validate([
            'topic' => 'required_without:file|nullable|string|max:100',
            'file' => 'required_without:topic|nullable|file|mimes:pdf,docx,txt,md|max:10240',
            'question_count' => 'required|integer|min:10|max:50',
            'question_types' => 'required|array|min:1',
            'question_types.*' => 'in:mcq,theory',
            'difficulty' => 'nullable|in:easy,medium,hard',
        ]);

        $user = Auth::user();

        try {
            $sourceContent = '';

            // 1. Extract content to determine the weight and cost
            if ($request->hasFile('file')) {
                $sourceContent = $this->extractionService->extractText($request->file('file')->getRealPath());
                if (!$sourceContent) {
                    throw new \Exception("Could not extract text from the uploaded file.");
                }
            } else {
                $sourceContent = $validated['topic'];
            }

            // 2. Calculate Dynamic Cost
            $wordCount = str_word_count($sourceContent);
            $baseCost = $validated['question_count'] * 1; // 1 credit per question
            $weightCost = (int) ceil($wordCount / 50); // 1 credit per 50 words analyzed
            $totalCost = $baseCost + $weightCost;
            
            // Apply a minimum floor just in case
            if ($totalCost < 10) $totalCost = 10;

            // 3. Check Access (Credits or Unlimited)
            if (!$user->is_unlimited_student && $user->credits < $totalCost) {
                return response()->json([
                    'message' => "Insufficient credits. This specific generation costs $totalCost credits based on its length and complexity.",
                    'credits' => $user->credits,
                    'required_credits' => $totalCost
                ], 403);
            }

            // 4. Map types for AI Service
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
                $validated['topic'] ?? 'Mobile Practice File'
            );

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
            }

            return response()->json([
                'questions' => $questions,
                'remaining_credits' => $user->fresh()->credits,
                'cost' => $totalCost
            ]);

        } catch (\Exception $e) {
            Log::error("API Quiz Gen Error: " . $e->getMessage());
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
                'score'    => $result['score'] ?? 0,
                'max'      => $result['max_marks'] ?? 10,
                'feedback' => $result['feedback'] ?? 'No feedback available.',
                'passed'   => ($result['score'] ?? 0) >= 5,
            ]);
        } catch (\Exception $e) {
            Log::error('Theory grading error: ' . $e->getMessage());
            return response()->json(['message' => 'Grading failed: ' . $e->getMessage()], 500);
        }
    }
}

