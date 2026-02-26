<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashcardDeck extends Model
{
    protected $guarded = [];

    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }
}
