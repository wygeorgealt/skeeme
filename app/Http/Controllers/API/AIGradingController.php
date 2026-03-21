<?php

namespace App\Http\Controllers\API;

use App\Models\AIGrading;
use App\Models\ExamSession;
use App\Services\AIGradingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIGradingController
{
    protected $gradingService;

    public function __construct(AIGradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    /**
     * Grade all answers in an exam session
     */
    public function gradeSession(ExamSession $session): JsonResponse
    {
        // Verify ownership
        if ($session->exam->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($session->status !== 'submitted') {
            return response()->json([
                'message' => 'Session is not in submitted state',
            ], 422);
        }

        try {
            $results = $this->gradingService->gradeSession($session);

            // Deduct credits if not unlimited
            $user = auth()->user();
            if (!$user->is_unlimited_student) {
                $cost = $request->attributes->get('calculated_credit_cost', 0);
                if ($cost > 0) {
                    \Illuminate\Support\Facades\DB::transaction(function() use ($user, $cost, $session) {
                        $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
                        $lockedUser->decrement('credits', $cost);
                        
                        $lockedUser->transactions()->create([
                            'type' => 'usage',
                            'amount' => -$cost,
                            'description' => "AI Grading: Session #{$session->id} in course '{$session->exam->course->name}'",
                        ]);
                    });
                    
                    \Illuminate\Support\Facades\Cache::forget("user_credits_{$user->id}");
                }
            }

            return response()->json([
                'message' => 'Session graded successfully',
                'session' => $session->refresh(),
                'grading_results' => $results,
                'credits_deducted' => $user->is_unlimited_student ? 0 : ($cost ?? 0),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Grading failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get pending grades for lecturer review
     */
    public function pendingReview(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $gradings = $this->gradingService->getPendingReview(auth()->id(), $limit);

        return response()->json([
            'pending_count' => $gradings->count(),
            'gradings' => $gradings->load(['examAnswer', 'examSession.exam']),
        ]);
    }

    /**
     * Review and approve a grading
     */
    public function approve(AIGrading $grading): JsonResponse
    {
        $this->verifyOwnership($grading);

        $grading->approve(auth()->id());

        return response()->json([
            'message' => 'Grading approved',
            'grading' => $grading,
        ]);
    }

    /**
     * Override a grading with manual marks
     */
    public function override(Request $request, AIGrading $grading): JsonResponse
    {
        $this->verifyOwnership($grading);

        $validated = $request->validate([
            'marks' => 'required|numeric|min:0',
            'reason' => 'required|string|min:10',
        ]);

        $grading->override(
            (float) $validated['marks'],
            $validated['reason'],
            auth()->id()
        );

        return response()->json([
            'message' => 'Grading overridden',
            'grading' => $grading,
        ]);
    }

    /**
     * Reject a grading (mark for manual review)
     */
    public function reject(Request $request, AIGrading $grading): JsonResponse
    {
        $this->verifyOwnership($grading);

        $validated = $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        $grading->reject($validated['reason'], auth()->id());

        return response()->json([
            'message' => 'Grading rejected for manual review',
            'grading' => $grading,
        ]);
    }

    /**
     * Get grading details with full analysis
     */
    public function show(AIGrading $grading): JsonResponse
    {
        $this->verifyOwnership($grading);

        return response()->json([
            'grading' => $grading->load([
                'examAnswer',
                'examSession.exam',
                'reviewer',
            ]),
        ]);
    }

    /**
     * Get statistics for a session
     */
    public function sessionStatistics(ExamSession $session): JsonResponse
    {
        // Verify ownership
        if ($session->exam->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = $this->gradingService->getSessionStatistics($session);

        return response()->json([
            'session' => $session,
            'statistics' => $stats,
        ]);
    }

    /**
     * Batch approve all pending grades for a session
     */
    public function batchApprove(Request $request, ExamSession $session): JsonResponse
    {
        // Verify ownership
        if ($session->exam->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $gradings = AIGrading::where('exam_session_id', $session->id)
            ->where('status', 'pending_review')
            ->get();

        $updated = 0;
        foreach ($gradings as $grading) {
            $grading->approve(auth()->id());
            $updated++;
        }

        return response()->json([
            'message' => "$updated gradings approved",
            'updated_count' => $updated,
        ]);
    }

    /**
     * Get gradings requiring attention (low confidence)
     */
    public function requiresAttention(Request $request): JsonResponse
    {
        $threshold = $request->input('confidence_threshold', 75);

        $gradings = AIGrading::whereHas('examAnswer.examSession.exam', function ($q) {
            $q->where('lecturer_id', auth()->id());
        })
            ->where('confidence_score', '<', $threshold)
            ->where('status', 'pending_review')
            ->orderBy('confidence_score', 'asc')
            ->limit(50)
            ->get();

        return response()->json([
            'threshold' => $threshold,
            'gradings_requiring_attention' => $gradings->count(),
            'gradings' => $gradings->load(['examAnswer', 'examSession.exam']),
        ]);
    }

    /**
     * Get grading summary for exam
     */
    public function examSummary(Request $request)
    {
        $examId = $request->input('exam_id');

        if (!$examId) {
            return response()->json(['message' => 'exam_id required'], 422);
        }

        $gradings = AIGrading::whereHas('examAnswer.examSession', function ($q) use ($examId) {
            $q->where('exam_id', $examId);
        })->get();

        $summary = [
            'exam_id' => $examId,
            'total_gradings' => $gradings->count(),
            'by_method' => $gradings->groupBy('grading_method')->map->count(),
            'by_status' => $gradings->groupBy('status')->map->count(),
            'average_confidence' => round($gradings->avg('confidence_score'), 2),
            'average_marks' => round($gradings->avg('marks_awarded'), 2),
            'lowest_confidence_gradings' => $gradings
                ->sortBy('confidence_score')
                ->take(5)
                ->pluck('confidence_score', 'id'),
        ];

        return response()->json([
            'summary' => $summary,
        ]);
    }

    /**
     * Verify lecturer ownership of grading
     */
    private function verifyOwnership(AIGrading $grading): void
    {
        $lecturerId = $grading->examAnswer->examSession->exam->lecturer_id;

        if ($lecturerId !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
    }
}
