<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlagiarismPenalty extends Model
{
    protected $table = 'plagiarism_penalties';

    protected $fillable = [
        'plagiarism_check_id',
        'exam_session_id',
        'penalty_type',
        'marks_deducted',
        'reason',
        'notes',
        'applied_by',
        'applied_at',
        'appealed_at',
        'appeal_reason',
        'appeal_resolved_at',
        'appeal_status',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'appealed_at' => 'datetime',
        'appeal_resolved_at' => 'datetime',
    ];

    /**
     * Get the plagiarism check
     */
    public function plagiarismCheck(): BelongsTo
    {
        return $this->belongsTo(PlagiarismCheck::class);
    }

    /**
     * Get the exam session
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    /**
     * Get the user who applied penalty
     */
    public function appliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applied_by');
    }

    /**
     * Check if penalty is under appeal
     */
    public function isUnderAppeal(): bool
    {
        return $this->appeal_status === 'pending' && $this->appealed_at !== null;
    }

    /**
     * Get appeal status label
     */
    public function getAppealStatusLabel(): string
    {
        return match ($this->appeal_status) {
            'approved' => 'Appeal Approved',
            'rejected' => 'Appeal Rejected',
            'pending' => 'Appeal Pending',
            default => 'No Appeal',
        };
    }

    /**
     * Get penalty label
     */
    public function getPenaltyLabel(): string
    {
        return match ($this->penalty_type) {
            'warning' => '⚠️ Warning',
            'mark_deduction' => '📉 Mark Deduction',
            'fail' => '❌ Failed',
            'investigation' => '🔍 Under Investigation',
            default => 'Unknown',
        };
    }
}
