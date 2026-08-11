<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $fillable = [
        'referrer_user_id',
        'referred_user_id',
        'referral_code',
        'status',
        'referred_at',
        'credited_at',
        'indirect_referrer_user_id',
        'direct_reward_amount',
        'indirect_reward_amount',
        'direct_reward_claimed_at',
        'indirect_reward_claimed_at',
    ];

    protected $casts = [
        'referred_at' => 'datetime',
        'credited_at' => 'datetime',
    ];

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_user_id');
    }

    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }
}
