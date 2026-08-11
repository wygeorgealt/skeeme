<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AppealDecision extends Model
{
    use HasFactory;

    protected $fillable = [
        'grade_appeal_id',
        'lecturer_id',
        'decision',
        'reasoning',
        'original_score',
        'revised_score',
        'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the grade appeal this decision belongs to
     */
    public function appeal(): BelongsTo
    {
        return $this->belongsTo(GradeAppeal::class);
    }

    /**
     * Get the lecturer who made the decision
     */
    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    /**
     * Check if decision was to approve the appeal
     */
    public function isApproved(): bool
    {
        return $this->decision === 'approved';
    }

    /**
     * Check if decision was to reject the appeal
     */
    public function isRejected(): bool
    {
        return $this->decision === 'rejected';
    }

    /**
     * Get score adjustment
     */
    public function getScoreAdjustmentAttribute(): float
    {
        if ($this->original_score === null || $this->revised_score === null) {
            return 0;
        }
        return $this->revised_score - $this->original_score;
    }

    /**
     * Get percentage adjustment
     */
    public function getPercentageAdjustmentAttribute(): float
    {
        if ($this->original_score === null || $this->original_score === 0) {
            return 0;
        }
        return round(($this->getScoreAdjustmentAttribute() / $this->original_score) * 100, 2);
    }
}
