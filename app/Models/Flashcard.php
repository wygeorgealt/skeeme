<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flashcard extends Model
{
    protected $fillable = ['flashcard_deck_id', 'front', 'back', 'order_column'];
}
