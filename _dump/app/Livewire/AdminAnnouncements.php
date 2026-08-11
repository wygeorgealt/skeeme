<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Traits\HasToastNotifications;
use App\Models\Announcement;
use App\Mail\AnnouncementMail;
use App\Notifications\AnnouncementNotification;
use App\Events\NotificationSent;
use App\Services\DeepseekAIService;
use App\Services\Integrations\GoogleProvider;
use App\Models\SocialAccount;

class AdminAnnouncements extends Component
{
    use HasToastNotifications;

    public $announcements = [];
    public $showCreateForm = false;
    public $editingAnnouncement = null;
    public $showViewModal = false;
    public $viewAnnouncement = null;

    // Form fields
    public $title = '';
    public $content = '';
    public $priority = 'normal';
    public $target_type = 'all_students'; // all_students, all_lecturers, specific_course, specific_class
    public $course_id = null;
    public $class_id = null;
    public $send_email = true;

    // AI & Calendar fields
    public $aiPrompt = '';
    public $isGeneratingAI = false;
    public $event_start_date = '';
    public $event_end_date = '';
    public $sync_to_calendar = false;
    public $hasLinkedGoogle = false;

    // Filter and Sort properties
    public $search = '';
    public $priorityFilter = 'all'; // all, low, normal, high, urgent
    public $targetFilter = 'all'; // all, all_students, all_lecturers, specific_course, specific_class
    public $sortBy = 'created_at';
    public $sortDirection = 'desc';

    protected $rules = [
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'priority' => 'required|in:low,normal,high,urgent',
        'target_type' => 'required|in:all_students,all_lecturers,specific_course,specific_class',
        'course_id' => 'nullable|exists:courses,id',
        'class_id' => 'nullable|exists:classes,id',
    ];

    public function mount()
    {
        $this->loadAnnouncements();
        $this->checkGoogleIntegration();
    }

    public function checkGoogleIntegration()
    {
        $this->hasLinkedGoogle = SocialAccount::where('user_id', Auth::id())
            ->where('provider', 'google')
            ->exists();
    }

    public function loadAnnouncements()
    {
        $school_id = Auth::user()->school_id;

        $query = Announcement::where('school_id', $school_id)
            ->with(['sender', 'course', 'school']);

        // Search filter
        if (!empty($this->search)) {
            $query->where(function ($q) {
                $q->where('title', 'like', '%' . $this->search . '%')
                  ->orWhere('content', 'like', '%' . $this->search . '%');
            });
        }

        // Priority filter
        if ($this->priorityFilter !== 'all') {
            $query->where('priority', $this->priorityFilter);
        }

        // Target audience filter
        if ($this->targetFilter !== 'all') {
            $query->where('target_type', $this->targetFilter);
        }

        // Sorting
        $query->orderBy($this->sortBy, $this->sortDirection);

        $this->announcements = $query->get()->toArray();
    }

    public function updated($propertyName)
    {
        if (in_array($propertyName, ['search', 'priorityFilter', 'targetFilter', 'sortBy'])) {
            $this->loadAnnouncements();
        }
    }

    public function sort($column)
    {
        if ($this->sortBy === $column) {
            $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortBy = $column;
            $this->sortDirection = 'asc';
        }
        $this->loadAnnouncements();
    }

    public function createAnnouncement()
    {
        $this->validate();

        $user = Auth::user();
        $school_id = $user->school_id;

        // Create the announcement
        $announcement = Announcement::create([
            'title' => $this->title,
            'content' => $this->content,
            'school_id' => $school_id,
            'course_id' => $this->target_type === 'specific_course' ? $this->course_id : null,
            'class_id' => $this->target_type === 'specific_class' ? $this->class_id : null,
            'posted_by' => $user->id,
            'priority' => $this->priority,
            'target_type' => $this->target_type,
            'published_at' => now(),
            'sender_id' => $user->id,
            'event_start_date' => $this->event_start_date ?: null,
            'event_end_date' => $this->event_end_date ?: null,
        ]);

        // Sync to Google Calendar if requested
        if ($this->sync_to_calendar && $this->hasLinkedGoogle && $announcement->event_start_date) {
            $this->syncToGoogleCalendar($announcement);
        }

        // Send real-time notifications to targeted users
        $notificationIds = $this->sendRealtimeNotifications($announcement);

        // Send emails if requested
        if ($this->send_email) {
            $this->sendAnnouncementEmails($announcement);
        }

        // Trigger toast notifications for all affected users
        $this->triggerToastNotifications($notificationIds);

        // Reset form
        $this->resetForm();

        $this->toastSuccess('Announcement created and sent successfully!', 'Announcement Sent');
        $this->dispatch('announcement-created');
        $this->loadAnnouncements();
    }

    private function sendRealtimeNotifications($announcement)
    {
        $school_id = Auth::user()->school_id;
        $notificationIds = [];

        // Get recipients based on target type
        $recipients = collect();
        switch ($announcement->target_type) {
            case 'all_students':
                $recipients = DB::table('users')
                    ->where('school_id', $school_id)
                    ->where('role', 'student')
                    ->where('status', 'active')
                    ->get();
                break;
            case 'all_lecturers':
                $recipients = DB::table('users')
                    ->where('school_id', $school_id)
                    ->where('role', 'lecturer')
                    ->where('status', 'active')
                    ->get();
                break;
            case 'specific_course':
                $recipients = DB::table('enrollments')
                    ->join('users', 'enrollments.student_id', '=', 'users.id')
                    ->where('enrollments.course_id', $announcement->course_id)
                    ->where('users.status', 'active')
                    ->select('users.*')
                    ->get();
                break;
            case 'specific_class':
                $recipients = DB::table('users')
                    ->where('school_id', $school_id)
                    ->where('class_id', $announcement->class_id)
                    ->where('role', 'student')
                    ->where('status', 'active')
                    ->get();
                break;
        }

        // Send real-time notifications
        foreach ($recipients as $user) {
            try {
                $userModel = \App\Models\User::find($user->id);
                if ($userModel) {
                    $userModel->notify(new AnnouncementNotification($announcement));
                }
            } catch (\Exception $e) {
                \Log::warning("Failed to send real-time notification to user {$user->id}: " . $e->getMessage());
            }
        }

        return $notificationIds;
    }

    private function triggerToastNotifications($notificationIds)
    {
        // Broadcast to all affected users to show toast notifications
        // Use Livewire's global dispatch to reach all instances of ToastNotification
        foreach ($notificationIds as $notificationId) {
            $this->dispatch('notificationReceived', $notificationId)->to(ToastNotification::class);
        }
    }

    private function sendAnnouncementEmails($announcement)
    {
        $school_id = Auth::user()->school_id;

        // Get recipients based on target type
        $recipients = [];
        switch ($announcement->target_type) {
            case 'all_students':
                $recipients = DB::table('users')
                    ->where('school_id', $school_id)
                    ->where('role', 'student')
                    ->where('status', 'active')
                    ->pluck('email')
                    ->toArray();
                break;
            case 'all_lecturers':
                $recipients = DB::table('users')
                    ->where('school_id', $school_id)
                    ->where('role', 'lecturer')
                    ->where('status', 'active')
                    ->pluck('email')
                    ->toArray();
                break;
            case 'specific_course':
                $recipients = DB::table('enrollments')
                    ->join('users', 'enrollments.student_id', '=', 'users.id')
                    ->where('enrollments.course_id', $announcement->course_id)
                    ->where('users.status', 'active')
                    ->pluck('users.email')
                    ->toArray();
                break;
            case 'specific_class':
                $recipients = DB::table('users')
                    ->where('school_id', $school_id)
                    ->where('class_id', $announcement->class_id)
                    ->where('role', 'student')
                    ->where('status', 'active')
                    ->pluck('email')
                    ->toArray();
                break;
        }

        // Send emails
        foreach ($recipients as $email) {
            try {
                \Illuminate\Support\Facades\Mail::mailer(config('mail.default'))->to($email)->send(new AnnouncementMail($announcement));
            } catch (\Exception $e) {
                \Log::warning("Failed to send announcement email to {$email}: " . $e->getMessage());
            }
        }
    }

    public function editAnnouncement($id)
    {
        $announcement = Announcement::find($id);
        if ($announcement && $announcement->school_id === Auth::user()->school_id) {
            $this->editingAnnouncement = $announcement->id;
            $this->title = $announcement->title;
            $this->content = $announcement->content;
            $this->priority = $announcement->priority;
            $this->target_type = $announcement->target_type;
            $this->course_id = $announcement->course_id;
            $this->class_id = $announcement->class_id;
            $this->event_start_date = $announcement->event_start_date ? $announcement->event_start_date->format('Y-m-d\TH:i') : '';
            $this->event_end_date = $announcement->event_end_date ? $announcement->event_end_date->format('Y-m-d\TH:i') : '';
            $this->sync_to_calendar = (bool)$announcement->google_event_id;
            $this->send_email = false; // Don't resend emails on edit
            $this->showCreateForm = true;
            $this->dispatch('show-create-modal');
        }
    }

    public function updateAnnouncement()
    {
        $this->validate();

        $announcement = Announcement::find($this->editingAnnouncement);
        if ($announcement && $announcement->school_id === Auth::user()->school_id) {
            $announcement->update([
                'title' => $this->title,
                'content' => $this->content,
                'priority' => $this->priority,
                'target_type' => $this->target_type,
                'course_id' => $this->target_type === 'specific_course' ? $this->course_id : null,
                'class_id' => $this->target_type === 'specific_class' ? $this->class_id : null,
                'event_start_date' => $this->event_start_date ?: null,
                'event_end_date' => $this->event_end_date ?: null,
            ]);

            // Sync to Google Calendar if requested
            if ($this->sync_to_calendar && $this->hasLinkedGoogle && $announcement->event_start_date) {
                $this->syncToGoogleCalendar($announcement);
            }

            $this->resetForm();
            $this->toastSuccess('Announcement updated successfully!', 'Announcement Updated');
            $this->dispatch('announcement-updated');
            $this->loadAnnouncements();
        }
    }

    public function deleteAnnouncement($id)
    {
        $announcement = Announcement::find($id);
        if ($announcement && $announcement->school_id === Auth::user()->school_id) {
            $announcement->delete();
            $this->toastSuccess('Announcement deleted successfully!', 'Announcement Deleted');
            $this->loadAnnouncements();
        }
    }

    public function duplicateAnnouncement($id)
    {
        $announcement = Announcement::find($id);
        if ($announcement && $announcement->school_id === Auth::user()->school_id) {
            Announcement::create([
                'title' => $announcement->title . ' (Copy)',
                'content' => $announcement->content,
                'school_id' => $announcement->school_id,
                'course_id' => $announcement->course_id,
                'posted_by' => Auth::id(),
                'priority' => $announcement->priority,
                'target_type' => $announcement->target_type,
                'published_at' => now(),
                'sender_id' => Auth::id(),
            ]);

            $this->toastSuccess('Announcement duplicated successfully!', 'Announcement Duplicated');
            $this->loadAnnouncements();
        }
    }

    public function openAnnouncement($id)
    {
        $announcement = Announcement::with(['sender', 'course', 'school'])->find($id);
        if ($announcement && $announcement->school_id === Auth::user()->school_id) {
            $this->viewAnnouncement = $announcement->toArray();
            $this->showViewModal = true;
            $this->dispatch('announcement-viewed');
        }
    }

    public function closeViewModal()
    {
        $this->showViewModal = false;
        $this->viewAnnouncement = null;
    }

    public function openCreateModal()
    {
        $this->resetForm();
        $this->showCreateForm = true;
        $this->dispatch('show-create-modal');
    }

    public function resetForm()
    {
        $this->showCreateForm = false;
        $this->editingAnnouncement = null;
        $this->showViewModal = false;
        $this->viewAnnouncement = null;
        $this->title = '';
        $this->content = '';
        $this->priority = 'normal';
        $this->target_type = 'all_students';
        $this->course_id = null;
        $this->class_id = null;
        $this->send_email = true;
        $this->aiPrompt = '';
        $this->isGeneratingAI = false;
        $this->event_start_date = '';
        $this->event_end_date = '';
        $this->sync_to_calendar = false;
    }

    public function generateAIDraft()
    {
        if (empty($this->aiPrompt)) {
            $this->toastError('Please enter a prompt for the AI.', 'Empty Prompt');
            return;
        }

        $this->isGeneratingAI = true;

        try {
            $aiService = new DeepseekAIService();
            $draft = $aiService->generateAnnouncementDraft($this->aiPrompt);

            $this->title = $draft['title'];
            $this->content = $draft['content'];
            
            if (!empty($draft['event_start_date'])) {
                $this->event_start_date = $draft['event_start_date'];
                
                // If AI missed end date, default to 1 hour later
                if (empty($draft['event_end_date'])) {
                    $this->event_end_date = \Carbon\Carbon::parse($this->event_start_date)->addHour()->format('Y-m-d\TH:i');
                } else {
                    $this->event_end_date = $draft['event_end_date'];
                }
            }

            $this->toastSuccess('AI draft and dates generated successfully!', 'AI Draft Ready');
        } catch (\Exception $e) {
            $this->toastError('Failed to generate AI draft. Please try again.', 'AI Error');
        } finally {
            $this->isGeneratingAI = false;
        }
    }

    private function syncToGoogleCalendar(Announcement $announcement)
    {
        $socialAccount = SocialAccount::where('user_id', Auth::id())
            ->where('provider', 'google')
            ->first();

        if (!$socialAccount) return;

        try {
            $googleProvider = new GoogleProvider($socialAccount);
            
            $eventData = [
                'topic' => $announcement->title,
                'description' => $announcement->content,
                'start_time' => $announcement->event_start_date->toIso8601String(),
                'end_time' => $announcement->event_end_date 
                    ? $announcement->event_end_date->toIso8601String()
                    : $announcement->event_start_date->addHour()->toIso8601String()
            ];

            // Use the more specific createCalendarEvent method
            $result = $googleProvider->createCalendarEvent($eventData);

            if (isset($result['id'])) {
                $announcement->update(['google_event_id' => $result['id']]);
            }
        } catch (\Exception $e) {
            \Log::error('Google Calendar Sync Error: ' . $e->getMessage());
        }
    }

    public function render()
    {
        $courses = DB::table('courses')
            ->where('school_id', Auth::user()->school_id)
            ->select('id', 'name')
            ->get();

        $classes = DB::table('classes')
            ->where('school_id', Auth::user()->school_id)
            ->select('id', 'name')
            ->get();

        return view('livewire.admin-announcements', [
            'courses' => $courses,
            'classes' => $classes,
        ]);
    }
}
