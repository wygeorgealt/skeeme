<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashcardSession extends Model
{
    protected $fillable = [
        'user_id',
        'flashcard_deck_id',
        'cards_count',
        'completed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deck()
    {
        return $this->belongsTo(FlashcardDeck::class, 'flashcard_deck_id');
    }
}
