<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromptLibrary extends Model
{
    protected $table = 'prompt_library';

    protected $fillable = [
        'created_by',
        'title',
        'prompt_text',
        'category',
        'description',
        'variables',
        'avg_cost_per_use',
        'usage_count',
        'avg_quality_score',
        'is_public',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'created_by');
    }

    public function recordUsage($cost, $qualityScore = null)
    {
        $this->usage_count++;
        $this->avg_cost_per_use = (($this->avg_cost_per_use * ($this->usage_count - 1)) + $cost) / $this->usage_count;
        
        if ($qualityScore !== null) {
            $this->avg_quality_score = (($this->avg_quality_score * ($this->usage_count - 1)) + $qualityScore) / $this->usage_count;
        }

        $this->save();
    }

    public static function getByCategory($category, $publicOnly = false)
    {
        $query = self::where('category', $category)->where('is_active', true);
        
        if ($publicOnly) {
            $query->where('is_public', true);
        }

        return $query->orderBy('avg_quality_score', 'desc')->get();
    }

    public static function getMostUsed($limit = 10)
    {
        return self::where('is_active', true)
            ->orderBy('usage_count', 'desc')
            ->limit($limit)
            ->get();
    }

    public static function getCheapest($limit = 10)
    {
        return self::where('is_active', true)
            ->orderBy('avg_cost_per_use', 'asc')
            ->limit($limit)
            ->get();
    }
}
