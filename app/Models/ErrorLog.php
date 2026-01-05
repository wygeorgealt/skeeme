<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErrorLog extends Model
{
    protected $fillable = [
        'user_id',
        'school_id',
        'error_code',
        'error_message',
        'stack_trace',
        'file_path',
        'line_number',
        'context',
        'severity',
        'is_resolved',
        'resolution_notes',
    ];

    protected $casts = [
        'context' => 'array',
        'is_resolved' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    const SEVERITY_ERROR = 'error';
    const SEVERITY_WARNING = 'warning';
    const SEVERITY_CRITICAL = 'critical';
}
