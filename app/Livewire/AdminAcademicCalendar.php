<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\AcademicEvent;
use App\Models\SocialAccount;
use App\Services\CalendarSyncService;
use Illuminate\Support\Facades\Auth;
use Flux;

class AdminAcademicCalendar extends Component
{
    public $events = [];
    public $showCreateModal = false;
    public $editingEvent = null;
    public $hasLinkedGoogle = false;

    public $newEvent = [
        'title' => '',
        'description' => '',
        'start_date' => '',
        'end_date' => '',
        'type' => 'event',
        'sync_to_calendar' => true,
    ];

    public function mount()
    {
        $this->loadEvents();
        $this->checkGoogleIntegration();
    }

    public function loadEvents()
    {
        $this->events = AcademicEvent::where('school_id', Auth::user()->school_id)
            ->orderBy('start_date', 'asc')
            ->get();
    }

    public function checkGoogleIntegration()
    {
        $this->hasLinkedGoogle = SocialAccount::where('user_id', Auth::id())
            ->where('provider', 'google')
            ->exists();
    }

    public function openCreateModal()
    {
        $this->resetForm();
        $this->showCreateModal = true;
    }

    public function createEvent()
    {
        $this->validate([
            'newEvent.title' => 'required|string|max:255',
            'newEvent.start_date' => 'required|date',
            'newEvent.end_date' => 'required|date|after_or_equal:newEvent.start_date',
            'newEvent.type' => 'required|in:holiday,milestone,event',
        ]);

        $event = AcademicEvent::create([
            'school_id' => Auth::user()->school_id,
            'title' => $this->newEvent['title'],
            'description' => $this->newEvent['description'],
            'start_date' => $this->newEvent['start_date'],
            'end_date' => $this->newEvent['end_date'],
            'type' => $this->newEvent['type'],
        ]);

        if ($this->newEvent['sync_to_calendar'] && $this->hasLinkedGoogle) {
            $syncService = new CalendarSyncService();
            $syncService->sync($event);
        }

        $this->resetForm();
        $this->loadEvents();
        $this->showCreateModal = false;
    }

    public function editEvent($id)
    {
        $event = AcademicEvent::find($id);
        if ($event && $event->school_id === Auth::user()->school_id) {
            $this->editingEvent = $event;
            $this->newEvent = [
                'title' => $event->title,
                'description' => $event->description,
                'start_date' => $event->start_date->format('Y-m-d\TH:i'),
                'end_date' => $event->end_date->format('Y-m-d\TH:i'),
                'type' => $event->type,
                'sync_to_calendar' => (bool)$event->google_event_id,
            ];
            $this->showCreateModal = true;
        }
    }

    public function updateEvent()
    {
        $this->validate([
            'newEvent.title' => 'required|string|max:255',
            'newEvent.start_date' => 'required|date',
            'newEvent.end_date' => 'required|date|after_or_equal:newEvent.start_date',
        ]);

        if ($this->editingEvent) {
            $this->editingEvent->update([
                'title' => $this->newEvent['title'],
                'description' => $this->newEvent['description'],
                'start_date' => $this->newEvent['start_date'],
                'end_date' => $this->newEvent['end_date'],
                'type' => $this->newEvent['type'],
            ]);

            if ($this->newEvent['sync_to_calendar'] && $this->hasLinkedGoogle) {
                $syncService = new CalendarSyncService();
                $syncService->sync($this->editingEvent);
            }

            $this->resetForm();
            $this->loadEvents();
            $this->showCreateModal = false;
        }
    }

    public function deleteEvent($id)
    {
        $event = AcademicEvent::find($id);
        if ($event && $event->school_id === Auth::user()->school_id) {
            $event->delete();
            $this->loadEvents();
        }
    }

    private function resetForm()
    {
        $this->editingEvent = null;
        $this->newEvent = [
            'title' => '',
            'description' => '',
            'start_date' => '',
            'end_date' => '',
            'type' => 'event',
            'sync_to_calendar' => true,
        ];
    }

    public function render()
    {
        return view('livewire.admin-academic-calendar');
    }
}
