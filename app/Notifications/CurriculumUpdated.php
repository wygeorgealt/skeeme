<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\SchemeOfWork;
use App\Models\Course;

class CurriculumUpdated extends Notification
{
    use Queueable;

    protected $schemeOfWork;
    protected $course;

    /**
     * Create a new notification instance.
     */
    public function __construct(SchemeOfWork $schemeOfWork, Course $course)
    {
        $this->schemeOfWork = $schemeOfWork;
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
        return (new MailMessage)
                    ->line('The curriculum for your course has been updated.')
                    ->action('View Curriculum', url('/student/curriculum'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Curriculum Updated',
            'message' => "The curriculum for '{$this->course->name}' has been updated. Topic: '{$this->schemeOfWork->topic}'.",
            'type' => 'curriculum_updated',
            'course_id' => $this->course->id,
            'scheme_of_work_id' => $this->schemeOfWork->id,
            'url' => route('student.curriculum'),
        ];
    }
}
