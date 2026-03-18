<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class StreakFreeze extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'freezes_allocated',
        'freezes_used',
        'last_freeze_used_at',
    ];

    protected $casts = [
        'month' => 'date',
        'last_freeze_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create the freeze record for the current month.
     */
    public static function currentMonth(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId, 'month' => Carbon::now()->startOfMonth()->toDateString()],
            ['freezes_allocated' => 2, 'freezes_used' => 0]
        );
    }

    /**
     * Check if freezes are still available this month.
     */
    public function hasFreezesRemaining(): bool
    {
        return $this->freezes_used < $this->freezes_allocated;
    }

    /**
     * Consume one freeze.
     */
    public function consumeFreeze(): bool
    {
        if (!$this->hasFreezesRemaining()) {
            return false;
        }

        $this->increment('freezes_used');
        $this->update(['last_freeze_used_at' => now()]);
        return true;
    }
}
