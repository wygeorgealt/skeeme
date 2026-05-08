<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAiProfile extends Model
{
    protected $fillable = [
        'user_id',
        'academic_level',
        'learning_style',
        'strengths',
        'weaknesses',
        'interests',
        'tone_preferences',
        'custom_context',
    ];

    protected $casts = [
        'tone_preferences' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
