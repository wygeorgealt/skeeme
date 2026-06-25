<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashcardDeck extends Model
{
    protected $fillable = ['title', 'description', 'source_type'];

    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }
}
