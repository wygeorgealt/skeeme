<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    protected $fillable = [
        'email',
        'code_hash',
        'type',
        'attempts',
        'last_sent_at',
        'expires_at',
    ];

    protected $casts = [
        'last_sent_at' => 'datetime',
        'expires_at' => 'datetime',
        'attempts' => 'integer',
    ];
}
