<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Academic Calendar</flux:heading>
            <flux:subheading>Manage school holidays, milestones, and institutional events</flux:subheading>
        </div>
        <flux:button wire:click="openCreateModal" icon="plus" variant="primary">Add Calendar Event</flux:button>
    </div>

    <!-- Events List -->
    <div class="space-y-4 animate-fadeIn">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            @if(count($events) > 0)
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Event Detail</th>
                                <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Dates</th>
                                <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Type</th>
                                <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Sync Status</th>
                                <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                            @foreach($events as $event)
                                <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                    <td class="p-4">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $event->title }}</span>
                                            <span class="text-xs text-zinc-500 line-clamp-1">{{ $event->description }}</span>
                                        </div>
                                    </td>
                                    <td class="p-4 text-center">
                                        <div class="flex flex-col gap-0.5 items-center">
                                            <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                                                {{ $event->start_date->format('M d') }} - {{ $event->end_date->format('M d, Y') }}
                                            </span>
                                            <span class="text-[9px] text-zinc-400 font-bold font-mono">
                                                {{ $event->start_date->format('H:i') }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="p-4 text-center">
                                        @php
                                            $typeColors = [
                                                'holiday' => 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
                                                'milestone' => 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
                                                'event' => 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
                                            ];
                                            $color = $typeColors[$event->type] ?? $typeColors['event'];
                                        @endphp
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border {{ $color }}">
                                            {{ $event->type }}
                                        </span>
                                    </td>
                                    <td class="p-4 text-center">
                                        @if($event->google_event_id)
                                            <div class="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                <i class="fab fa-google text-[10px]"></i>
                                                <span class="text-[9px] font-black uppercase tracking-widest">Synced</span>
                                            </div>
                                        @else
                                            <span class="text-[9px] text-zinc-300 dark:text-zinc-700 font-bold uppercase tracking-widest">Local only</span>
                                        @endif
                                    </td>
                                    <td class="p-4 text-right">
                                        <div class="flex justify-end gap-2">
                                            <flux:button wire:click="editEvent({{ $event->id }})" variant="ghost" size="xs" icon="pencil-square" title="Edit" />
                                            <flux:button wire:click="deleteEvent({{ $event->id }})" variant="ghost" size="xs" icon="trash" title="Delete" class="text-rose-500" />
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="py-24 text-center space-y-4">
                    <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                        <i class="fas fa-calendar-alt text-3xl"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Empty Calendar</h3>
                        <p class="text-xs text-zinc-500 mt-1">No academic events or holidays have been scheduled yet.</p>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- Create/Edit Modal -->
    <flux:modal wire:model="showCreateModal" variant="flyout" class="space-y-6">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">{{ $editingEvent ? 'Edit Event' : 'New Academic Event' }}</flux:heading>
                <flux:subheading>Establish milestones or holidays for the institution.</flux:subheading>
            </div>

            <form wire:submit="{{ $editingEvent ? 'updateEvent' : 'createEvent' }}" class="space-y-6">
                <flux:input wire:model="newEvent.title" label="Event Title" placeholder="e.g. Mid-term Break" />
                
                <div class="grid grid-cols-2 gap-4">
                    <flux:input type="datetime-local" wire:model="newEvent.start_date" label="Start Date & Time" />
                    <flux:input type="datetime-local" wire:model="newEvent.end_date" label="End Date & Time" />
                </div>

                <flux:select wire:model="newEvent.type" label="Event Type">
                    <flux:select.option value="event">School Event</flux:select.option>
                    <flux:select.option value="holiday">Official Holiday</flux:select.option>
                    <flux:select.option value="milestone">Academic Milestone</flux:select.option>
                </flux:select>

                <flux:textarea wire:model="newEvent.description" label="Notes/Description" rows="3" />

                <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    @if($hasLinkedGoogle)
                        <flux:checkbox wire:model="newEvent.sync_to_calendar" label="Sync to Google Calendar" description="Instantly update linked staff and student calendars." />
                    @else
                        <div class="text-[10px] text-zinc-400 italic">Connect Google Account to enable automatic calendar synchronization.</div>
                    @endif
                </div>

                <div class="flex gap-2 justify-end">
                    <flux:modal.close>
                        <flux:button variant="ghost">Cancel</flux:button>
                    </flux:modal.close>
                    <flux:button type="submit" variant="primary">{{ $editingEvent ? 'Save Changes' : 'Schedule Event' }}</flux:button>
                </div>
            </form>
        </div>
    </flux:modal>
</div>
