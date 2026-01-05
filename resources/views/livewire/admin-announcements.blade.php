<div class="p-6 md:p-10">
    <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-aos="fade-down">
            <div>
                <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ __('Announcements') }}</h1>
                <p class="text-zinc-600 dark:text-zinc-400 font-medium">{{ __('Create and manage school-wide broadcasts and targeted notifications.') }}</p>
            </div>
            <div>
                <flux:button wire:click="openCreateModal" variant="primary" icon="plus" class="shadow-sm">
                    {{ __('New Announcement') }}
                </flux:button>
            </div>
        </div>

        <!-- Filters Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" data-aos="fade-up">
            <!-- Search -->
            <div class="md:col-span-2">
                <flux:input wire:model.live.debounce.300ms="search" icon="magnifying-glass" placeholder="{{ __('Search by title or content...') }}" />
            </div>

            <!-- Priority Filter -->
            <div class="md:col-span-1">
                <select wire:model.live="priorityFilter" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none transition-all text-zinc-700 dark:text-zinc-300">
                    <option value="all">{{ __('All Priorities') }}</option>
                    <option value="low">{{ __('Low') }}</option>
                    <option value="normal">{{ __('Normal') }}</option>
                    <option value="high">{{ __('High') }}</option>
                    <option value="urgent">{{ __('Urgent') }}</option>
                </select>
            </div>

            <!-- Target Filter -->
            <div class="md:col-span-1">
                <select wire:model.live="targetFilter" class="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-zinc-500 outline-none transition-all text-zinc-700 dark:text-zinc-300">
                    <option value="all">{{ __('All Audiences') }}</option>
                    <option value="all_students">{{ __('All Students') }}</option>
                    <option value="all_lecturers">{{ __('All Lecturers') }}</option>
                    <option value="specific_course">{{ __('Specific Course') }}</option>
                    <option value="specific_class">{{ __('Specific Class') }}</option>
                </select>
            </div>
        </div>

        <!-- Announcements Table -->
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm" data-aos="fade-up">
            @if(count($announcements) > 0)
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th wire:click="sort('title')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center gap-2">
                                    {{ __('Title & Content') }}
                                    @if($sortBy === 'title')
                                        <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                    @endif
                                </div>
                            </th>
                            <th wire:click="sort('priority')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center justify-center gap-2">
                                    {{ __('Priority') }}
                                    @if($sortBy === 'priority')
                                        <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                    @endif
                                </div>
                            </th>
                            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">{{ __('Target') }}</th>
                            <th wire:click="sort('created_at')" class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                                <div class="flex items-center justify-center gap-2">
                                    {{ __('Date') }}
                                    @if($sortBy === 'created_at')
                                        <i class="fas fa-sort-{{ $sortDirection === 'asc' ? 'up' : 'down' }} text-zinc-900 dark:text-zinc-100"></i>
                                    @endif
                                </div>
                            </th>
                            <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">{{ __('Actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                        @foreach($announcements as $announcement)
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex flex-col max-w-md">
                                        <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ $announcement['title'] }}</div>
                                        <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 italic font-medium">By: {{ $announcement['sender']['first_name'] }} {{ $announcement['sender']['last_name'] }}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <div class="flex flex-col items-center gap-2">
                                        @php
                                            $priorityColors = [
                                                'urgent' => 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
                                                'high' => 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
                                                'normal' => 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                                                'low' => 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200',
                                            ];
                                            $color = $priorityColors[$announcement['priority']] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200';
                                        @endphp
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border {{ $color }} uppercase tracking-tight">
                                            {{ $announcement['priority'] }}
                                        </span>
                                        @if(!empty($announcement['google_event_id']))
                                            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                                                <i class="fab fa-google text-[8px]"></i>
                                                {{ __('Synced') }}
                                            </div>
                                        @endif
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                        @switch($announcement['target_type'])
                                            @case('all_students') {{ __('All Students') }} @break
                                            @case('all_lecturers') {{ __('All Lecturers') }} @break
                                            @case('specific_course') {{ __('Course') }} @break
                                            @case('specific_class') {{ __('Class') }} @break
                                            @default {{ str_replace('_', ' ', $announcement['target_type']) }}
                                        @endswitch
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium italic">
                                    {{ \Carbon\Carbon::parse($announcement['published_at'])->format('M d, Y') }}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex justify-end gap-2">
                                        <flux:button wire:click="openAnnouncement({{ $announcement['id'] }})" variant="ghost" size="sm" icon="eye" class="!rounded-lg" />
                                        <flux:button wire:click="editAnnouncement({{ $announcement['id'] }})" variant="ghost" size="sm" icon="pencil-square" class="!rounded-lg" />
                                        <flux:button wire:click="duplicateAnnouncement({{ $announcement['id'] }})" variant="ghost" size="sm" icon="document-duplicate" class="!rounded-lg" />
                                        <flux:button wire:click="deleteAnnouncement({{ $announcement['id'] }})" variant="ghost" size="sm" icon="trash" class="!rounded-lg hover:!text-red-500" />
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="py-20 text-center text-zinc-500">
                    <div class="flex flex-col items-center gap-3">
                        <i class="fas fa-bullhorn text-4xl opacity-20"></i>
                        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ __('No Announcements Found') }}</h3>
                        <p class="max-w-xs mx-auto font-medium">{{ __('Start by creating your first announcement to keep your community informed.') }}</p>
                        <flux:button wire:click="openCreateModal" variant="primary" class="mt-4 shadow-sm">
                            {{ __('Create First Announcement') }}
                        </flux:button>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- Create/Edit Modal -->
    <flux:modal name="create-announcement" 
                variant="flyout" 
                class="space-y-6"
                x-on:show-create-modal.window="$flux.modal('create-announcement').show()"
                x-on:announcement-created.window="$flux.modal('create-announcement').close()"
                x-on:announcement-updated.window="$flux.modal('create-announcement').close()">
        <div>
            <flux:heading size="lg">{{ $editingAnnouncement ? __('Edit Announcement') : __('Create New Announcement') }}</flux:heading>
            <flux:subheading>{{ __('Fill in the details below to broadcast your message.') }}</flux:subheading>
        </div>

        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-2">
            <div class="flex items-center gap-2 mb-3">
                <flux:icon.sparkles variant="micro" class="text-indigo-600 dark:text-indigo-400" />
                <flux:heading size="sm" class="!text-indigo-900 dark:!text-indigo-100">{{ __('Draft with AI') }}</flux:heading>
            </div>
            <div class="flex gap-2">
                <div class="flex-1">
                    <flux:input wire:model="aiPrompt" placeholder="{{ __('e.g. Exam starts next Monday, resumption at 8am...') }}" />
                </div>
                <flux:button wire:click="generateAIDraft" variant="primary" size="sm" class="!rounded-xl" wire:loading.attr="disabled">
                    <span wire:loading.remove wire:target="generateAIDraft">{{ __('Generate') }}</span>
                    <span wire:loading wire:target="generateAIDraft">{{ __('Thinking...') }}</span>
                </flux:button>
            </div>
        </div>

        <form wire:submit="{{ $editingAnnouncement ? 'updateAnnouncement' : 'createAnnouncement' }}" class="space-y-6">
            <flux:input wire:model="title" :label="__('Title')" placeholder="{{ __('Enter announcement title') }}" required />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <flux:select wire:model="priority" :label="__('Priority')">
                    <flux:select.option value="low">{{ __('Low') }}</flux:select.option>
                    <flux:select.option value="normal">{{ __('Normal') }}</flux:select.option>
                    <flux:select.option value="high">{{ __('High') }}</flux:select.option>
                    <flux:select.option value="urgent">{{ __('Urgent') }}</flux:select.option>
                </flux:select>

                <flux:select wire:model.live="target_type" :label="__('Target Audience')">
                    <flux:select.option value="all_students">{{ __('All Students') }}</flux:select.option>
                    <flux:select.option value="all_lecturers">{{ __('All Lecturers') }}</flux:select.option>
                    <flux:select.option value="specific_course">{{ __('Specific Course') }}</flux:select.option>
                    <flux:select.option value="specific_class">{{ __('Specific Class') }}</flux:select.option>
                </flux:select>
            </div>

            @if($target_type === 'specific_course')
                <flux:select wire:model="course_id" :label="__('Course')" placeholder="{{ __('Choose a course...') }}">
                    @foreach($courses as $course)
                        <flux:select.option value="{{ $course->id }}">{{ $course->name }}</flux:select.option>
                    @endforeach
                </flux:select>
            @endif

            @if($target_type === 'specific_class')
                <flux:select wire:model="class_id" :label="__('Class')" placeholder="{{ __('Choose a class...') }}">
                    @foreach($classes as $class)
                        <flux:select.option value="{{ $class->id }}">{{ $class->name }}</flux:select.option>
                    @endforeach
                </flux:select>
            @endif

            <flux:textarea wire:model="content" :label="__('Content')" rows="5" placeholder="{{ __('Type your message here...') }}" required />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <flux:input wire:model="event_start_date" type="datetime-local" :label="__('Event Start Date')" />
                <flux:input wire:model="event_end_date" type="datetime-local" :label="__('Event End Date')" />
            </div>

            @if($hasLinkedGoogle)
                <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <flux:checkbox wire:model="sync_to_calendar" :label="__('Sync to my Google Calendar')" />
                    <p class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 ml-6 font-medium">
                        {{ __('This will create a new event in your primary Google Calendar.') }}
                    </p>
                </div>
            @endif

            @if(!$editingAnnouncement)
                <flux:checkbox wire:model="send_email" :label="__('Send email notifications to recipients')" />
            @endif

            <div class="flex gap-3 pt-4 border-t border-slate-100">
                <flux:spacer />
                <flux:button type="button" x-on:click="$flux.modal('create-announcement').close()" variant="ghost">{{ __('Cancel') }}</flux:button>
                <flux:button type="submit" variant="primary" class="!rounded-xl shadow-lg shadow-indigo-100">
                    {{ $editingAnnouncement ? __('Update Announcement') : __('Send Announcement') }}
                </flux:button>
            </div>
        </form>
    </flux:modal>

    <!-- View Modal -->
    <flux:modal name="view-announcement" 
                class="max-w-2xl"
                x-on:announcement-viewed.window="$flux.modal('view-announcement').show()">
        @if($viewAnnouncement)
            <div class="space-y-6">
                <div>
                    <flux:badge size="sm" color="{{ 
                        match($viewAnnouncement['priority']) {
                            'urgent' => 'red',
                            'high' => 'orange',
                            'normal' => 'indigo',
                            'low' => 'zinc',
                            default => 'zinc'
                        }
                    }}" class="mb-2">{{ $viewAnnouncement['priority'] }}</flux:badge>
                    @if(!empty($viewAnnouncement['google_event_id']))
                        <flux:badge size="sm" color="emerald" class="ml-2">
                            <i class="fab fa-google mr-1 text-[10px]"></i> {{ __('Synced to Calendar') }}
                        </flux:badge>
                    @endif
                    <flux:heading size="xl">{{ $viewAnnouncement['title'] }}</flux:heading>
                    <div class="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                        <div class="flex items-center gap-1.5">
                            <flux:icon.user variant="micro" class="text-slate-400" />
                            <span>{{ $viewAnnouncement['sender']['first_name'] }} {{ $viewAnnouncement['sender']['last_name'] }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <flux:icon.calendar variant="micro" class="text-slate-400" />
                            <span>{{ \Carbon\Carbon::parse($viewAnnouncement['published_at'])->format('M d, Y • H:i') }}</span>
                        </div>
                    </div>
                </div>

                <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap py-4 border-y border-slate-50">
                    {{ $viewAnnouncement['content'] }}
                </div>

                <div class="flex items-center justify-between gap-4">
                    <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Target: {{ str_replace('_', ' ', $viewAnnouncement['target_type']) }}
                    </div>
                    <flux:button x-on:click="$flux.modal('view-announcement').close()" variant="ghost">{{ __('Close') }}</flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    {{-- Script to handle additional logic if needed --}}
    <script>
        document.addEventListener('livewire:initialized', () => {
            // Extra logic can go here
        });
    </script>
</div>
</div>


