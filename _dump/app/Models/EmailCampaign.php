<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    protected $fillable = [
        'created_by',
        'subject',
        'body',
        'recipient_type',
        'recipient_schools',
        'recipient_users',
        'status',
        'scheduled_at',
        'sent_at',
        'recipients_count',
        'sent_count',
        'failed_count',
        'failure_reason',
    ];

    protected $casts = [
        'recipient_schools' => 'array',
        'recipient_users' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class, 'created_by');
    }

    public function send()
    {
        $this->update(['status' => 'sending']);
        
        // Get recipients based on type
        $recipients = $this->getRecipients();
        $this->update(['recipients_count' => $recipients->count()]);

        // Send emails
        foreach ($recipients as $recipient) {
                try {
                \Mail::mailer(config('mail.default'))->to($recipient->email)
                    ->queue(new \App\Mail\CampaignEmail($this));
                $this->increment('sent_count');
            } catch (\Exception $e) {
                $this->increment('failed_count');
                \Log::error('Email campaign failed: ' . $e->getMessage());
            }
        }

        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function getRecipients()
    {
        return match($this->recipient_type) {
            'all_admins' => User::where('role', 'admin')->get(),
            'specific_schools' => User::whereIn('school_id', $this->recipient_schools ?? [])->where('role', 'admin')->get(),
            'specific_admin' => User::whereIn('id', $this->recipient_users ?? [])->get(),
            'all_users' => User::all(),
            default => collect(),
        };
    }

    public function isDraft()
    {
        return $this->status === 'draft';
    }

    public function isScheduled()
    {
        return $this->status === 'scheduled';
    }

    public static function sendScheduled()
    {
        $campaigns = self::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($campaigns as $campaign) {
            $campaign->send();
        }
    }
}
