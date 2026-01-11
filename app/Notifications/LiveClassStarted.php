<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Slack\SlackMessage;
use App\Models\Course;

use Illuminate\Contracts\Queue\ShouldQueue;

class LiveClassStarted extends Notification implements ShouldQueue
{
    use Queueable;

    protected $course;

    public function __construct(Course $course)
    {
        $this->course = $course;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'slack'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Live Class Started: {$this->course->name}")
            ->greeting("Hello, {$notifiable->name}!")
            ->line("Your lecturer has just started a live class for **{$this->course->name}**.")
            ->action('Join Class Now', $this->course->zoom_join_url)
            ->line('See you there!');
    }

    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)
            ->text("🔴 *LIVE NOW*: {$this->course->name}")
            ->headerBlock('Virtual Classroom Active')
            ->sectionBlock(function ($section) {
                $section->text("Your lecturer has started the session. Click the link in the student portal to join!");
                $section->field("*Course*\n{$this->course->name}");
            })
            ->dividerBlock();
    }
}
