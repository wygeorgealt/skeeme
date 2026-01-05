<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Computed;
use App\Models\Timetable;
use App\Models\Course;
use App\Models\SchoolClass;
use App\Models\SocialAccount;
use App\Services\CalendarSyncService;
use Illuminate\Support\Facades\Auth;

class TimetableManagement extends Component
{

    public $currentMonth;
    public $showEventModal = false;
    public $selectedDate = null;
    
    public $newEvent = [
        'title' => '',
        'description' => '',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'type' => 'event',
        'is_all_day' => false,
    ];

    public $courses = [];

    public function mount()
    {
        $this->currentMonth = now()->startOfMonth();
        $this->courses = \App\Models\Course::where('school_id', Auth::user()->school_id)->get();
    }

    public function nextMonth()
    {
        $this->currentMonth = \Carbon\Carbon::parse($this->currentMonth)->addMonth();
    }

    public function previousMonth()
    {
        $this->currentMonth = \Carbon\Carbon::parse($this->currentMonth)->subMonth();
    }

    public function goToToday()
    {
        $this->currentMonth = now()->startOfMonth();
    }

    #[Computed]
    public function calendarEvents()
    {
        $start = \Carbon\Carbon::parse($this->currentMonth)->startOfMonth()->startOfWeek();
        $end = \Carbon\Carbon::parse($this->currentMonth)->endOfMonth()->endOfWeek();

        return \App\Models\CalendarEvent::where('user_id', Auth::id())
            ->whereBetween('start_at', [$start, $end])
            ->get();
    }

    #[Computed]
    public function calendarDays()
    {
        $start = \Carbon\Carbon::parse($this->currentMonth)->startOfMonth()->startOfWeek(0); // Sunday start
        $end = \Carbon\Carbon::parse($this->currentMonth)->endOfMonth()->endOfWeek(6); // Saturday end

        $dates = [];
        $curr = $start->copy();

        while ($curr->lte($end)) {
            $dates[] = $curr->copy();
            $curr->addDay();
        }

        return $dates;
    }

    public function selectDate($date)
    {
        $this->selectedDate = $date;
        $this->newEvent['start_time'] = '09:00';
        $this->newEvent['end_time'] = '10:00';
        $this->showEventModal = true;
    }

    public function saveEvent()
    {
        $this->validate([
            'newEvent.title' => 'required|min:3',
            'newEvent.start_time' => 'required',
            'newEvent.end_time' => 'required|after:newEvent.start_time',
        ]);

        $startDateTime = \Carbon\Carbon::parse($this->selectedDate)->setTimeFromTimeString($this->newEvent['start_time']);
        $endDateTime = \Carbon\Carbon::parse($this->selectedDate)->setTimeFromTimeString($this->newEvent['end_time']);

        \App\Models\CalendarEvent::create([
            'user_id' => Auth::id(),
            'school_id' => Auth::user()->school_id,
            'title' => $this->newEvent['title'],
            'description' => $this->newEvent['description'],
            'start_at' => $startDateTime,
            'end_at' => $endDateTime,
            'type' => $this->newEvent['type'],
            'is_all_day' => $this->newEvent['is_all_day'] ?? false,
        ]);

        $this->showEventModal = false;
        $this->resetNewEvent();
    }

    public function deleteEvent($id)
    {
        \App\Models\CalendarEvent::where('id', $id)->where('user_id', Auth::id())->delete();
    }

    private function resetNewEvent()
    {
        $this->newEvent = [
            'title' => '',
            'description' => '',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'type' => 'event',
            'is_all_day' => false,
        ];
    }

    public function render()
    {
        return view('livewire.timetable-management');
    }
}
