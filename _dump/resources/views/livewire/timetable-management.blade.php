<div class="h-full flex flex-col space-y-6">
    <!-- Calendar Controls -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {{ \Carbon\Carbon::parse($currentMonth)->format('F Y') }}
            </h2>
            <div class="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
                <button wire:click="previousMonth" class="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all">
                    <i class="fas fa-chevron-left text-xs"></i>
                </button>
                <button wire:click="goToToday" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-all">
                    Today
                </button>
                <button wire:click="nextMonth" class="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all">
                    <i class="fas fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
        
        <div class="flex items-center gap-4">
            <!-- Legend or Filters could go here -->
            <div class="flex items-center gap-2 text-xs text-zinc-500">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Event
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Reminder
            </div>
        </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 flex flex-col shadow-sm min-h-[600px]">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            @foreach(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as $day)
                <div class="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {{ $day }}
                </div>
            @endforeach
        </div>

        <!-- Days -->
        <div class="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
            @foreach($this->calendarDays as $day)
                @php
                    $isToday = $day->isToday();
                    $isCurrentMonth = $day->month === \Carbon\Carbon::parse($currentMonth)->month;
                    $dayEvents = $this->calendarEvents->filter(function($event) use ($day) {
                        return $day->between($event->start_at->startOfDay(), $event->end_at ? $event->end_at->endOfDay() : $event->start_at->endOfDay());
                    });
                @endphp

                <div wire:click="selectDate('{{ $day->format('Y-m-d') }}')" 
                     class="min-h-[100px] p-2 relative group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors {{ !$isCurrentMonth ? 'bg-zinc-50/50 dark:bg-zinc-900/30' : '' }}">
                    
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-sm font-medium {{ $isToday ? 'bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-md' : ($isCurrentMonth ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600') }}">
                            {{ $day->format('j') }}
                        </span>
                        @if($isToday)
                            <span class="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">Today</span>
                        @endif
                    </div>

                    <!-- Events List -->
                    <div class="space-y-1">
                        @foreach($dayEvents as $event)
                            <div class="text-[10px] truncate px-1.5 py-0.5 rounded-md text-white font-medium"
                                 style="background-color: {{ $event->color ?: ($event->type === 'reminder' ? '#10b981' : '#6366f1') }}">
                                {{ $event->title }}
                            </div>
                        @endforeach
                    </div>
                    
                    <!-- Add Button Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 dark:bg-black/10 backdrop-blur-[1px]">
                        <div class="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-indigo-600">
                            <i class="fas fa-plus text-xs"></i>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Event Modal -->
    <flux:modal wire:model="showEventModal" class="md:w-[500px]">
        <div class="p-6 space-y-6">
            <div>
                <flux:heading size="lg">Add Event</flux:heading>
                <flux:subheading>
                    for {{ $selectedDate ? \Carbon\Carbon::parse($selectedDate)->format('l, F j, Y') : '' }}
                </flux:subheading>
            </div>

            <form wire:submit.prevent="saveEvent" class="space-y-4">
                <flux:input wire:model="newEvent.title" label="Title" placeholder="e.g. Biology Exam, Faculty Meeting" />
                
                <flux:textarea wire:model="newEvent.description" label="Description" placeholder="Add details..." rows="3" />

                <div class="grid grid-cols-2 gap-4">
                    <flux:input type="time" wire:model="newEvent.start_time" label="Start Time" />
                    <flux:input type="time" wire:model="newEvent.end_time" label="End Time" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <flux:select wire:model="newEvent.type" label="Type">
                        <flux:select.option value="event">Event</flux:select.option>
                        <flux:select.option value="reminder">Reminder</flux:select.option>
                        <flux:select.option value="class">Class</flux:select.option>
                    </flux:select>
                </div>

                <flux:checkbox wire:model="newEvent.is_all_day" label="All Day Event" />

                <div class="pt-2 flex justify-end gap-3">
                    <flux:button wire:click="$set('showEventModal', false)" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Save Event</flux:button>
                </div>
            </form>
        </div>
    </flux:modal>
</div>
