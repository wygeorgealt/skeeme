<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'school_id',
        'course_id',
        'posted_by',
        'priority',
        'target_type',
        'published_at',
        'sender_id',
        'event_start_date',
        'event_end_date',
        'google_event_id',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'event_start_date' => 'datetime',
        'event_end_date' => 'datetime',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function poster()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
