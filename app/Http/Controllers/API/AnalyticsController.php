<?php

namespace App\Http\Controllers\API;

use App\Models\Exam;
use App\Models\AnalyticsSnapshot;
use App\Models\QuestionAnalytics;
use App\Models\StudentLearningProgress;
use App\Models\GradingTrend;
use App\Models\ClassComparisonData;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Generate analytics snapshot for exam
     */
    public function generateSnapshot(Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        try {
            $snapshot = $this->analyticsService->generateSnapshot($exam);

            return response()->json([
                'message' => 'Snapshot generated successfully',
                'snapshot' => $snapshot,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get exam analytics summary
     */
    public function examSummary(Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $latestSnapshot = AnalyticsSnapshot::where('exam_id', $exam->id)
            ->latest('snapshot_date')
            ->first();

        if (!$latestSnapshot) {
            $latestSnapshot = $this->analyticsService->generateSnapshot($exam);
        }

        return response()->json([
            'exam' => $exam->load('course', 'lecturer'),
            'latest_snapshot' => $latestSnapshot,
            'performance_metrics' => $latestSnapshot->performance_trend,
            'engagement_metrics' => $latestSnapshot->engagement_metrics,
            'grading_metrics' => $latestSnapshot->grading_metrics,
        ]);
    }

    /**
     * Get performance trends over time
     */
    public function performanceTrends(Request $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $startDate = $exam->input('start_date') ? now()->parse($exam->input('start_date')) : now()->subMonths(1);
        $endDate = $exam->input('end_date') ? now()->parse($exam->input('end_date')) : now();

        $snapshots = AnalyticsSnapshot::where('exam_id', $exam->id)
            ->whereBetween('snapshot_date', [$startDate, $endDate])
            ->orderBy('snapshot_date')
            ->get();

        $trends = [
            'dates' => $snapshots->pluck('snapshot_date')->map(fn($d) => $d->format('Y-m-d')),
            'average_scores' => $snapshots->pluck('average_score'),
            'pass_rates' => $snapshots->pluck('pass_rate'),
            'confidence_scores' => $snapshots->pluck('average_confidence'),
        ];

        return response()->json([
            'trends' => $trends,
            'snapshots_count' => $snapshots->count(),
        ]);
    }

    /**
     * Get question analytics
     */
    public function questionAnalytics(Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $questionAnalytics = QuestionAnalytics::where('exam_id', $exam->id)->get();

        if ($questionAnalytics->isEmpty()) {
            // Generate if not exists
            foreach ($exam->questions ?? [] as $question) {
                $this->analyticsService->analyzeQuestion($question, $exam);
            }
            $questionAnalytics = QuestionAnalytics::where('exam_id', $exam->id)->get();
        }

        return response()->json([
            'total_questions' => $questionAnalytics->count(),
            'well_performing' => $questionAnalytics->filter(fn($q) => $q->is_well_performing)->count(),
            'poorly_performing' => $questionAnalytics->filter(fn($q) => $q->is_poorly_performing)->count(),
            'questions' => $questionAnalytics->map(fn($q) => [
                'id' => $q->question_id,
                'correct_rate' => $q->correct_rate,
                'difficulty' => $q->difficulty_level,
                'discrimination' => $q->discrimination_index,
                'performance' => $q->performance_rating,
                'attempts' => $q->total_attempts,
            ]),
        ]);
    }

    /**
     * Get student learning progress
     */
    public function studentProgress(Request $request, Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $courseId = $request->input('course_id');
        if (!$courseId) {
            return response()->json(['message' => 'course_id required'], 422);
        }

        $students = StudentLearningProgress::where('course_id', $courseId)
            ->orderBy('mastery_level', 'desc')
            ->get();

        return response()->json([
            'total_students' => $students->count(),
            'average_mastery' => round($students->avg('mastery_level'), 2),
            'students_at_risk' => $students->where('needs_intervention', true)->count(),
            'high_performers' => $students->where('is_high_performer', true)->count(),
            'students' => $students->map(fn($s) => [
                'id' => $s->student_id,
                'mastery_level' => $s->mastery_level,
                'status' => $s->progress_status,
                'rating' => $s->mastery_level_rating,
                'exams_completed' => $s->exams_completed,
            ]),
        ]);
    }

    /**
     * Get grading trends
     */
    public function gradingTrends(Request $request, Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $startDate = $request->input('start_date') ? now()->parse($request->input('start_date')) : now()->subDays(7);
        $endDate = $request->input('end_date') ? now()->parse($request->input('end_date')) : now();

        $trends = GradingTrend::where('exam_id', $exam->id)
            ->whereBetween('trend_date', [$startDate, $endDate])
            ->orderBy('trend_date')
            ->get();

        return response()->json([
            'total_graded' => $trends->sum('total_graded_count'),
            'mcq_average' => round($trends->avg('mcq_average_score'), 2),
            'essay_average' => round($trends->avg('essays_average_score'), 2),
            'average_confidence' => round($trends->avg('essays_average_confidence'), 2),
            'override_rate' => round($trends->avg('override_rate'), 2),
            'consistency' => round($trends->avg('consistency_score'), 2),
            'trends' => $trends->map(fn($t) => [
                'date' => $t->trend_date->format('Y-m-d'),
                'total_graded' => $t->total_graded_count,
                'mcq_avg' => $t->mcq_average_score,
                'essay_avg' => $t->essays_average_score,
                'confidence' => $t->essays_average_confidence,
                'overrides' => $t->overrides_count,
            ]),
        ]);
    }

    /**
     * Get class comparison data
     */
    public function classComparison(Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $comparison = ClassComparisonData::where('exam_id', $exam->id)
            ->latest('comparison_date')
            ->first();

        if (!$comparison) {
            $comparison = $this->analyticsService->compareToClass($exam);
        }

        return response()->json([
            'class_average' => $comparison->class_average,
            'median_score' => $comparison->median_score,
            'pass_rate' => $comparison->pass_rate,
            'high_achiever_rate' => $comparison->high_achiever_rate,
            'benchmark_average' => $comparison->benchmark_average,
            'performance_gap' => $comparison->performance_gap,
            'status' => $comparison->performance_status,
            'grade_distribution' => $comparison->grade_distribution,
        ]);
    }

    /**
     * Get recommendations based on analytics
     */
    public function recommendations(Exam $exam): JsonResponse
    {
        $this->verifyOwnership($exam);

        $snapshot = AnalyticsSnapshot::where('exam_id', $exam->id)
            ->latest('snapshot_date')
            ->first();

        if (!$snapshot) {
            return response()->json(['recommendations' => []]);
        }

        $recommendations = [];

        // Low pass rate
        if ($snapshot->pass_rate < 60) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Pass rate is below 60%. Consider reviewing question difficulty.',
                'metric' => 'pass_rate',
                'value' => $snapshot->pass_rate,
            ];
        }

        // High variance
        if ($snapshot->std_deviation > 25) {
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Large score variance indicates mixed understanding. Target support to struggling students.',
                'metric' => 'std_deviation',
                'value' => $snapshot->std_deviation,
            ];
        }

        // Low confidence essays
        if ($snapshot->average_confidence < 70 && $snapshot->questions_ai_graded > 0) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'AI confidence in essay grading is low. Prioritize manual review.',
                'metric' => 'average_confidence',
                'value' => $snapshot->average_confidence,
            ];
        }

        // Question performance issues
        if ($snapshot->common_mistakes) {
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Identify and address common mistakes in affected questions.',
                'metric' => 'common_mistakes',
                'value' => count($snapshot->common_mistakes),
            ];
        }

        // High override rate
        $gradings = ClassComparisonData::where('exam_id', $exam->id)->latest()->first();
        if ($gradings && $gradings->override_rate > 20) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'High override rate may indicate AI grading calibration issues.',
                'metric' => 'override_rate',
                'value' => $gradings->override_rate,
            ];
        }

        return response()->json([
            'recommendations' => $recommendations,
            'total_recommendations' => count($recommendations),
        ]);
    }

    /**
     * Export analytics report
     */
    public function exportReport(Exam $exam): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->verifyOwnership($exam);

        $snapshot = AnalyticsSnapshot::where('exam_id', $exam->id)
            ->latest('snapshot_date')
            ->first();

        if (!$snapshot) {
            $snapshot = $this->analyticsService->generateSnapshot($exam);
        }

        return response()->streamDownload(function () use ($snapshot, $exam) {
            echo $this->generateCsvReport($snapshot, $exam);
        }, 'analytics-report-' . $exam->id . '.csv');
    }

    /**
     * Helper methods
     */

    private function verifyOwnership(Exam $exam): void
    {
        if ($exam->lecturer_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }
    }

    private function generateCsvReport(AnalyticsSnapshot $snapshot, Exam $exam): string
    {
        $csv = "Skeeme Analytics Report\n";
        $csv .= "Exam: " . $exam->name . "\n";
        $csv .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";

        $csv .= "STUDENT PERFORMANCE\n";
        $csv .= "Total Students,Submitted,Average Score,Median Score,Std Deviation,Pass Rate\n";
        $csv .= "{$snapshot->total_students},{$snapshot->students_submitted}," .
                "{$snapshot->average_score},{$snapshot->median_score}," .
                "{$snapshot->std_deviation},{$snapshot->pass_rate}%\n\n";

        $csv .= "QUESTION ANALYTICS\n";
        $csv .= "Total Questions,Average Difficulty\n";
        $csv .= "{$snapshot->total_questions},{$snapshot->average_difficulty}\n\n";

        $csv .= "GRADING METRICS\n";
        $csv .= "Auto-Graded,AI-Graded,Average Confidence,Pending Review,Approved,Overridden\n";
        $csv .= "{$snapshot->questions_auto_graded},{$snapshot->questions_ai_graded}," .
                "{$snapshot->average_confidence},{$snapshot->grades_pending_review}," .
                "{$snapshot->grades_approved},{$snapshot->grades_overridden}\n\n";

        $csv .= "ENGAGEMENT METRICS\n";
        $csv .= "Average Time (sec),Early Submissions,Last-Minute Submissions\n";
        $csv .= "{$snapshot->average_time_spent},{$snapshot->early_submissions}," .
                "{$snapshot->last_minute_submissions}\n";

        return $csv;
    }
}
