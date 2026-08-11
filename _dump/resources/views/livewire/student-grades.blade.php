<div class="p-8">
        <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
            <flux:heading size="xl" level="1">Academic Transcript</flux:heading>
            <flux:subheading>Monitor your terminal grades, GPA, and performance trends</flux:subheading>
        </div>
        
        @if($gpa)
            <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative flex items-center bg-white dark:bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div class="mr-6">
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Cumulative GPA</p>
                        <div class="flex items-baseline gap-1">
                            <span class="text-3xl font-black text-zinc-900 dark:text-zinc-100">{{ number_format($gpa, 2) }}</span>
                            <span class="text-xs font-bold text-zinc-400">/ 4.0</span>
                        </div>
                    </div>
                    <div class="w-16 h-16 rounded-full border-4 border-indigo-500/10 flex items-center justify-center relative">
                        <svg class="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" class="text-zinc-100 dark:text-zinc-800" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" class="text-indigo-500" stroke-dasharray="175.929" stroke-dashoffset="{{ 175.929 * (1 - ($gpa / 4.0)) }}" />
                        </svg>
                        <i class="fas fa-graduation-cap text-indigo-500"></i>
                    </div>
                </div>
            </div>
        @endif
    </div>

        <!-- Grades Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-fadeIn">
        <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Grade Distribution</h3>
            <div class="flex items-center gap-2">
                <span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verified Results</span>
            </div>
        </div>

        <div class="overflow-x-auto">
            @if($grades->count() > 0)
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-zinc-50/50 dark:bg-zinc-800/30">
                            <th class="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Course Information</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Performance Index</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Weighted Average</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Letter Grade</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                        @foreach($grades as $grade)
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <td class="px-8 py-5">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                                            <i class="fas fa-book-open text-xs"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $grade->course_name }}</p>
                                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{{ $grade->course_code }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <div class="flex flex-col gap-1">
                                        <div class="flex items-center gap-4">
                                            @foreach($grade->category_breakdown as $type => $sessions)
                                                @if($sessions->count() > 0)
                                                    <div class="flex flex-col">
                                                        <span class="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">{{ $type }}</span>
                                                        <span class="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{{ $sessions->count() }}</span>
                                                    </div>
                                                @endif
                                            @endforeach
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <div class="flex items-center gap-3">
                                        <div class="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 w-16">
                                            <div class="h-1.5 rounded-full {{ ($grade->final_percentage >= 70) ? 'bg-emerald-500' : (($grade->final_percentage >= 45) ? 'bg-indigo-500' : 'bg-rose-500') }}" style="width: {{ $grade->final_percentage }}%"></div>
                                        </div>
                                        <span class="text-[10px] font-black text-zinc-900 dark:text-zinc-100 italic">{{ number_format($grade->final_percentage, 1) }}%</span>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    @php
                                        $gradeClass = match(strtoupper($grade->grade ?? '')) {
                                            'A' => 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
                                            'B' => 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
                                            'C' => 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
                                            'D' => 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800',
                                            'F' => 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-100 dark:border-rose-800',
                                            default => 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700'
                                        };
                                    @endphp
                                    <span class="px-4 py-1 rounded-lg text-[10px] font-black uppercase border {{ $gradeClass }} shadow-sm">
                                        {{ $grade->grade ?? 'N/A' }}
                                    </span>
                                </td>
                                <td class="px-6 py-5 text-right">
                                    <span class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ number_format($grade->points, 1) }} gp</span>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="py-24 text-center">
                    <div class="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-200 dark:text-zinc-700 mx-auto mb-6 border border-zinc-100 dark:border-zinc-800">
                        <i class="fas fa-graduation-cap text-3xl"></i>
                    </div>
                    <h3 class="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">No Transcript Available</h3>
                    <p class="text-xs text-zinc-400 mt-2">Your course results will appear here once published.</p>
                </div>
            @endif
        </div>
    </div>

    <!-- Custom Styles -->
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
        }
    </style>
</div>
