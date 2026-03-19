<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Course;

class StudentEnrollment extends Notification
{
    use Queueable;

    protected $course;

    /**
     * Create a new notification instance.
     */
    public function __construct(Course $course)
    {
        $this->course = $course;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->mailer('resend')
                    ->subject('Enrollment Confirmation: ' . $this->course->name)
                    ->line('You have been successfully enrolled in the course: ' . $this->course->name)
                    ->action('View Course', url('/student/courses/' . $this->course->id))
                    ->line('Happy learning!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Course Enrollment',
            'message' => 'You have been enrolled in ' . $this->course->name,
            'course_id' => $this->course->id,
            'course_name' => $this->course->name,
            'type' => 'enrollment',
        ];
    }
}
