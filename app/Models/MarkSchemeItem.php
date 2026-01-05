<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarkSchemeItem extends Model
{
    protected $table = 'mark_scheme_items';

    protected $fillable = [
        'mark_scheme_id',
        'level',
        'level_name',
        'criteria',
        'examples',
        'marks_awarded',
        'sort_order',
    ];

    protected $casts = [
        'level' => 'integer',
        'marks_awarded' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get the mark scheme
     */
    public function markScheme(): BelongsTo
    {
        return $this->belongsTo(MarkScheme::class);
    }

    /**
     * Get description for display
     */
    public function getDisplayLabel(): string
    {
        return "{$this->level_name} ({$this->marks_awarded}/{$this->markScheme->total_marks} marks)";
    }

    /**
     * Get percentage score
     */
    public function getPercentage(): float
    {
        if ($this->markScheme->total_marks === 0) {
            return 0;
        }
        return round(($this->marks_awarded / $this->markScheme->total_marks) * 100, 2);
    }
}
