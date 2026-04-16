<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',        // usage, reward, purchase, refund
        'action_type', // quiz_generation, flashcard_generation, scan_solve, ai_grading, referral_bonus, signup_bonus
        'amount',      // integer (positive for credits added, negative for credits used)
        'description',
        'model_used',  // claude-sonnet-4-5, deepseek-chat, etc.
        'request_id',  // idempotency / correlation key
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'amount' => 'integer',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
