<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use App\Models\Announcement;

class LecturerMessages extends Component
{
    public $courses = [];
    public $selectedCourse = null;
    public $students = [];
    public $messages = [];
    public $sentMessages = [];
    public $activeTab = 'received';
    public $showComposeForm = false;
    public $showAnnouncementForm = false;
    public $newMessage = [
        'receiver_ids' => [],
        'course_id' => '',
        'subject' => '',
        'content' => '',
    ];
    public $newAnnouncement = [
        'title' => '',
        'content' => '',
        'priority' => 'medium',
        'target_type' => 'students',
    ];

    public function mount()
    {
        $this->loadCourses();
        $this->loadMessages();
    }

    public function loadCourses()
    {
        $user = Auth::user();

        $this->courses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function selectCourse($courseId)
    {
        $this->selectedCourse = $courseId;
        $this->loadStudents();
        $this->loadMessages();
    }

    public function loadStudents()
    {
        if (!$this->selectedCourse) return;

        $this->students = DB::table('users')
            ->join('enrollments', 'users.id', '=', 'enrollments.student_id')
            ->where('enrollments.course_id', $this->selectedCourse)
            ->select('users.id', 'users.first_name', 'users.last_name')
            ->orderBy('users.first_name')
            ->get();
    }

    public function loadMessages()
    {
        $user = Auth::user();

        // Received messages
        $receivedQuery = Message::where('receiver_id', $user->id);
        if ($this->selectedCourse) {
            $receivedQuery->where('course_id', $this->selectedCourse);
        }
        $this->messages = $receivedQuery->with(['sender', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Sent messages
        $sentQuery = Message::where('sender_id', $user->id);
        if ($this->selectedCourse) {
            $sentQuery->where('course_id', $this->selectedCourse);
        }
        $this->sentMessages = $sentQuery->with(['receiver', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function sendMessage()
    {
        $this->validate([
            'newMessage.receiver_ids' => 'required|array|min:1',
            'newMessage.subject' => 'required|string|max:255',
            'newMessage.content' => 'required|string',
        ]);

        foreach ($this->newMessage['receiver_ids'] as $receiverId) {
            Message::create([
                'sender_id' => Auth::id(),
                'receiver_id' => $receiverId,
                'course_id' => $this->selectedCourse,
                'subject' => $this->newMessage['subject'],
                'content' => $this->newMessage['content'],
            ]);
        }

        $this->resetMessageForm();
        $this->loadMessages();

        $this->toastSuccess('Messages sent successfully!', 'Success');
    }

    public function createAnnouncement()
    {
        $this->validate([
            'newAnnouncement.title' => 'required|string|max:255',
            'newAnnouncement.content' => 'required|string',
            'newAnnouncement.priority' => 'required|in:low,medium,high',
        ]);

        $course = DB::table('courses')->where('id', $this->selectedCourse)->first();
        $schoolId = $course ? $course->school_id : null;

        Announcement::create([
            'title' => $this->newAnnouncement['title'],
            'content' => $this->newAnnouncement['content'],
            'school_id' => $schoolId,
            'course_id' => $this->selectedCourse,
            'posted_by' => Auth::id(),
            'sender_id' => Auth::id(),
            'priority' => $this->newAnnouncement['priority'],
            'target_type' => $this->newAnnouncement['target_type'],
            'published_at' => now(),
        ]);

        $this->resetAnnouncementForm();
        $this->toastSuccess('Announcement created successfully!', 'Success');
    }

    public function markAsRead($messageId)
    {
        $message = Message::find($messageId);
        if ($message && $message->receiver_id === Auth::id()) {
            $message->update(['read_at' => now()]);
            $this->loadMessages();
        }
    }

    private function resetMessageForm()
    {
        $this->newMessage = [
            'receiver_ids' => [],
            'course_id' => '',
            'subject' => '',
            'content' => '',
        ];
        $this->showComposeForm = false;
    }

    private function resetAnnouncementForm()
    {
        $this->newAnnouncement = [
            'title' => '',
            'content' => '',
            'priority' => 'medium',
            'target_type' => 'students',
        ];
        $this->showAnnouncementForm = false;
    }

    public function render()
    {
        return view('livewire.lecturer-messages');
    }
}
