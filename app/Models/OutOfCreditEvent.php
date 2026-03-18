<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutOfCreditEvent extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'feature_attempted',
        'days_since_last_purchase',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
