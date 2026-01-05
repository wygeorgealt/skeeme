<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Models\SystemAnnouncement;
use App\Models\EmailCampaign;
use App\Models\ToastNotification;
use App\Models\AdminAuditLog;
use App\Traits\HasToastNotifications;
use Illuminate\Http\Request;

class CommunicationController extends Controller
{
    use HasToastNotifications;

    /* ========== System Announcements ========== */

    public function index()
    {
        $announcements = SystemAnnouncement::latest('published_at')->paginate(20);
        return view('team.communications.index', compact('announcements'));
    }

    public function announcements(Request $request)
    {
        $query = SystemAnnouncement::query();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('target')) {
            $query->where('target', $request->target);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $announcements = $query->latest('published_at')->paginate(20);
        $pinnedCount = SystemAnnouncement::where('is_pinned', true)->count();

        return view('team.communications.announcements', compact('announcements', 'pinnedCount'));
    }

    public function createAnnouncement()
    {
        return view('team.communications.create-announcement');
    }

    public function storeAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'target' => 'required|in:all,schools,teachers,students,custom',
            'target_schools' => 'nullable|array',
            'type' => 'required|in:info,warning,success,critical',
            'is_pinned' => 'boolean',
            'publish_immediately' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $announcement = SystemAnnouncement::create([
            'created_by' => $request->user()->teamMember->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'target' => $validated['target'],
            'target_schools' => $validated['target_schools'] ?? null,
            'type' => $validated['type'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'published_at' => $validated['publish_immediately'] ? now() : null,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'announcement.created',
            'SystemAnnouncement',
            $announcement->id,
            ['title' => $validated['title']]
        );

        return redirect()->route('team.communications.announcements')->with('success', 'Announcement created');
    }

    public function editAnnouncement(SystemAnnouncement $announcement)
    {
        return view('team.communications.edit-announcement', compact('announcement'));
    }

    public function updateAnnouncement(Request $request, SystemAnnouncement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'target' => 'required|in:all,schools,teachers,students,custom',
            'target_schools' => 'nullable|array',
            'type' => 'required|in:info,warning,success,critical',
            'is_pinned' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $changes = [];
        foreach ($validated as $key => $value) {
            if ($announcement->{$key} != $value) {
                $changes[$key] = ['old' => $announcement->{$key}, 'new' => $value];
            }
        }

        $announcement->update($validated);

        if ($changes) {
            AdminAuditLog::log(
                $request->user()->teamMember,
                'announcement.updated',
                'SystemAnnouncement',
                $announcement->id,
                $changes
            );
        }

        return redirect()->route('team.communications.announcements')->with('success', 'Announcement updated');
    }

    public function publishAnnouncement(Request $request, SystemAnnouncement $announcement)
    {
        $announcement->publish();

        AdminAuditLog::log(
            $request->user()->teamMember,
            'announcement.published',
            'SystemAnnouncement',
            $announcement->id,
            []
        );

        return redirect()->route('team.communications.announcements')->with('success', 'Announcement published');
    }

    public function deleteAnnouncement(Request $request, SystemAnnouncement $announcement)
    {
        AdminAuditLog::log(
            $request->user()->teamMember,
            'announcement.deleted',
            'SystemAnnouncement',
            $announcement->id,
            ['title' => $announcement->title]
        );

        $announcement->delete();

        return redirect()->route('team.communications.announcements')->with('success', 'Announcement deleted');
    }

    /* ========== Email Campaigns ========== */

    public function emailIndex(Request $request)
    {
        $query = EmailCampaign::with('creator');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $campaigns = $query->latest('created_at')->paginate(20);
        $draftCount = EmailCampaign::where('status', 'draft')->count();

        return view('team.communications.emails.index', compact('campaigns', 'draftCount'));
    }

    public function createEmail()
    {
        return view('team.communications.emails.create');
    }

    public function storeEmail(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string|min:20',
            'recipient_type' => 'required|in:all_admins,specific_schools,specific_admin,all_users',
            'recipient_schools' => 'nullable|array',
            'recipient_users' => 'nullable|array',
            'schedule_send' => 'boolean',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $campaign = EmailCampaign::create([
            'created_by' => $request->user()->teamMember->id,
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'recipient_type' => $validated['recipient_type'],
            'recipient_schools' => $validated['recipient_schools'] ?? null,
            'recipient_users' => $validated['recipient_users'] ?? null,
            'status' => $validated['schedule_send'] ? 'scheduled' : 'draft',
            'scheduled_at' => $validated['scheduled_at'] ?? null,
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'email_campaign.created',
            'EmailCampaign',
            $campaign->id,
            ['subject' => $validated['subject'], 'recipient_type' => $validated['recipient_type']]
        );

        if ($validated['schedule_send']) {
            return redirect()->route('team.communications.emails.index')
                ->with('success', 'Email campaign scheduled for ' . $validated['scheduled_at']);
        }

        return redirect()->route('team.communications.emails.index')
            ->with('success', 'Email campaign saved as draft');
    }

    public function showEmail(EmailCampaign $campaign)
    {
        return view('team.communications.emails.show', compact('campaign'));
    }

    public function sendEmail(Request $request, EmailCampaign $campaign)
    {
        if (!$campaign->isDraft() && !$campaign->isScheduled()) {
            return redirect()->route('team.communications.emails.index')
                ->with('error', 'This campaign has already been sent');
        }

        $campaign->send();

        AdminAuditLog::log(
            $request->user()->teamMember,
            'email_campaign.sent',
            'EmailCampaign',
            $campaign->id,
            ['sent_count' => $campaign->sent_count]
        );

        return redirect()->route('team.communications.emails.index')
            ->with('success', "Email campaign sent to {$campaign->sent_count} recipients");
    }

    /* ========== Toast Notifications (Admin Alerts) ========== */

    public function toastIndex(Request $request)
    {
        $query = ToastNotification::with('creator');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('recipient_type')) {
            $query->where('recipient_type', $request->recipient_type);
        }

        $toasts = $query->latest('published_at')->paginate(20);

        return view('team.communications.toasts.index', compact('toasts'));
    }

    public function createToast()
    {
        return view('team.communications.toasts.create');
    }

    public function storeToast(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|min:10',
            'type' => 'required|in:info,success,warning,error',
            'recipient_type' => 'required|in:all_admins,specific_schools,specific_admin',
            'recipient_schools' => 'nullable|array',
            'recipient_users' => 'nullable|array',
            'duration_seconds' => 'required|integer|min:1|max:60',
            'is_dismissible' => 'boolean',
            'publish_immediately' => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $toast = ToastNotification::create([
            'created_by' => $request->user()->teamMember->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'recipient_type' => $validated['recipient_type'],
            'recipient_schools' => $validated['recipient_schools'] ?? null,
            'recipient_users' => $validated['recipient_users'] ?? null,
            'duration_seconds' => $validated['duration_seconds'],
            'is_dismissible' => $validated['is_dismissible'] ?? true,
            'published_at' => $validated['publish_immediately'] ? now() : null,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        AdminAuditLog::log(
            $request->user()->teamMember,
            'toast.created',
            'ToastNotification',
            $toast->id,
            ['title' => $validated['title'], 'type' => $validated['type']]
        );

        if ($validated['publish_immediately']) {
            // Broadcast toast to recipients
            $this->broadcastToast($toast);
        }

        return redirect()->route('team.communications.toasts.index')
            ->with('success', 'Toast notification ' . ($validated['publish_immediately'] ? 'sent' : 'scheduled'));
    }

    public function publishToast(Request $request, ToastNotification $toast)
    {
        $toast->publish();

        AdminAuditLog::log(
            $request->user()->teamMember,
            'toast.published',
            'ToastNotification',
            $toast->id,
            []
        );

        // Broadcast to recipients
        $this->broadcastToast($toast);

        return redirect()->route('team.communications.toasts.index')
            ->with('success', 'Toast notification published and sent');
    }

    private function broadcastToast(ToastNotification $toast)
    {
        // Get recipients
        $recipients = match($toast->recipient_type) {
            'all_admins' => \App\Models\User::where('role', 'admin')->pluck('id')->toArray(),
            'specific_schools' => \App\Models\User::whereIn('school_id', $toast->recipient_schools ?? [])
                ->where('role', 'admin')->pluck('id')->toArray(),
            'specific_admin' => $toast->recipient_users ?? [],
            default => [],
        };

        // Broadcast to Livewire ToastNotification component
        \Livewire\Livewire::dispatch('notificationBroadcast', [
            'message' => $toast->message,
            'userIds' => $recipients,
            'type' => $toast->type,
            'title' => $toast->title,
            'duration' => $toast->duration_seconds * 1000,
        ])->to(\App\Livewire\ToastNotification::class);
    }

    public function deleteToast(Request $request, ToastNotification $toast)
    {
        AdminAuditLog::log(
            $request->user()->teamMember,
            'toast.deleted',
            'ToastNotification',
            $toast->id,
            ['title' => $toast->title]
        );

        $toast->delete();

        return redirect()->route('team.communications.toasts.index')
            ->with('success', 'Toast notification deleted');
    }
}
