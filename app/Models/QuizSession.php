<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizSession extends Model
{
    protected $guarded = [];

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class);
    }
}
