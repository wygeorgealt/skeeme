<div class="p-6 space-y-12">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Attendance Reports</flux:heading>
            <flux:subheading>Generate and view attendance reports for your courses</flux:subheading>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm relative">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
                <flux:label for="course-select" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Filter by Course</flux:label>
                <flux:select wire:model.live="selectedCourse" id="course-select" placeholder="All Courses">
                    <flux:select.option value="">All Courses</flux:select.option>
                    @foreach($courses as $course)
                        <flux:select.option value="{{ $course->id }}">{{ $course->name }}</flux:select.option>
                    @endforeach
                </flux:select>
            </div>
            <div class="space-y-2">
                <flux:label for="start-date" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Start Date</flux:label>
                <flux:input type="date" wire:model.live="startDate" id="start-date" />
            </div>
            <div class="space-y-2">
                <flux:label for="end-date" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">End Date</flux:label>
                <flux:input type="date" wire:model.live="endDate" id="end-date" />
            </div>
        </div>
    </div>

    <div class="relative min-h-[400px]">
        <!-- Loading Overlay -->
        <div wire:loading.flex wire:target="selectedCourse" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Generating reports...</p>
            </div>
        </div>

        @if($reports->count() > 0)
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                @foreach($reports as $report)
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6 transition-all hover:translate-y-[-2px] hover:shadow-md group">
                        <div class="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div class="space-y-1">
                                <flux:heading size="lg" class="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ $report->course_name }}</flux:heading>
                                <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ $report->course_code }}</div>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                                <i class="fas fa-chart-line text-zinc-400 dark:text-zinc-500"></i>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-zinc-50/50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Sessions</div>
                                <div class="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic font-mono">{{ $report->total_sessions }}</div>
                            </div>
                            <div class="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">
                                <div class="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/50 uppercase tracking-tighter mb-1">Present</div>
                                <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400 italic font-mono">{{ $report->present_count }}</div>
                            </div>
                            <div class="bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100/50 dark:border-rose-800/30">
                                <div class="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/50 uppercase tracking-tighter mb-1">Absent</div>
                                <div class="text-xl font-bold text-rose-600 dark:text-rose-400 italic font-mono">{{ $report->absent_count }}</div>
                            </div>
                            <div class="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100/50 dark:border-amber-800/30">
                                <div class="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-tighter mb-1">Late</div>
                                <div class="text-xl font-bold text-amber-600 dark:text-amber-400 italic font-mono">{{ $report->late_count }}</div>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Attendance Rate</span>
                                <span class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{{ $report->attendance_percentage }}%</span>
                            </div>
                            <div class="w-16 h-16 relative">
                                <svg class="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" class="text-zinc-100 dark:text-zinc-800" />
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" 
                                        class="text-indigo-600 dark:text-indigo-400"
                                        stroke-dasharray="{{ 2 * pi() * 28 }}"
                                        stroke-dashoffset="{{ (1 - $report->attendance_percentage / 100) * (2 * pi() * 28) }}"
                                        stroke-linecap="round" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                    {{ $report->attendance_percentage }}%
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm py-20 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 mb-4 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                    <i class="fas fa-chart-bar text-2xl text-zinc-300 dark:text-zinc-600"></i>
                </div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Reports Generated</h3>
                <p class="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                    @if($selectedCourse)
                        No attendance data found for the selected criteria in the chosen date range.
                    @else
                        Start by selecting a course or date range to see attendance performance metrics.
                    @endif
                </p>
            </div>
        @endif
    </div>
</div>
