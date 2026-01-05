<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
        'related_model_type',
        'related_model_id',
    ];

    protected $casts = [
        'data' => 'json',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Notification types
     */
    const TYPE_EXAM_REMINDER = 'exam_reminder';
    const TYPE_EXAM_STARTED = 'exam_started';
    const TYPE_EXAM_SUBMITTED = 'exam_submitted';
    const TYPE_GRADING_COMPLETE = 'grading_complete';
    const TYPE_GRADE_RELEASED = 'grade_released';
    const TYPE_APPEAL_SUBMITTED = 'appeal_submitted';
    const TYPE_APPEAL_DECIDED = 'appeal_decided';
    const TYPE_FEEDBACK_AVAILABLE = 'feedback_available';
    const TYPE_SYSTEM_MESSAGE = 'system_message';

    /**
     * Get the user this notification belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(): void
    {
        if ($this->is_read) {
            $this->update([
                'is_read' => false,
                'read_at' => null,
            ]);
        }
    }

    /**
     * Get icon for notification type
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            self::TYPE_EXAM_REMINDER => 'bell',
            self::TYPE_EXAM_STARTED => 'play-circle',
            self::TYPE_EXAM_SUBMITTED => 'check-circle',
            self::TYPE_GRADING_COMPLETE => 'checkmark-done',
            self::TYPE_GRADE_RELEASED => 'star',
            self::TYPE_APPEAL_SUBMITTED => 'alert-circle',
            self::TYPE_APPEAL_DECIDED => 'checkmark-circle',
            self::TYPE_FEEDBACK_AVAILABLE => 'chatbubbles',
            self::TYPE_SYSTEM_MESSAGE => 'information-circle',
            default => 'notifications',
        };
    }

    /**
     * Get color for notification type
     */
    public function getColorAttribute(): string
    {
        return match($this->type) {
            self::TYPE_EXAM_REMINDER => 'blue',
            self::TYPE_EXAM_STARTED => 'orange',
            self::TYPE_EXAM_SUBMITTED => 'emerald',
            self::TYPE_GRADING_COMPLETE => 'indigo',
            self::TYPE_GRADE_RELEASED => 'purple',
            self::TYPE_APPEAL_SUBMITTED => 'amber',
            self::TYPE_APPEAL_DECIDED => 'emerald',
            self::TYPE_FEEDBACK_AVAILABLE => 'cyan',
            self::TYPE_SYSTEM_MESSAGE => 'slate',
            default => 'slate',
        };
    }
}
