<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Curriculum Management</flux:heading>
            <flux:subheading>Structure your course with topics and learning objectives</flux:subheading>
        </div>
    </div>

    <!-- Course Selection -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm relative">
        <div class="max-w-xs space-y-4">
            <flux:label for="course-select" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Select Course to Manage</flux:label>
            <flux:select wire:model.live="selectedCourse" id="course-select" placeholder="Choose a course...">
                <flux:select.option value="" disabled hidden>Choose a course...</flux:select.option>
                @foreach($courses as $course)
                    <flux:select.option value="{{ $course->id }}">{{ $course->name }}</flux:select.option>
                @endforeach
            </flux:select>
        </div>
    </div>

    <div class="relative min-h-[400px]">
        <!-- Global Loading Overlay -->
        <div wire:loading.flex wire:target="selectedCourse" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synchronizing curriculum...</p>
            </div>
        </div>

        @if($selectedCourse)
            <!-- Toolbar -->
            <div class="flex justify-end mb-6">
                <flux:button wire:click="$set('showAddForm', true)" variant="primary" icon="plus">Add Topic</flux:button>
            </div>

            <!-- Create/Edit Modal -->
            <flux:modal wire:model="showAddForm" variant="flyout" class="space-y-6">
               <div class="p-6 space-y-6">
                   <div>
                       <flux:heading size="xl">{{ $editingTopic ? 'Update Topic' : 'Add New Topic' }}</flux:heading>
                       <flux:subheading>Define the scope and objectives for this learning unit.</flux:subheading>
                   </div>
                   
                   <form wire:submit="{{ $editingTopic ? 'updateTopic' : 'addTopic' }}" class="space-y-6">
                       <div class="grid grid-cols-2 gap-4">
                           <flux:input type="number" wire:model="newTopic.week_number" label="Week Number" min="1" />
                           <flux:select wire:model="newTopic.status" label="Status">
                               <flux:select.option value="pending">Pending</flux:select.option>
                               <flux:select.option value="in_progress">In Progress</flux:select.option>
                               <flux:select.option value="completed">Completed</flux:select.option>
                           </flux:select>
                       </div>

                       <flux:input wire:model="newTopic.topic" label="Topic Title" placeholder="e.g. Introduction to Data Structures" />
                       
                       <flux:textarea wire:model="newTopic.description" label="Description / Learning Objectives" placeholder="Outline the key concepts covered..." rows="4" />

                       <div class="flex gap-3 pt-4 justify-end">
                           <flux:button wire:click="{{ $editingTopic ? 'cancelEdit' : '$set(\'showAddForm\', false)' }}" variant="ghost">Cancel</flux:button>
                           <flux:button type="submit" variant="primary">{{ $editingTopic ? 'Update Topic' : 'Add Topic' }}</flux:button>
                       </div>
                   </form>
               </div>
            </flux:modal>


            
            <!-- Curriculum List -->
            @if($curriculum && $curriculum->count() > 0)
                <div class="space-y-4 animate-fadeIn">
                    @foreach($curriculum as $topic)
                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] overflow-hidden">
                            <div class="p-5 flex flex-col md:flex-row gap-6">
                                <!-- Week Badge -->
                                <div class="flex-shrink-0">
                                    <div class="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                                        <span class="text-[10px] font-bold uppercase tracking-wider">Week</span>
                                        <span class="text-2xl font-bold leading-none">{{ $topic->week_number }}</span>
                                    </div>
                                </div>

                                <div class="flex-1 space-y-2">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">{{ $topic->topic }}</h3>
                                            @php
                                                $statusColors = [
                                                    'pending' => 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
                                                    'in_progress' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                                    'completed' => 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                                                ];
                                                $statusLabel = ucfirst(str_replace('_', ' ', $topic->status));
                                            @endphp
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight mt-1 {{ $statusColors[$topic->status] ?? 'bg-zinc-100' }}">
                                                {{ $statusLabel }}
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <flux:button wire:click="editTopic({{ $topic->id }})" variant="ghost" size="xs" icon="pencil-square" />
                                            <flux:button wire:click="deleteTopic({{ $topic->id }})" wire:confirm="Remove this topic?" variant="ghost" size="xs" icon="trash" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
                                        </div>
                                    </div>
                                    
                                    <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ $topic->description }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="py-24 text-center space-y-4">
                    <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                        <i class="fas fa-list-check text-3xl"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Curriculum Found</h3>
                        <p class="text-xs text-zinc-500 mt-1">Define your course structure by adding weekly topics.</p>
                    </div>
                </div>
            @endif
        @else
            <div class="py-24 text-center space-y-4">
                <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-200 dark:text-zinc-700">
                    <i class="fas fa-graduation-cap text-3xl"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest italic">Course Context Required</h3>
                     <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a course to manage curriculum.</p>
                </div>
            </div>
        @endif
    </div>

    @if($editingTopic)
    <!-- Manual Modal Wrapper for Edit since wire:model variable isn't boolean -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" wire:click="cancelEdit">
        <div class="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl w-full max-w-xl overflow-hidden animate-scaleIn" wire:click.stop>
            <div class="p-6 space-y-6">
                <div>
                    <flux:heading size="xl">Update Topic</flux:heading>
                    <flux:subheading>Modify the details of this learning unit.</flux:subheading>
                </div>
                
                <form wire:submit="updateTopic" class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <flux:input type="number" wire:model="newTopic.week_number" label="Week Number" min="1" />
                        <flux:select wire:model="newTopic.status" label="Status">
                            <flux:select.option value="pending">Pending</flux:select.option>
                            <flux:select.option value="in_progress">In Progress</flux:select.option>
                            <flux:select.option value="completed">Completed</flux:select.option>
                        </flux:select>
                    </div>

                    <flux:input wire:model="newTopic.topic" label="Topic Title" />
                    
                    <flux:textarea wire:model="newTopic.description" label="Description" rows="4" />

                    <div class="flex gap-3 pt-4 justify-end">
                        <flux:button wire:click="cancelEdit" variant="ghost">Cancel</flux:button>
                        <flux:button type="submit" variant="primary">Save Changes</flux:button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    @endif
</div>
