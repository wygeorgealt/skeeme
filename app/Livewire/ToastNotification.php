<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Auth;

class ToastNotification extends Component
{
    public $notifications = [];

    protected $listeners = [
        'notificationBroadcast' => 'handleBroadcastNotification',
        'notificationReceived' => 'handleNotificationReceived',
        'handleToastAction' => 'handleToastAction'
    ];

    public function mount()
    {
        // Initialize empty notifications array
        $this->notifications = [];
    }

    /**
     * Handle broadcast notifications from other components
     */
    public function handleBroadcastNotification($data)
    {
        $currentUserId = Auth::id();

        // Check if this notification is for the current user
        if (empty($data['userIds']) || in_array($currentUserId, $data['userIds'])) {
            $this->dispatch('showToastr', [
                'type' => $data['type'] ?? 'info',
                'message' => $data['message'],
                'title' => $data['title'] ?? 'Notification',
                'duration' => $data['duration'] ?? 5000,
                'action' => $data['action'] ?? null
            ]);
        }
    }

    /**
     * Handle individual notification received
     */
    public function handleNotificationReceived($notificationId)
    {
        // For future database integration
        // This method can be used when we want to store notifications in database
    }

    /**
     * Handle toast action clicks
     */
    public function handleToastAction($data)
    {
        $notificationId = $data['notificationId'] ?? null;

        if ($notificationId) {
            // Mark notification as read (for future database integration)
            // For now, just log the action
            logger("Toast action clicked for notification: {$notificationId}");
        }

        // Additional action handling can be added here
    }

    public function render()
    {
        return view('livewire.toast-notification');
    }
}
