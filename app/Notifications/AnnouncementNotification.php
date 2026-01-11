<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Announcement;

class AnnouncementNotification extends Notification
{
    use Queueable;

    protected $announcement;

    /**
     * Create a new notification instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
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
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->announcement->title,
            'message' => $this->announcement->content,
            'announcement_id' => $this->announcement->id,
            'priority' => $this->announcement->priority,
            'type' => 'announcement',
        ];
    }
}
