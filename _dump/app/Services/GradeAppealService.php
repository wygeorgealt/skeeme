<?php

namespace App\Services;

use App\Models\GradeAppeal;
use App\Models\AppealDecision;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GradeAppealService
{
    /**
     * Submit a grade appeal
     */
    public function submitAppeal(ExamSession $examSession, User $student, string $reason): GradeAppeal
    {
        $appeal = GradeAppeal::create([
            'exam_session_id' => $examSession->id,
            'student_id' => $student->id,
            'lecturer_id' => $examSession->exam->lecturer_id,
            'reason' => $reason,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        // Send notification to lecturer
        $this->notifyLecturerOfAppeal($appeal);

        return $appeal;
    }

    /**
     * Get pending appeals for a lecturer
     */
    public function getPendingAppealsForLecturer(User $lecturer): Collection
    {
        return GradeAppeal::where('lecturer_id', $lecturer->id)
            ->where('status', 'pending')
            ->with(['student', 'examSession.exam'])
            ->orderBy('submitted_at', 'asc')
            ->get();
    }

    /**
     * Get all appeals for a student
     */
    public function getAppealsForStudent(User $student): Collection
    {
        return GradeAppeal::where('student_id', $student->id)
            ->with(['examSession.exam', 'decision'])
            ->orderBy('submitted_at', 'desc')
            ->get();
    }

    /**
     * Approve an appeal
     */
    public function approveAppeal(GradeAppeal $appeal, User $lecturer, string $reasoning, ?float $revisedScore = null): AppealDecision
    {
        $decision = AppealDecision::create([
            'grade_appeal_id' => $appeal->id,
            'lecturer_id' => $lecturer->id,
            'decision' => 'approved',
            'reasoning' => $reasoning,
            'original_score' => $appeal->examSession->score,
            'revised_score' => $revisedScore,
            'decided_at' => now(),
        ]);

        // Update appeal status
        $appeal->update([
            'status' => 'approved',
            'resolved_at' => now(),
        ]);

        // Update exam session score if revised score provided
        if ($revisedScore !== null) {
            $appeal->examSession->update(['score' => $revisedScore]);
        }

        // Notify student
        $this->notifyStudentOfDecision($appeal, true);

        return $decision;
    }

    /**
     * Reject an appeal
     */
    public function rejectAppeal(GradeAppeal $appeal, User $lecturer, string $reasoning): AppealDecision
    {
        $decision = AppealDecision::create([
            'grade_appeal_id' => $appeal->id,
            'lecturer_id' => $lecturer->id,
            'decision' => 'rejected',
            'reasoning' => $reasoning,
            'original_score' => $appeal->examSession->score,
            'revised_score' => $appeal->examSession->score,
            'decided_at' => now(),
        ]);

        // Update appeal status
        $appeal->update([
            'status' => 'rejected',
            'resolved_at' => now(),
        ]);

        // Notify student
        $this->notifyStudentOfDecision($appeal, false);

        return $decision;
    }

    /**
     * Get statistics for appeals
     */
    public function getAppealStatistics(User $lecturer): array
    {
        $appeals = GradeAppeal::where('lecturer_id', $lecturer->id)
            ->with('decision')
            ->get();

        return [
            'total_appeals' => $appeals->count(),
            'pending_appeals' => $appeals->where('status', 'pending')->count(),
            'approved_appeals' => $appeals->where('status', 'approved')->count(),
            'rejected_appeals' => $appeals->where('status', 'rejected')->count(),
            'average_resolution_time' => $this->getAverageResolutionTime($appeals),
            'approval_rate' => $this->getApprovalRate($appeals),
        ];
    }

    /**
     * Get average resolution time in hours
     */
    private function getAverageResolutionTime(Collection $appeals): float
    {
        $resolvedAppeals = $appeals->filter(fn($appeal) => $appeal->resolved_at !== null);

        if ($resolvedAppeals->isEmpty()) {
            return 0;
        }

        $totalTime = $resolvedAppeals->sum(function($appeal) {
            return $appeal->submitted_at->diffInHours($appeal->resolved_at);
        });

        return round($totalTime / $resolvedAppeals->count(), 2);
    }

    /**
     * Get approval rate as percentage
     */
    private function getApprovalRate(Collection $appeals): float
    {
        $resolvedAppeals = $appeals->filter(fn($appeal) => $appeal->resolved_at !== null);

        if ($resolvedAppeals->isEmpty()) {
            return 0;
        }

        $approvedCount = $resolvedAppeals->where('status', 'approved')->count();
        return round(($approvedCount / $resolvedAppeals->count()) * 100, 2);
    }

    /**
     * Notify lecturer of new appeal
     */
    private function notifyLecturerOfAppeal(GradeAppeal $appeal): void
    {
        // Will be called when notifications system is implemented
    }

    /**
     * Notify student of appeal decision
     */
    private function notifyStudentOfDecision(GradeAppeal $appeal, bool $approved): void
    {
        // Will be called when notifications system is implemented
    }
}
