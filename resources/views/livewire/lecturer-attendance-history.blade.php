<div class="p-6 space-y-12">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Attendance History</flux:heading>
            <flux:subheading>Review past attendance records for your courses</flux:subheading>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm relative">
        <div class="max-w-xs space-y-2">
            <flux:label for="course-select" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Filter by Course</flux:label>
            <flux:select wire:model.live="selectedCourse" id="course-select" placeholder="All Courses">
                <flux:select.option value="">All Courses</flux:select.option>
                @foreach($courses as $course)
                    <flux:select.option value="{{ $course->id }}">{{ $course->name }}</flux:select.option>
                @endforeach
            </flux:select>
        </div>
    </div>

    <div class="relative min-h-[400px]">
        <!-- Loading Overlay -->
        <div wire:loading.flex wire:target="selectedCourse" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Updating attendance...</p>
            </div>
        </div>

        <!-- Attendance Records Table -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        @if($attendanceRecords->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th class="p-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Date</th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Course</th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Student</th>
                            <th class="p-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                        @foreach($attendanceRecords as $record)
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                                <td class="p-4">
                                    <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono italic">
                                        {{ \Carbon\Carbon::parse($record->date)->format('M d, Y') }}
                                    </div>
                                </td>
                                <td class="p-4">
                                    <div class="flex flex-col">
                                        <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $record->course_name }}</div>
                                        <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{{ $record->course_code }}</div>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                            @php
                                                $nameParts = explode(' ', $record->student_name ?? 'U N');
                                                $initials = strtoupper(substr($nameParts[0], 0, 1) . substr(end($nameParts), 0, 1));
                                            @endphp
                                            {{ $initials }}
                                        </div>
                                        <div class="flex flex-col">
                                            <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $record->student_name ?? 'Unknown Student' }}</div>
                                            <div class="text-[11px] text-zinc-500 lowercase tracking-tight">{{ $record->student_email ?? '' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-4 text-center">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border
                                        @if(strtolower($record->status) === 'present') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                        @elseif(strtolower($record->status) === 'absent') bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800
                                        @elseif(strtolower($record->status) === 'late') bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800
                                        @else bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 @endif shadow-sm">
                                        {{ $record->status }}
                                    </span>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @else
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm py-20 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 mb-4 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                    <i class="fas fa-history text-2xl text-zinc-300 dark:text-zinc-600"></i>
                </div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Records Found</h3>
                <p class="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                    @if($selectedCourse)
                        We couldn't find any attendance logs for the selected course.
                    @else
                        No attendance records have been captured in the system yet.
                    @endif
                </p>
            </div>
        @endif
    </div>
</div>

