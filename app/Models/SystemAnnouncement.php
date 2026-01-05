<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemAnnouncement extends Model
{
    protected $table = 'system_announcements';

    protected $fillable = [
        'created_by',
        'title',
        'content',
        'target',
        'target_schools',
        'type',
        'is_pinned',
        'published_at',
        'expires_at',
        'view_count',
    ];

    protected $casts = [
        'target_schools' => 'array',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'created_by');
    }

    public function publish()
    {
        $this->update(['published_at' => now()]);
    }

    public function isActive()
    {
        return $this->published_at && (!$this->expires_at || $this->expires_at->isFuture());
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public static function getActive()
    {
        return self::where('published_at', '<=', now())
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->get();
    }

    public static function getPinned()
    {
        return self::where('is_pinned', true)
            ->where('published_at', '<=', now())
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderBy('published_at', 'desc')
            ->get();
    }
}
