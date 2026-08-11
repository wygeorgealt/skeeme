<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Slack\SlackMessage;

class GradeReleasedNotification extends Notification
{

    protected $exam;
    protected $score;
    protected $grade;

    public function __construct($exam, $score, $grade)
    {
        $this->exam = $exam;
        $this->score = $score;
        $this->grade = $grade;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'slack'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->mailer('resend')
            ->subject("Grade Released: {$this->exam->title}")
            ->greeting("Great news, {$notifiable->first_name}!")
            ->line("Your results for **{$this->exam->title}** have been published.")
            ->line("Score: **{$this->score}/100**")
            ->line("Grade: **{$this->grade}**")
            ->action('View Full Report', route('student.grades'))
            ->line('Keep up the good work!');
    }

    public function toSlack(object $notifiable): SlackMessage
    {
        return (new SlackMessage)
            ->text("🎓 *GRADE RELEASED*: {$this->exam->title}")
            ->headerBlock('Academic Result Published')
            ->sectionBlock(function ($section) use ($notifiable) {
                $section->text("Congratulations {$notifiable->first_name}, your grade is now available.");
                $section->field("*Exam*\n{$this->exam->title}");
                $section->field("*Score*\n{$this->score}/100");
                $section->field("*Grade*\n{$this->grade}");
            });
    }
}
