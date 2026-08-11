<div class="p-6">
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Course Representatives</h1>
        <p class="text-zinc-600 dark:text-zinc-400">Manage student representatives for your assigned courses.</p>
    </div>

    <div class="space-y-6">
        <!-- Search and Filters -->
        <div class="flex items-center justify-between gap-4">
            <div class="w-full md:w-72">
                <flux:input wire:model.live="search" icon="magnifying-glass" placeholder="Search courses..." />
            </div>
        </div>

        <!-- Courses Table -->
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                        <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Course</th>
                        <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">Code</th>
                        <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">Students</th>
                        <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Course Rep</th>
                        <th class="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                    @forelse ($courses as $course)
                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                            <td class="px-6 py-4">
                                <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ $course->name }}</div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                    {{ strtoupper(explode('-', $course->code)[1] ?? $course->code) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ $course->enrolled_students_count }}</span>
                            </td>
                            <td class="px-6 py-4">
                                @if ($course->courseRep)
                                    <div class="flex items-center gap-3">
                                        <div class="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                            {{ strtoupper(substr($course->courseRep->name, 0, 1)) }}{{ strtoupper(substr(strrchr($course->courseRep->name, " "), 1, 1)) ?: '' }}
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{{ $course->courseRep->name }}</span>
                                            <span class="text-xs text-zinc-500">{{ $course->courseRep->email }}</span>
                                        </div>
                                    </div>
                                @else
                                    <span class="text-zinc-500 italic text-sm">No representative</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    @if ($course->courseRep)
                                        <button wire:click="removeRep({{ $course->id }})" 
                                                wire:confirm="Are you sure you want to remove {{ $course->courseRep->name }} as representative for {{ $course->name }}?"
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                            <i class="fas fa-user-minus"></i>
                                            Remove
                                        </button>
                                    @else
                                        <button wire:click="openAssignModal({{ $course->id }})" 
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors shadow-sm">
                                            <i class="fas fa-user-plus"></i>
                                            Assign Rep
                                        </button>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-zinc-500">
                                <div class="flex flex-col items-center gap-2">
                                    <i class="fas fa-book-open text-3xl opacity-20"></i>
                                    <p>No courses found matching your search.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Assign Modal -->
    <flux:modal wire:model="showAssignModal" class="md:w-[500px]">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">Assign Course Representative</flux:heading>
                <flux:subheading>Select a student to represent this course.</flux:subheading>
            </div>

            @if($this->selectedCourseId)
                <div class="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                    @forelse($this->availableStudents as $student)
                        <div class="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold">
                                    {{ strtoupper(substr($student->name, 0, 1)) }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ $student->name }}</span>
                                    <span class="text-xs text-zinc-500">{{ $student->email }}</span>
                                </div>
                            </div>
                            <flux:button size="xs" variant="primary" wire:click="assignRep({{ $student->id }})">
                                Select
                            </flux:button>
                        </div>
                    @empty
                        <div class="py-12 text-center text-zinc-500">
                            <i class="fas fa-users-slash text-2xl opacity-20 mb-2"></i>
                            <p>No students enrolled in this course yet.</p>
                        </div>
                    @endforelse
                </div>
            @endif

            <div class="flex justify-end pt-4">
                <flux:button wire:click="closeAssignModal">Cancel</flux:button>
            </div>
        </div>
    </flux:modal>
</div>
