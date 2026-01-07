<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Attendance Management</flux:heading>
            <flux:subheading>Take and manage student attendance for your courses</flux:subheading>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Courses</div>
            <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $courses->count() }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-indigo-500">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Students</div>
            <div class="text-3xl font-bold text-indigo-500 italic">{{ $courses->sum('enrollments_count') }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-emerald-500 text-center">
            <div class="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/50 uppercase tracking-widest mb-1">Status</div>
            <div class="text-3xl font-bold text-emerald-500 italic uppercase">Active</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sessions</div>
            <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic">READY</div>
        </div>
    </div>

    <div class="relative min-h-[400px]">
        <!-- Global Loading Overlay -->
        <div wire:loading.flex wire:target="selectCourse, takeAttendance" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Processing attendance data...</p>
            </div>
        </div>

        @if(!$showAttendanceForm)
            <!-- Course Selection -->
            <div class="space-y-4">
                <flux:heading size="lg" class="italic px-1">Select Course to Take Attendance</flux:heading>
                
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    @if($courses->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Course Details</th>

                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Students</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    @foreach($courses as $course)
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                                            <td class="p-4">
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{{ $course->name }}</span>
                                                </div>
                                            </td>
                                            <td class="p-4 text-center">
                                                <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $course->enrollments_count ?? 0 }}</span>
                                            </td>
                                            <td class="p-4 text-right">
                                                <flux:button wire:click="selectCourse({{ $course->id }})" variant="primary" size="sm" icon="pencil-square">
                                                    Take Attendance
                                                </flux:button>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="py-20 text-center">
                            <i class="fas fa-book-open text-4xl text-zinc-300 dark:text-zinc-700 mb-4"></i>
                            <flux:heading size="lg">No courses found</flux:heading>
                            <flux:subheading>You aren't assigned to any courses currently.</flux:subheading>
                        </div>
                    @endif
                </div>
            </div>
        @else
            <!-- Attendance Form -->
            <div class="animate-fadeIn space-y-6">
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                        <div>
                            <flux:heading size="lg">{{ $courses->where('id', $selectedCourse)->first()->name ?? 'N/A' }}</flux:heading>
                            <flux:subheading>Recording attendance for current session</flux:subheading>
                        </div>
                        <flux:button wire:click="$set('showAttendanceForm', false)" icon="x-mark" size="sm" variant="ghost" />
                    </div>
                    
                    <div class="p-6 bg-zinc-50/30 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800">
                        <div class="max-w-xs">
                            <flux:input type="date" wire:model.live="attendanceDate" label="Session Date" />
                        </div>
                    </div>

                    @if($students->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Student</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    @foreach($students as $student)
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                            <td class="p-4">
                                                <div class="flex items-center gap-3">
                                                    <div class="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-bold text-xs shadow-sm border border-zinc-200 dark:border-zinc-700">
                                                        {{ strtoupper(substr($student->first_name, 0, 1)) }}{{ strtoupper(substr($student->last_name, 0, 1)) }}
                                                    </div>
                                                    <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $student->first_name }} {{ $student->last_name }}</span>
                                                </div>
                                            </td>
                                            <td class="p-4">
                                                <span class="text-xs text-zinc-500 font-medium font-mono">{{ $student->email }}</span>
                                            </td>
                                            <td class="p-4 text-right">
                                                <select wire:model="students.{{ $loop->index }}.attendance_status" class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-zinc-700 dark:text-zinc-300 shadow-sm">
                                                    <option value="present">✅ Present</option>
                                                    <option value="absent">❌ Absent</option>
                                                    <option value="late">⏳ Late</option>
                                                </select>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        <div class="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                            <flux:button wire:click="$set('showAttendanceForm', false)">Discard</flux:button>
                            <flux:button wire:click="takeAttendance" variant="primary" icon="check-circle">Save Records</flux:button>
                        </div>
                    @else
                        <div class="p-20 text-center">
                            <flux:heading size="lg">No students enrolled</flux:heading>
                            <flux:subheading>There are no students registered for this course.</flux:subheading>
                        </div>
                    @endif
                </div>
            </div>
        @endif
    </div>

    <!-- Quick Actions -->
    <div class="space-y-6">
        <div>
            <flux:heading size="lg" class="italic px-1">Management Tools</flux:heading>
            <flux:subheading class="px-1">Access advanced records and reports</flux:subheading>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Grid item for History -->
            <a href="{{ route('lecturer.attendance.history') }}" class="group block">
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-xl relative overflow-hidden h-full">
                    <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <i class="fas fa-history text-9xl"></i>
                    </div>
                    <div class="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div class="space-y-3">
                            <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                                <i class="fas fa-history text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Attendance History</h3>
                                <p class="text-sm text-zinc-500 mt-1">Review and manage past attendance records for all your sessions.</p>
                            </div>
                        </div>
                        <div class="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            <span>View All Records</span>
                            <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                        </div>
                    </div>
                </div>
            </a>

            <!-- Grid item for Reports -->
            <a href="{{ route('lecturer.attendance.reports') }}" class="group block">
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-xl relative overflow-hidden h-full">
                    <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <i class="fas fa-chart-pie text-9xl"></i>
                    </div>
                    <div class="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div class="space-y-3">
                            <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <i class="fas fa-chart-pie text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Analytics & Reports</h3>
                                <p class="text-sm text-zinc-500 mt-1">Generate comprehensive attendance performance metrics and reports.</p>
                            </div>
                        </div>
                        <div class="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            <span>Generate Reports</span>
                            <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </div>
</div>
