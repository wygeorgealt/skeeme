<?php

namespace App\Services;

use App\Models\GradingMetrics;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GradingMetricsService
{
    /**
     * Start grading session
     */
    public function startGrading(ExamSession $examSession, User $lecturer): GradingMetrics
    {
        return GradingMetrics::updateOrCreate(
            [
                'exam_session_id' => $examSession->id,
                'lecturer_id' => $lecturer->id,
            ],
            [
                'grading_started_at' => now(),
                'total_time_seconds' => 0,
                'question_index' => 0,
            ]
        );
    }

    /**
     * Complete grading session
     */
    public function completeGrading(ExamSession $examSession, User $lecturer): GradingMetrics
    {
        $metrics = GradingMetrics::where('exam_session_id', $examSession->id)
            ->where('lecturer_id', $lecturer->id)
            ->firstOrFail();

        $startTime = $metrics->grading_started_at;
        $totalSeconds = $startTime->diffInSeconds(now());

        $metrics->update([
            'grading_completed_at' => now(),
            'total_time_seconds' => $totalSeconds,
        ]);

        return $metrics;
    }

    /**
     * Update metrics for current question
     */
    public function updateQuestionMetrics(
        ExamSession $examSession,
        User $lecturer,
        int $questionIndex,
        int $timeSpentSeconds,
        bool $addedComment = false,
        bool $revised = false
    ): GradingMetrics {
        $metrics = GradingMetrics::where('exam_session_id', $examSession->id)
            ->where('lecturer_id', $lecturer->id)
            ->firstOrFail();

        $metrics->question_index = $questionIndex;
        $metrics->time_per_question_seconds = $timeSpentSeconds;

        if ($addedComment) {
            $metrics->comments_added = ($metrics->comments_added ?? 0) + 1;
        }

        if ($revised) {
            $metrics->revision_count = ($metrics->revision_count ?? 0) + 1;
        }

        $metrics->save();

        return $metrics;
    }

    /**
     * Get grading metrics for a lecturer
     */
    public function getLecturerMetrics(User $lecturer): Collection
    {
        return GradingMetrics::where('lecturer_id', $lecturer->id)
            ->with('examSession.exam')
            ->orderBy('grading_completed_at', 'desc')
            ->get();
    }

    /**
     * Get grading statistics for a lecturer
     */
    public function getLecturerStatistics(User $lecturer): array
    {
        $metrics = $this->getLecturerMetrics($lecturer);
        $completedMetrics = $metrics->filter(fn($m) => $m->isComplete());

        $totalTimeSeconds = $completedMetrics->sum('total_time_seconds');
        $totalQuestions = $completedMetrics->sum('question_index');

        return [
            'total_exams_graded' => $completedMetrics->count(),
            'total_time_hours' => round($totalTimeSeconds / 3600, 2),
            'average_time_per_exam_minutes' => $completedMetrics->isEmpty() ? 0 : round($totalTimeSeconds / 60 / $completedMetrics->count(), 2),
            'average_time_per_question_seconds' => $totalQuestions === 0 ? 0 : round($totalTimeSeconds / $totalQuestions, 2),
            'total_comments_added' => $completedMetrics->sum('comments_added'),
            'average_revisions_per_exam' => $completedMetrics->isEmpty() ? 0 : round($completedMetrics->sum('revision_count') / $completedMetrics->count(), 2),
            'average_consistency_score' => round($completedMetrics->avg('consistency_score'), 2),
        ];
    }

    /**
     * Get comparative analytics with other lecturers
     */
    public function getComparativeAnalytics(User $lecturer): array
    {
        $lecturerStats = $this->getLecturerStatistics($lecturer);

        $allLecturersMetrics = GradingMetrics::where('lecturer_id', '!=', $lecturer->id)
            ->whereNotNull('grading_completed_at')
            ->get();

        $totalTimeSeconds = $allLecturersMetrics->sum('total_time_seconds');
        $totalQuestions = $allLecturersMetrics->sum('question_index');

        $averageSystemStats = [
            'average_time_per_exam_minutes' => $allLecturersMetrics->isEmpty() ? 0 : round($totalTimeSeconds / 60 / $allLecturersMetrics->count(), 2),
            'average_time_per_question_seconds' => $totalQuestions === 0 ? 0 : round($totalTimeSeconds / $totalQuestions, 2),
            'average_comments_per_exam' => $allLecturersMetrics->isEmpty() ? 0 : round($allLecturersMetrics->sum('comments_added') / $allLecturersMetrics->count(), 2),
            'average_revisions_per_exam' => $allLecturersMetrics->isEmpty() ? 0 : round($allLecturersMetrics->sum('revision_count') / $allLecturersMetrics->count(), 2),
        ];

        return [
            'your_metrics' => $lecturerStats,
            'system_average' => $averageSystemStats,
            'comparison' => [
                'faster_than_average' => $lecturerStats['average_time_per_exam_minutes'] < $averageSystemStats['average_time_per_exam_minutes'],
                'time_difference_minutes' => round($lecturerStats['average_time_per_exam_minutes'] - $averageSystemStats['average_time_per_exam_minutes'], 2),
                'more_detailed_feedback' => $lecturerStats['total_comments_added'] > round($averageSystemStats['average_comments_per_exam'] * $lecturerStats['total_exams_graded']),
            ],
        ];
    }
}
