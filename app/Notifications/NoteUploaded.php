<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Note;
use App\Models\Course;

class NoteUploaded extends Notification
{
    use Queueable;

    protected $note;
    protected $course;

    /**
     * Create a new notification instance.
     */
    public function __construct(Note $note, Course $course)
    {
        $this->note = $note;
        $this->course = $course;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->mailer('resend')
                    ->line('A new note has been uploaded to your course.')
                    ->action('View Note', url('/student/notes'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $lecturer = $this->note->lecturer;
        $lecturerName = $lecturer ? 'Dr. ' . $lecturer->last_name : 'Lecturer';

        return [
            'title' => 'New Content Available',
            'message' => "New Notes added by {$lecturerName}: {$this->note->title}",
            'type' => 'note_uploaded',
            'course_id' => $this->course->id,
            'note_id' => $this->note->id,
            'url' => route('student.notes'),
        ];
    }
}
