<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MarkScheme extends Model
{
    use SoftDeletes;

    protected $table = 'mark_schemes';

    protected $fillable = [
        'created_by',
        'name',
        'description',
        'instructions',
        'total_marks',
        'is_public',
    ];

    protected $casts = [
        'total_marks' => 'integer',
        'is_public' => 'boolean',
    ];

    /**
     * Get the user who created this scheme
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all items in this scheme
     */
    public function items(): HasMany
    {
        return $this->hasMany(MarkSchemeItem::class)
            ->orderBy('sort_order');
    }

    /**
     * Get questions using this scheme
     */
    public function questions(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            Question::class,
            'question_mark_schemes',
            'mark_scheme_id',
            'question_id'
        );
    }

    /**
     * Get usage statistics
     */
    public function usages(): HasMany
    {
        return $this->hasMany(MarkSchemeUsage::class);
    }

    /**
     * Add item to scheme
     */
    public function addItem(int $level, string $levelName, string $criteria, int $marksAwarded, ?string $examples = null): MarkSchemeItem
    {
        return $this->items()->create([
            'level' => $level,
            'level_name' => $levelName,
            'criteria' => $criteria,
            'marks_awarded' => $marksAwarded,
            'examples' => $examples,
            'sort_order' => $level,
        ]);
    }

    /**
     * Get item for marks
     */
    public function getItemByMarks(int $marks): ?MarkSchemeItem
    {
        return $this->items()
            ->where('marks_awarded', $marks)
            ->first();
    }

    /**
     * Get mark levels (for dropdown)
     */
    public function getMarkLevels(): array
    {
        return $this->items()
            ->pluck('marks_awarded', 'level_name')
            ->toArray();
    }

    /**
     * Clone this scheme
     */
    public function clone(User $clonedBy, string $newName): MarkScheme
    {
        $cloned = $this->replicate();
        $cloned->created_by = $clonedBy->id;
        $cloned->name = $newName;
        $cloned->is_public = false;
        $cloned->save();

        // Clone items
        foreach ($this->items as $item) {
            $cloned->items()->create($item->only([
                'level',
                'level_name',
                'criteria',
                'marks_awarded',
                'examples',
                'sort_order',
            ]));
        }

        return $cloned;
    }

    /**
     * Check if scheme is in use
     */
    public function isInUse(): bool
    {
        return $this->questions()->exists();
    }
}
