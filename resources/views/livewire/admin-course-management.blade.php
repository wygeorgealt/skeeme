<div class="p-6 space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Course Management</flux:heading>
            <flux:subheading>Create, modify, and oversee all courses</flux:subheading>
        </div>
        <flux:button wire:click="openCreateModal" variant="primary" icon="plus">Create Course</flux:button>
    </div>

    <!-- Filters & Search -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-6">
            <flux:input wire:model.live="search" icon="magnifying-glass" placeholder="Search courses by name or code..." />
        </div>
        <div class="md:col-span-3">
            <flux:select wire:model.live="filter" placeholder="Filter Status">
                <flux:select.option value="all">All Status</flux:select.option>
                <flux:select.option value="active">Active</flux:select.option>
                <flux:select.option value="archived">Archived</flux:select.option>
            </flux:select>
        </div>
        <div class="md:col-span-3">
            <flux:select wire:model.live="sortBy" placeholder="Sort By">
                <flux:select.option value="name">Name</flux:select.option>
                <flux:select.option value="created">Date Created</flux:select.option>
                <flux:select.option value="lecturers">Lecturer Assigned</flux:select.option>
            </flux:select>
        </div>
    </div>

    <!-- Courses Table -->
    <div class="overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative min-h-[400px]">
        <!-- Loading Overlay -->
        <div wire:loading.flex wire:target="search,filter,sortBy" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Updating table...</p>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                <thead class="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                    <tr>
                        <th class="px-6 py-4">Course Name</th>

                        <th class="px-6 py-4">Lecturer</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                    @forelse($courses as $course)
                        <tr class="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-zinc-900 dark:text-zinc-100">{{ $course->name }}</div>
                                @if($course->creator)
                                    <div class="text-[10px] text-zinc-400 mt-0.5">
                                        Created by {{ $course->creator->first_name }}
                                        <span class="opacity-50">({{ $course->creator->hasRole('lecturer') ? 'Lecturer' : 'Admin' }})</span>
                                    </div>
                                @endif
                            </td>

                            <td class="px-6 py-4">
                                @if($course->lecturers->count() > 0)
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                            {{ substr($course->lecturers->first()->first_name, 0, 1) }}
                                        </div>
                                        <span class="font-medium text-zinc-700 dark:text-zinc-300">{{ $course->lecturers->first()->first_name }} {{ $course->lecturers->first()->last_name }}</span>
                                    </div>
                                @else
                                    <span class="text-xs italic text-zinc-400">Unassigned</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide {{ $course->status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' }}">
                                    {{ ucfirst($course->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <flux:button wire:click="openEditModal({{ $course->id }})" variant="ghost" size="xs" icon="pencil-square" title="Edit" />
                                    
                                    @if($course->status === 'active')
                                        <flux:button wire:click="toggleStatus({{ $course->id }})" variant="ghost" size="xs" icon="archive-box" class="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" title="Archive" />
                                    @else
                                        <flux:button wire:click="toggleStatus({{ $course->id }})" variant="ghost" size="xs" icon="arrow-path" class="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Restore" />
                                    @endif

                                    <flux:button wire:click="deleteCourse({{ $course->id }})" wire:confirm="Are you sure you want to delete this course?" variant="ghost" size="xs" icon="trash" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Delete" />
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                <div class="flex flex-col items-center justify-center gap-2">
                                    <flux:icon icon="magnifying-glass" class="w-8 h-8 opacity-20" />
                                    <p class="text-sm font-medium">No courses found matching your criteria.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Create Course Modal -->
    <flux:modal wire:model="showCreateModal" class="md:w-[600px]">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">Create New Course</flux:heading>
                <flux:subheading>Add a new course to the curriculum.</flux:subheading>
            </div>

            <form wire:submit="createCourse" class="space-y-6">
                <flux:input wire:model="createName" label="Course Name" placeholder="e.g. Advanced Mathematics" />
                
                <flux:textarea wire:model="createDescription" label="Description" placeholder="Course overview..." />

                <flux:select wire:model="createLecturerId" label="Assign Lecturer" placeholder="Choose a lecturer...">
                    <flux:select.option value="" disabled hidden>Choose a lecturer...</flux:select.option>
                    @foreach($availableLecturers as $lecturer)
                        <flux:select.option value="{{ $lecturer->id }}">{{ $lecturer->first_name }} {{ $lecturer->last_name }}</flux:select.option>
                    @endforeach
                </flux:select>

                <div class="flex justify-end gap-3 pt-4">
                    <flux:button wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Create Course</flux:button>
                </div>
            </form>
        </div>
    </flux:modal>

    <!-- Edit Course Modal -->
    <flux:modal wire:model="showEditModal" class="md:w-[600px]">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">Edit Course</flux:heading>
                <flux:subheading>Update course details and assignment.</flux:subheading>
            </div>

            <form wire:submit="updateCourse" class="space-y-6">
                <flux:input wire:model="editName" label="Course Name" />
                
                <flux:textarea wire:model="editDescription" label="Description" />

                <flux:select wire:model="editLecturerId" label="Assign Lecturer" placeholder="Choose a lecturer...">
                     <flux:select.option value="" disabled hidden>Choose a lecturer...</flux:select.option>
                    @foreach($availableLecturers as $lecturer)
                        <flux:select.option value="{{ $lecturer->id }}">{{ $lecturer->first_name }} {{ $lecturer->last_name }}</flux:select.option>
                    @endforeach
                </flux:select>

                <div class="flex justify-end gap-3 pt-4">
                    <flux:button wire:click="closeModals" variant="ghost">Cancel</flux:button>
                    <flux:button type="submit" variant="primary">Save Changes</flux:button>
                </div>
            </form>
        </div>
    </flux:modal>
</div>
