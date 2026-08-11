<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToastNotification extends Model
{
    protected $fillable = [
        'created_by',
        'title',
        'message',
        'type',
        'recipient_type',
        'recipient_schools',
        'recipient_users',
        'duration_seconds',
        'is_dismissible',
        'published_at',
        'expires_at',
        'view_count',
    ];

    protected $casts = [
        'recipient_schools' => 'array',
        'recipient_users' => 'array',
        'is_dismissible' => 'boolean',
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

    public static function getActiveForSchool($schoolId)
    {
        return self::where(function ($query) {
            $query->where('recipient_type', 'all_admins')
                  ->orWhere('recipient_type', 'specific_schools');
        })
        ->where('published_at', '<=', now())
        ->where(function ($query) {
            $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })
        ->orderBy('published_at', 'desc')
        ->get();
    }

    public static function getActiveForAdmin($userId)
    {
        return self::where(function ($query) use ($userId) {
            $query->where('recipient_type', 'all_admins')
                  ->orWhere(function ($q) use ($userId) {
                      $q->where('recipient_type', 'specific_admin')
                        ->whereJsonContains('recipient_users', $userId);
                  });
        })
        ->where('published_at', '<=', now())
        ->where(function ($query) {
            $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })
        ->orderBy('published_at', 'desc')
        ->get();
    }
}
