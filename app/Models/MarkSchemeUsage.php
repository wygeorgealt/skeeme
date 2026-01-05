<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarkSchemeUsage extends Model
{
    protected $table = 'mark_scheme_usages';

    protected $fillable = [
        'mark_scheme_id',
        'exam_id',
        'questions_using',
        'last_used_at',
    ];

    protected $casts = [
        'questions_using' => 'integer',
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the mark scheme
     */
    public function markScheme(): BelongsTo
    {
        return $this->belongsTo(MarkScheme::class);
    }

    /**
     * Get the exam
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }
}
