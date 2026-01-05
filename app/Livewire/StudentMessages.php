<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;

class StudentMessages extends Component
{
    public $messages = [];
    public $sentMessages = [];
    public $activeTab = 'received';
    public $newMessage = [
        'receiver_id' => '',
        'course_id' => '',
        'subject' => '',
        'content' => '',
    ];
    public $availableRecipients = [];
    public $availableCourses = [];
    public $showComposeForm = false;

    public function mount()
    {
        $this->loadMessages();
        $this->loadAvailableRecipients();
        $this->loadAvailableCourses();
    }

    public function loadMessages()
    {
        $user = Auth::user();

        // Received messages
        $this->messages = Message::where('receiver_id', $user->id)
            ->with(['sender', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Sent messages
        $this->sentMessages = Message::where('sender_id', $user->id)
            ->with(['receiver', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function loadAvailableRecipients()
    {
        $user = Auth::user();

        // Get lecturers from enrolled courses and classmates
        $this->availableRecipients = DB::table('users')
            ->join('course_lecturers', 'users.id', '=', 'course_lecturers.user_id')
            ->join('courses', 'course_lecturers.course_id', '=', 'courses.id')
            ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->where('enrollments.student_id', $user->id)
            ->where('users.role', 'lecturer')
            ->select('users.id', 'users.first_name', 'users.last_name', 'courses.name as course_name')
            ->groupBy('users.id', 'users.first_name', 'users.last_name', 'courses.name')
            ->get()
            ->merge(
                // Classmates
                DB::table('users')
                    ->join('enrollments', 'users.id', '=', 'enrollments.student_id')
                    ->join('courses', 'enrollments.course_id', '=', 'courses.id')
                    ->join('enrollments as my_enrollments', 'courses.id', '=', 'my_enrollments.course_id')
                    ->where('my_enrollments.student_id', $user->id)
                    ->where('users.id', '!=', $user->id)
                    ->where('users.role', 'student')
                    ->select('users.id', 'users.first_name', 'users.last_name', 'courses.name as course_name')
                    ->groupBy('users.id', 'users.first_name', 'users.last_name', 'courses.name')
                    ->get()
            );
    }

    public function loadAvailableCourses()
    {
        $user = Auth::user();

        $this->availableCourses = DB::table('courses')
            ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
            ->where('enrollments.student_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->get();
    }

    public function sendMessage()
    {
        $this->validate([
            'newMessage.receiver_id' => 'required|exists:users,id',
            'newMessage.subject' => 'required|string|max:255',
            'newMessage.content' => 'required|string',
        ]);

        Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $this->newMessage['receiver_id'],
            'course_id' => $this->newMessage['course_id'] ?: null,
            'subject' => $this->newMessage['subject'],
            'content' => $this->newMessage['content'],
        ]);

        $this->newMessage = [
            'receiver_id' => '',
            'course_id' => '',
            'subject' => '',
            'content' => '',
        ];
        $this->showComposeForm = false;
        $this->loadMessages();

        $this->toastSuccess('Message sent successfully!', 'Success');
    }

    public function markAsRead($messageId)
    {
        $message = Message::find($messageId);
        if ($message && $message->receiver_id === Auth::id()) {
            $message->update(['read_at' => now()]);
            $this->loadMessages();
        }
    }

    public function render()
    {
        return view('livewire.student-messages');
    }
}
