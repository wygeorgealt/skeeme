<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait HasToastNotifications
{
    /**
     * Show a success toast notification
     */
    public function toastSuccess(string $message, ?string $title = null, ?int $duration = null, ?array $action = null)
    {
        $this->dispatch('showToastr', type: 'success', message: $message, title: $title ?? 'Success', duration: $duration ?? 5000, action: $action);
    }

    /**
     * Show an error toast notification
     */
    public function toastError(string $message, ?string $title = null, ?int $duration = null, ?array $action = null)
    {
        $this->dispatch('showToastr', type: 'error', message: $message, title: $title ?? 'Error', duration: $duration ?? 7000, action: $action);
    }

    /**
     * Show a warning toast notification
     */
    public function toastWarning(string $message, ?string $title = null, ?int $duration = null, ?array $action = null)
    {
        $this->dispatch('showToastr', type: 'warning', message: $message, title: $title ?? 'Warning', duration: $duration ?? 7000, action: $action);
    }

    /**
     * Show an info toast notification
     */
    public function toastInfo(string $message, ?string $title = null, ?int $duration = null, ?array $action = null)
    {
        $this->dispatch('showToastr', type: 'info', message: $message, title: $title ?? 'Information', duration: $duration ?? 5000, action: $action);
    }

    /**
     * Broadcast toast notification to specific users
     * Note: This dispatches to ToastNotification component and globally to other listeners
     */
    public function toastBroadcast(string $message, array $userIds = [], ?string $type = 'info', ?string $title = null, ?int $duration = null, ?array $action = null)
    {
        // Dispatch to ToastNotification component (available on all pages via layout)
        $this->dispatch('notificationBroadcast', [
            'message' => $message,
            'userIds' => $userIds,
            'type' => $type,
            'title' => $title,
            'duration' => $duration,
            'action' => $action
        ])->to(\App\Livewire\ToastNotification::class);
    }

    /**
     * Show notification for content upload success
     */
    public function notifyContentUploaded(string $contentType, string $title)
    {
        $user = Auth::user();
        $this->toastSuccess(
            "{$contentType} uploaded successfully!",
            "Upload Complete"
        );
    }

    /**
     * Show notification for content submission success
     */
    public function notifyContentSubmitted(string $contentType, string $title)
    {
        $this->toastSuccess(
            "{$contentType} submitted successfully!",
            "Submission Complete"
        );
    }

    /**
     * Show notification for new content available
     */
    public function notifyNewContent(string $contentType, string $title, string $creatorName)
    {
        $this->toastInfo(
            "New {$contentType} added by {$creatorName}: {$title}",
            "New Content Available"
        );
    }

    /**
     * Show notification for submission received
     */
    public function notifySubmissionReceived(string $contentType, string $title, string $studentName)
    {
        $this->toastInfo(
            "{$studentName} submitted {$contentType}: {$title}",
            "New Submission"
        );
    }
}
