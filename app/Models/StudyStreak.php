<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyStreak extends Model
{
    protected $fillable = [
        'user_id',
        'current_streak',
        'longest_streak',
        'last_activity_date',
    ];
}
