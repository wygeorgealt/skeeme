<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Course;

class CourseRepAssigned extends Notification
{
    use Queueable;

    public $course;

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
        return (new MailMessage)
                    ->subject('You have been assigned as Course Representative')
                    ->greeting('Congratulations!')
                    ->line('You have been assigned as the course representative for ' . $this->course->name . '.')
                    ->line('This is an important role where you will represent your fellow students and communicate with the lecturer.')
                    ->action('View Course', url('/student/courses/' . $this->course->id))
                    ->line('Thank you for taking on this responsibility!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Course Representative Assignment',
            'message' => 'You have been assigned as the course representative for ' . $this->course->name,
            'course_id' => $this->course->id,
            'course_name' => $this->course->name,
            'type' => 'course_rep_assigned',
        ];
    }
}
