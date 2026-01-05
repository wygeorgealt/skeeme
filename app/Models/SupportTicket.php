<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id',
        'assigned_to',
        'title',
        'description',
        'priority',
        'status',
        'category',
        'resolution_notes',
        'resolved_at',
        'response_time_hours',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'assigned_to');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(TicketResponse::class, 'ticket_id');
    }

    public function resolve($notes)
    {
        $this->update([
            'status' => 'resolved',
            'resolution_notes' => $notes,
            'resolved_at' => now(),
            'response_time_hours' => $this->created_at->diffInHours(now()),
        ]);
    }

    public function assignTo($teamMemberId)
    {
        $this->update(['assigned_to' => $teamMemberId]);
    }

    public function isOpen()
    {
        return $this->status === 'open';
    }

    public function isCritical()
    {
        return $this->priority === 'critical';
    }
}
