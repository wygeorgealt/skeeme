<?php

namespace App\Livewire;

use Livewire\Component;
use App\Traits\HasToastNotifications;
use Illuminate\Support\Facades\Auth;

class NotificationTester extends Component
{
    use HasToastNotifications;

    public $testMessage = 'This is a test notification';
    public $testTitle = 'Test Title';
    public $selectedType = 'success';
    public $duration = 5000;
    public $includeAction = false;
    public $actionText = 'View Details';
    public $actionUrl = '#';

    protected $rules = [
        'testMessage' => 'required|string|max:255',
        'testTitle' => 'nullable|string|max:100',
        'selectedType' => 'required|in:success,error,warning,info',
        'duration' => 'required|integer|min:1000|max:30000',
        'actionText' => 'nullable|string|max:50',
        'actionUrl' => 'nullable|string'
    ];

    public function testNotification()
    {
        // Validate only the required fields
        $this->validate([
            'testMessage' => 'required|string|max:255',
            'testTitle' => 'nullable|string|max:100',
            'selectedType' => 'required|in:success,error,warning,info',
            'duration' => 'required|integer|min:1000|max:30000',
        ]);

        $action = null;
        if ($this->includeAction && $this->actionText && $this->actionUrl) {
            $action = [
                'text' => $this->actionText,
                'url' => $this->actionUrl
            ];
        }

        switch ($this->selectedType) {
            case 'success':
                $this->toastSuccess($this->testMessage, $this->testTitle ?: null, $this->duration, $action);
                break;
            case 'error':
                $this->toastError($this->testMessage, $this->testTitle ?: null, $this->duration, $action);
                break;
            case 'warning':
                $this->toastWarning($this->testMessage, $this->testTitle ?: null, $this->duration, $action);
                break;
            case 'info':
                $this->toastInfo($this->testMessage, $this->testTitle ?: null, $this->duration, $action);
                break;
        }
    }

    public function testBroadcastNotification()
    {
        // Validate only the required fields
        $this->validate([
            'testMessage' => 'required|string|max:255',
            'testTitle' => 'nullable|string|max:100',
            'selectedType' => 'required|in:success,error,warning,info',
            'duration' => 'required|integer|min:1000|max:30000',
        ]);

        $action = null;
        if ($this->includeAction && $this->actionText && $this->actionUrl) {
            $action = [
                'text' => $this->actionText,
                'url' => $this->actionUrl
            ];
        }

        // Broadcast to all users (empty array means all users)
        $this->toastBroadcast(
            $this->testMessage,
            [], // Empty array = broadcast to all
            $this->selectedType,
            $this->testTitle ?: null,
            $this->duration,
            $action
        );

        $this->toastSuccess('Broadcast notification sent to all users!', 'Broadcast Test');
    }

    public function testUseCaseLecturerUpload()
    {
        $user = Auth::user();
        $this->notifyContentUploaded('Course Notes', 'Introduction to Physics');
    }

    public function testUseCaseStudentSubmit()
    {
        $this->notifyContentSubmitted('Exam', 'Final Assessment');
    }

    public function testUseCaseNewContent()
    {
        $this->notifyNewContent('Notes', 'Advanced Mathematics', 'Dr. Smith');
    }

    public function testUseCaseSubmissionReceived()
    {
        $this->notifySubmissionReceived('Assignment', 'Homework 1', 'John Doe');
    }

    public function render()
    {
        return view('livewire.notification-tester');
    }
}
