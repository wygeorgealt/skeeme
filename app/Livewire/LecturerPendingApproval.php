<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Auth;

class LecturerPendingApproval extends Component
{
    public $pollCount = 0;
    public $maxPolls = 120; // 10 minutes at 5-second intervals
    public $isApproved = false;

    protected $listeners = ['checkApproval'];

    public function mount()
    {
        // Redirect if not authenticated or not a lecturer
        if (!Auth::check() || Auth::user()->role !== 'lecturer') {
            return redirect()->route('dashboard');
        }

        // If already active (approved), redirect to dashboard
        if (Auth::user()->status === 'active') {
            return redirect()->route('dashboard');
        }

        // Start polling
        $this->dispatch('startPolling');
    }

    public function checkApproval()
    {
        $user = Auth::user();
        $user->refresh();

        if ($user->status === 'active') {
            $this->isApproved = true;
            return redirect()->route('dashboard')->with('success', 'Your account has been approved! Welcome to Skeeme.');
        }

        $this->pollCount++;

        // Stop polling after max attempts (10 minutes)
        if ($this->pollCount >= $this->maxPolls) {
            // Just keep showing the page, don't give up
            $this->pollCount = 0;
        }
    }

    public function render()
    {
        return view('livewire.lecturer-pending-approval', [
            'lecturer' => Auth::user(),
        ]);
    }
}
