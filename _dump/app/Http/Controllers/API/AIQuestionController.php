<?php

namespace App\Http\Controllers\API;

use App\Models\Note;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Services\AIQuestionGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIQuestionController
{
    /**
     * Generate questions from notes
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pool_id' => 'required|exists:question_pools,id',
            'note_ids' => 'required|array|min:1',
            'note_ids.*' => 'exists:notes,id',
            'count' => 'integer|min:1|max:50|default:5',
            'bloom_levels' => 'array|default:["understand","apply","analyze"]',
            'bloom_levels.*' => 'in:remember,understand,apply,analyze,evaluate,create',
            'question_types' => 'array|default:["multiple_choice","essay"]',
            'question_types.*' => 'in:multiple_choice,essay,true_false',
        ]);

        $pool = QuestionPool::findOrFail($validated['pool_id']);

        // Verify user owns the pool
        if ($pool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notes = Note::whereIn('id', $validated['note_ids'])
            ->where('lecturer_id', auth()->id())
            ->get();

        if ($notes->isEmpty()) {
            return response()->json(['message' => 'No valid notes found'], 422);
        }

        $service = new AIQuestionGeneratorService();

        $config = [
            'count' => $validated['count'] ?? 5,
            'bloom_levels' => $validated['bloom_levels'] ?? ['understand', 'apply', 'analyze'],
            'types' => $validated['question_types'] ?? ['multiple_choice', 'essay'],
            'with_review' => true,
        ];

        $questions = $service->generate($notes, $pool, $config);

        // Deduct credits if not unlimited
        $user = auth()->user();
        if (!$user->is_unlimited_student) {
            $cost = $request->attributes->get('calculated_credit_cost', 0);
            if ($cost > 0) {
                \Illuminate\Support\Facades\DB::transaction(function() use ($user, $cost, $questions) {
                    $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                    $lockedUser->decrement('credits', $cost);
                    
                    $lockedUser->transactions()->create([
                        'type' => 'usage',
                        'amount' => -$cost,
                        'description' => "AI Question Generation: " . count($questions) . " questions in pool '{$pool->name}'",
                    ]);
                });
                
                \Illuminate\Support\Facades\Cache::forget("user_credits_{$user->id}");
            }
        }

        // Update pool count
        $pool->updateQuestionCount();

        return response()->json([
            'message' => count($questions) . ' questions generated',
            'questions' => $questions,
            'pool' => $pool,
            'credits_deducted' => $user->is_unlimited_student ? 0 : ($cost ?? 0),
        ], 201);
    }

    /**
     * Review a generated question
     */
    public function review(Request $request, Question $question): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,regenerate',
            'notes' => 'nullable|string',
            'edits' => 'nullable|array',
        ]);

        // Verify ownership
        if ($question->questionPool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($validated['action'] === 'approve') {
            $question->update([
                'status' => 'published',
                'metadata' => array_merge(
                    $question->metadata ?? [],
                    ['lecturer_notes' => $validated['notes'] ?? null]
                ),
            ]);

            return response()->json([
                'message' => 'Question approved and published',
                'question' => $question,
            ]);
        }

        if ($validated['action'] === 'reject') {
            $question->delete();
            return response()->json(['message' => 'Question rejected and removed']);
        }

        if ($validated['action'] === 'regenerate') {
            $service = new AIQuestionGeneratorService();
            $pool = $question->questionPool;

            $config = [
                'bloom_levels' => [$question->bloom_level],
                'types' => [$question->question_type],
            ];

            $newQuestion = $service->regenerate($question, $config);

            if (!$newQuestion) {
                return response()->json(['message' => 'Regeneration failed'], 500);
            }

            return response()->json([
                'message' => 'Question regenerated',
                'question' => $newQuestion,
            ]);
        }

        return response()->json(['message' => 'Invalid action']);
    }

    /**
     * Get all draft questions for a pool
     */
    public function drafts(QuestionPool $pool): JsonResponse
    {
        // Verify ownership
        if ($pool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $questions = $pool->questions()
            ->where('status', 'draft')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'pool' => $pool,
            'draft_count' => $questions->count(),
            'questions' => $questions,
        ]);
    }

    /**
     * Publish all draft questions in a pool
     */
    public function publishAll(QuestionPool $pool): JsonResponse
    {
        // Verify ownership
        if ($pool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $count = $pool->questions()
            ->where('status', 'draft')
            ->update(['status' => 'published']);

        $pool->updateQuestionCount();

        return response()->json([
            'message' => $count . ' questions published',
            'pool' => $pool,
        ]);
    }

    /**
     * Discard all draft questions in a pool
     */
    public function discardDrafts(QuestionPool $pool): JsonResponse
    {
        // Verify ownership
        if ($pool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $count = $pool->questions()
            ->where('status', 'draft')
            ->delete();

        $pool->updateQuestionCount();

        return response()->json([
            'message' => $count . ' questions discarded',
            'pool' => $pool,
        ]);
    }

    /**
     * Get question statistics for a pool
     */
    public function statistics(QuestionPool $pool): JsonResponse
    {
        // Verify ownership
        if ($pool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $questions = $pool->questions;

        $stats = [
            'total' => $questions->count(),
            'published' => $questions->where('status', 'published')->count(),
            'draft' => $questions->where('status', 'draft')->count(),
            'archived' => $questions->where('status', 'archived')->count(),
            'by_type' => $questions->groupBy('question_type')->map->count(),
            'by_bloom_level' => $questions->groupBy('bloom_level')->map->count(),
            'average_marks' => $questions->avg('marks'),
        ];

        return response()->json([
            'pool' => $pool,
            'statistics' => $stats,
        ]);
    }
}
