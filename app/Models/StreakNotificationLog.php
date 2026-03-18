<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreakNotificationLog extends Model
{
    protected $table = 'streak_notification_log';

    protected $fillable = [
        'user_id',
        'milestone_target',
        'notification_type',
        'sent_at',
        'delivered',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if a notification of this type was already sent for this milestone.
     */
    public static function alreadySent(int $userId, int $milestone, string $type): bool
    {
        return self::where('user_id', $userId)
            ->where('milestone_target', $milestone)
            ->where('notification_type', $type)
            ->exists();
    }
}
