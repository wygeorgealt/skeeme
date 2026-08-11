<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamSessionRecovery extends Model
{
    use HasFactory;

    protected $table = 'exam_session_recoveries';

    protected $fillable = [
        'exam_session_id',
        'student_id',
        'last_question_index',
        'auto_saved_data',
        'connection_lost_at',
        'recovered_at',
        'is_recovered',
    ];

    protected $casts = [
        'auto_saved_data' => 'json',
        'connection_lost_at' => 'datetime',
        'recovered_at' => 'datetime',
        'is_recovered' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the exam session
     */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Check if recovery is pending
     */
    public function isPending(): bool
    {
        return !$this->is_recovered && $this->connection_lost_at !== null;
    }

    /**
     * Mark as recovered
     */
    public function markAsRecovered(): void
    {
        $this->update([
            'is_recovered' => true,
            'recovered_at' => now(),
        ]);
    }

    /**
     * Get time lost in minutes
     */
    public function getTimeLostMinutesAttribute(): float
    {
        if ($this->connection_lost_at === null) {
            return 0;
        }

        $until = $this->recovered_at ?? now();
        return round($this->connection_lost_at->diffInSeconds($until) / 60, 2);
    }
}
