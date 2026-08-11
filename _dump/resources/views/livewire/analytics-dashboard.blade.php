@section('title', 'Analytics - ' . ($exam->title ?? $exam->name))

<div class="p-8 animate-fadeIn">
    <div class="max-w-7xl mx-auto">
        <!-- Premium Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <div class="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">Exam Insights</span>
                    </div>
                    <div class="h-1 w-1 rounded-full bg-zinc-700"></div>
                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ $exam->status ?? 'Active' }} Exam</span>
                </div>
                <flux:heading size="xl" level="1">{{ $exam->title ?? $exam->name }}</flux:heading>
                <flux:subheading>Comprehensive performance diagnostics and AI-driven insights</flux:subheading>
            </div>
            
                
                <flux:dropdown>
                    <flux:button variant="ghost" size="sm" icon-trailing="chevron-down">Export</flux:button>
                    <flux:menu>
                        <flux:menu.item wire:click="downloadReport" icon="arrow-down-tray">Download CSV Report</flux:menu.item>
                        <flux:menu.item wire:click="downloadPdfReport" icon="printer">Print Summary</flux:menu.item>
                    </flux:menu>
                </flux:dropdown>

                <flux:button href="{{ route('lecturer.exams') }}" variant="ghost" size="sm">
                    Back to Exams
                </flux:button>
            </div>
        </div>

        <!-- AI Advisor Dashboard -->
        @if($insights)
            <div class="mb-12">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <flux:icon.sparkles variant="solid" />
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">AI Advisor</h3>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI-powered help & suggestions</p>
                        </div>
                    </div>
                    
                    <flux:button 
                        wire:click="$toggle('showInsightsPanel')"
                        variant="ghost" 
                        size="xs"
                        class="!text-[10px] !font-black !uppercase !tracking-widest"
                    >
                        {{ $showInsightsPanel ? 'Minimize Advisor' : 'Expand Advisor' }}
                    </flux:button>
                </div>

                @if($showInsightsPanel)
                    <!-- Key Findings Cards -->
                    @if(!empty($insights['key_findings']))
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
                            @foreach($insights['key_findings'] as $finding)
                                @php
                                    $severityColor = match($finding['severity'] ?? 'info') {
                                        'critical' => 'rose',
                                        'warning' => 'amber',
                                        'success' => 'emerald',
                                        default => 'indigo',
                                    };
                                @endphp
                                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:border-{{ $severityColor }}-500/50 transition-all duration-300">
                                    <div class="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full bg-{{ $severityColor }}-500 shadow-[0_0_8px_rgba(var(--{{ $severityColor }}-500),0.5)]"></div>
                                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500">{{ $finding['severity'] ?? 'Insight' }}</span>
                                        </div>
                                        <i class="fas {{ $finding['icon'] ?? 'fa-info-circle' }} text-xs text-zinc-300 dark:text-zinc-600 group-hover:text-{{ $severityColor }}-500 transition-colors"></i>
                                    </div>
                                    <div class="p-6">
                                        <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{{ $finding['title'] }}</h4>
                                        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{{ $finding['description'] }}</p>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    <!-- Premium At-Risk Students -->
                    @if(!empty($insights['at_risk_students']))
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Students Who Need Help</h3>
                                <div class="flex items-center gap-2">
                                    <span class="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ count($insights['at_risk_students']) }} Students Flagged</span>
                                </div>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="bg-zinc-50/50 dark:bg-zinc-800/30">
                                            <th class="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Student Profile</th>
                                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Performance</th>
                                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Risk Severity</th>
                                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Activity Metrics</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        @foreach($insights['at_risk_students'] as $student)
                                            <tr class="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors group">
                                                <td class="px-8 py-5">
                                                    <div class="flex items-center gap-4">
                                                        <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                            <i class="fas fa-user-graduate text-xs"></i>
                                                        </div>
                                                        <div>
                                                            <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $student['student_name'] }}</p>
                                                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Student ID: {{ substr($student['student_id'] ?? 'N/A', 0, 8) }}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <div class="flex items-center gap-3">
                                                        <span class="text-sm font-black text-rose-600 dark:text-rose-400">{{ $student['percentage'] }}%</span>
                                                        <div class="w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                                                            <div class="bg-rose-500 h-1.5 rounded-full" style="width: {{ $student['percentage'] }}%"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border {{ @$student['risk_level'] === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' }}">
                                                        {{ strtoupper($student['risk_level'] ?? 'HIGH') }}
                                                    </span>
                                                </td>
                                                <td class="px-6 py-5">
                                                    <div class="flex flex-col gap-1">
                                                        <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                            <flux:icon.clock variant="micro" />
                                                            {{ round($student['time_spent'], 1) }}m active
                                                        </div>
                                                        <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                            <flux:icon.document-text variant="micro" />
                                                            {{ $student['questions_attempted'] }}/{{ $student['total_questions'] }} attempted
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @endif

                    <!-- Learning Segments -->
                    @if(!empty($insights['learning_groups']))
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Student Performance Groups</h3>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    @foreach(['advanced' => 'emerald', 'proficient' => 'indigo', 'developing' => 'amber', 'beginning' => 'rose'] as $segmentName => $color)
                                        @if(isset($insights['learning_groups'][$segmentName]))
                                            @php $segment = $insights['learning_groups'][$segmentName]; @endphp
                                            <div class="relative group">
                                                <div class="absolute -inset-0.5 bg-{{ $color }}-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                                                <div class="relative p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
                                                    <div class="flex items-center justify-between mb-4">
                                                        <span class="text-[10px] font-black uppercase tracking-widest text-{{ $color }}-600 dark:text-{{ $color }}-400">{{ $segmentName }}</span>
                                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-500">
                                                            {{ round($segment['percentage'], 1) }}%
                                                        </span>
                                                    </div>
                                                    <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">{{ $segment['count'] }}</div>
                                                    <p class="text-[10px] text-zinc-500 leading-relaxed italic border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-3">
                                                        {{ $segment['suggestion'] }}
                                                    </p>
                                                </div>
                                            </div>
                                        @endif
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @endif


                    <!-- Anomalies -->
                    @if(!empty($insights['performance_anomalies']))
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Unusual Results</h3>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    @foreach($insights['performance_anomalies'] as $anomaly)
                                        <div class="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800">
                                            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <flux:icon.bolt variant="micro" />
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{{ str_replace('_', ' ', $anomaly['type']) }}</p>
                                                <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $anomaly['title'] }}</h4>
                                                <p class="text-[10px] text-zinc-500 mt-1">{{ $anomaly['description'] }}</p>
                                            </div>
                                            @if(isset($anomaly['correct_rate']) || isset($anomaly['value']))
                                                <div class="text-right">
                                                    <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ $anomaly['correct_rate'] ?? $anomaly['value'] }}{{ isset($anomaly['correct_rate']) ? '%' : '' }}</span>
                                                </div>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @endif

                    <!-- Improvement Areas -->
                    @if(!empty($insights['improvement_areas']))
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Recommended Actions</h3>
                            </div>
                            <div class="p-8">
                                <div class="space-y-6">
                                    @foreach($insights['improvement_areas'] as $improvement)
                                        <div class="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/5">
                                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div class="flex items-center gap-3">
                                                    @if(isset($improvement['question_id']))
                                                        <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0">
                                                            <span class="text-[10px] font-black">Q</span>
                                                        </div>
                                                    @endif
                                                        <div class="flex items-center gap-2">
                                                            <span class="text-sm font-black text-zinc-900 dark:text-zinc-100 block">{{ $improvement['area'] }}</span>
                                                            @if($improvement['is_ai_reasoned'] ?? false)
                                                                <span class="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-500 uppercase tracking-tight flex items-center gap-1">
                                                                    <flux:icon.sparkles variant="micro" class="size-2.5" />
                                                                    Deep Reasoning
                                                                </span>
                                                            @endif
                                                        </div>
                                                        @if(isset($improvement['question_id']))
                                                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Question #{{ substr($improvement['question_id'], 0, 8) }}</span>
                                                        @endif
                                                </div>
                                                <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase {{ $improvement['priority'] === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700' }} w-fit">
                                                    {{ $improvement['priority'] }} Priority
                                                </span>
                                            </div>

                                            @if(isset($improvement['question_text']))
                                                <div class="mb-4 p-4 bg-zinc-100/30 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                                    <p class="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Problem Question Context</p>
                                                    <p class="text-xs text-zinc-600 dark:text-zinc-400 italic">"{{ $improvement['question_text'] }}"</p>
                                                </div>
                                            @endif

                                            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium">{{ $improvement['description'] }}</p>
                                            
                                            <div class="space-y-3">
                                                <p class="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Pedagogical Analysis & Advice</p>
                                                <div class="grid grid-cols-1 gap-3">
                                                    @foreach($improvement['suggestions'] as $suggestion)
                                                        <div class="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 shadow-sm group hover:border-indigo-500/30 transition-colors">
                                                            <div class="w-2 h-2 rounded-full bg-indigo-500/20 flex items-center justify-center mt-1 shrink-0">
                                                                <div class="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                            </div>
                                                            <span class="leading-relaxed">{{ $suggestion }}</span>
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @endif

                    <!-- Comparative Analysis -->
                    @if($comparison && $comparison['status'] === 'success')
                        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                            <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">How this Exam Compares</h3>
                                <div class="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-[8px] font-black text-indigo-600 uppercase border border-indigo-100 dark:border-indigo-800">vs Previous Exam</div>
                            </div>
                            <div class="p-8">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    @php
                                        $avg = $comparison['comparison']['average_score'];
                                        $pass = $comparison['comparison']['pass_rate'];
                                        $std = $comparison['comparison']['std_deviation'];
                                    @endphp
                                    
                                    <!-- Avg Score Compare -->
                                    <div class="flex flex-col gap-4">
                                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Average Performance</p>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100">{{ $avg['current'] }}</div>
                                            <div class="flex items-center gap-1 {{ $avg['change'] >= 0 ? 'text-emerald-500' : 'text-rose-500' }}">
                                                <flux:icon.arrow-trending-up variant="micro" class="{{ $avg['change'] < 0 ? 'rotate-180' : '' }}" />
                                                <span class="text-xs font-bold">{{ abs(round($avg['change_percent'], 1)) }}%</span>
                                            </div>
                                        </div>
                                        <div class="text-[10px] text-zinc-400">Baseline was <span class="font-bold text-zinc-500">{{ $avg['previous'] }}</span></div>
                                    </div>

                                    <!-- Pass Rate Compare -->
                                    <div class="flex flex-col gap-4">
                                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Success Rate</p>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100">{{ $pass['current'] }}%</div>
                                            <div class="flex items-center gap-1 {{ $pass['change'] >= 0 ? 'text-emerald-500' : 'text-rose-500' }}">
                                                <flux:icon.arrow-trending-up variant="micro" class="{{ $pass['change'] < 0 ? 'rotate-180' : '' }}" />
                                                <span class="text-xs font-bold">{{ abs(round($pass['change'], 1)) }}%</span>
                                            </div>
                                        </div>
                                        <div class="text-[10px] text-zinc-400">Baseline was <span class="font-bold text-zinc-500">{{ $pass['previous'] }}%</span></div>
                                    </div>

                                    <!-- Std Dev Compare -->
                                    <div class="flex flex-col gap-4">
                                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Distribution Stability</p>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-black text-zinc-900 dark:text-zinc-100">{{ $std['current'] }}</div>
                                            <div class="flex items-center gap-1 {{ $std['trend'] === 'decreased' ? 'text-emerald-500' : 'text-amber-500' }}">
                                                <flux:icon.arrows-right-left variant="micro" />
                                                <span class="text-xs font-bold uppercase">{{ $std['trend'] }}</span>
                                            </div>
                                        </div>
                                        <div class="text-[10px] text-zinc-400">Baseline was <span class="font-bold text-zinc-500">{{ $std['previous'] }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif
                @endif
            </div>
        @endif

        <!-- Period & Date Selection -->
        <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 mb-8 animate-fadeIn">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
                    @foreach(['week' => 'Week', 'month' => 'Month', 'quarter' => 'Quarter', 'year' => 'Year'] as $period => $label)
                        <button 
                            wire:click="changePeriod('{{ $period }}')"
                            class="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all {{ $selectedPeriod === $period ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300' }}"
                        >
                            {{ $label }}
                        </button>
                    @endforeach
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <div class="flex items-center gap-2">
                        <flux:input type="date" wire:model="startDate" size="sm" class="!w-36" />
                        <span class="text-zinc-400 text-xs font-bold">to</span>
                        <flux:input type="date" wire:model="endDate" size="sm" class="!w-36" />
                    </div>
                    <flux:button wire:click="updateDateRange" variant="primary" size="sm" class="!bg-zinc-900 dark:!bg-white dark:!text-zinc-900">
                        Apply Filter
                    </flux:button>
                </div>
            </div>
        </div>

        <!-- Premium Key Metrics -->
        @if($currentSnapshot)
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
                <!-- Average Score Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <flux:icon.chart-bar />
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Average Score</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->average_score }}</span>
                                <span class="text-xs font-bold text-zinc-400">/ {{ $exam->total_marks ?? 100 }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pass Rate Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <flux:icon.check-badge />
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pass Rate</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->pass_rate }}%</span>
                                <span class="text-xs font-bold text-zinc-400">Target: {{ $exam->passing_marks ?? 40 }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Confidence Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <flux:icon.sparkles />
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">AI Trust Index</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->average_confidence }}%</span>
                                <span class="text-xs font-bold text-zinc-400">Reliability</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Consistency Card -->
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div class="relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <flux:icon.scale />
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Score Spread</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->std_deviation }}</span>
                                <span class="text-xs font-bold text-zinc-400">Points Gap</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Performance & Grading Details -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fadeIn">
                <!-- Performance Statistics -->
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Performance Summary</h3>
                    </div>
                    <div class="p-8 flex-1 grid grid-cols-2 gap-8">
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Completed Exams</p>
                            <p class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->students_submitted }}<span class="text-sm text-zinc-400 font-bold ml-1">/ {{ $currentSnapshot->total_students }}</span></p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Median Benchmark</p>
                            <p class="text-2xl font-black text-indigo-500">{{ $currentSnapshot->median_score }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Highest Attained</p>
                            <p class="text-2xl font-black text-emerald-500">{{ $currentSnapshot->max_score }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lowest Attained</p>
                            <p class="text-2xl font-black text-rose-500">{{ $currentSnapshot->min_score ?? '0.0' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Grading Pipeline -->
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Grading Status</h3>
                    </div>
                    <div class="p-8 space-y-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Algorithmic (MCQ)</span>
                            </div>
                            <span class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->questions_auto_graded }} units</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Neural Grading (AI)</span>
                            </div>
                            <span class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->questions_ai_graded }} units</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Finalized & Approved</span>
                            </div>
                            <span class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ $currentSnapshot->grades_approved }} units</span>
                        </div>
                        <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Action Required</span>
                            <span class="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                {{ $currentSnapshot->grades_pending_review }} Pending Review
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Engagement Metrics -->
            <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                    <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Student Activity</h3>
                </div>
                <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 text-center group">
                                {{ round($currentSnapshot->average_time_spent / 60, 1) }} <span class="text-xs font-bold text-zinc-400">min</span>
                            </p>
                            <p class="text-[10px] text-zinc-500 mt-2">Average Time Taken</p>
                        </div>
                        <div class="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 text-center group">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Early Submissions</p>
                            <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">{{ $currentSnapshot->early_submissions }}</p>
                            <p class="text-[10px] text-zinc-500 mt-2">Submitted before 80% time</p>
                        </div>
                        <div class="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 text-center group">
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Last-minute Submissions</p>
                            <p class="text-3xl font-black text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-500">{{ $currentSnapshot->last_minute_submissions }}</p>
                            <p class="text-[10px] text-zinc-500 mt-2">Submitted in final 5%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Question Analysis -->
            @if($currentSnapshot->question_performance)
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Question Success Analysis</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-zinc-50/50 dark:bg-zinc-800/30">
                                    <th class="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Question</th>
                                    <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                @foreach($currentSnapshot->question_performance as $qId => $perf)
                                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td class="px-8 py-5">
                                            <div class="flex items-start gap-4">
                                                <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                                    <span class="text-[10px] font-black text-zinc-500">{{ $perf['number'] ?? ($loop->iteration) }}</span>
                                                </div>
                                                <div class="flex flex-col gap-1">
                                                    @php
                                                        $qText = $perf['text'] ?? null;
                                                        if (!$qText) {
                                                            $q = \App\Models\Question::find($qId);
                                                            $qText = $q ? $q->question_text : 'Unknown Question';
                                                        }
                                                    @endphp
                                                    <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">{{ $qText }}</span>
                                                    <span class="text-[9px] text-zinc-400 font-medium uppercase tracking-tighter">{{ $perf['type'] ?? '' }} • {{ $perf['bloom_level'] ?? '' }}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-5">
                                            <div class="flex items-center gap-3">
                                                <span class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ round($perf['correct'] / $perf['total'] * 100) }}%</span>
                                                <div class="w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                    @php $rate = ($perf['correct'] / $perf['total'] * 100); @endphp
                                                    <div class="h-1.5 rounded-full {{ $rate >= 70 ? 'bg-emerald-500' : ($rate >= 40 ? 'bg-indigo-500' : 'bg-rose-500') }}" style="width: {{ $rate }}%"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif

            <!-- Premium Historical Trends -->
            @if($historicalSnapshots->count() > 0)
                <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8 animate-fadeIn">
                    <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Performance Over Time</h3>
                    </div>
                    <div class="p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <!-- Scores Trend -->
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Average Score History</p>
                                    <span class="text-[10px] font-black text-indigo-500 uppercase">Avg Score</span>
                                </div>
                                <div class="flex items-end h-40 gap-2 px-2">
                                    @php $maxScore = max($trends['scores']) ?: 1; @endphp
                                    @foreach($trends['scores'] as $score)
                                        <div class="flex-1 group relative">
                                            <div class="absolute -inset-1 bg-indigo-500/20 rounded-t-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                            <div class="relative bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-700 ease-out" 
                                                style="height: {{ ($score / $maxScore) * 100 }}%">
                                                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-xl border border-zinc-800 pointer-events-none">
                                                    {{ $score }}
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                                <div class="flex justify-between px-1">
                                    @foreach($trends['dates'] as $date)
                                        <span class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">{{ $date }}</span>
                                    @endforeach
                                </div>
                            </div>

                            <!-- Pass Rate Trend -->
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pass Rate History</p>
                                    <span class="text-[10px] font-black text-emerald-500 uppercase">Pass Rate</span>
                                </div>
                                <div class="flex items-end h-40 gap-2 px-2">
                                    @foreach($trends['passRates'] as $rate)
                                        <div class="flex-1 group relative">
                                            <div class="absolute -inset-1 bg-emerald-500/20 rounded-t-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                            <div class="relative bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-700 ease-out" 
                                                style="height: {{ $rate ?: 0 }}%">
                                                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-xl border border-zinc-800 pointer-events-none">
                                                    {{ $rate }}%
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                                <div class="flex justify-between px-1">
                                    @foreach($trends['dates'] as $date)
                                        <span class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">{{ $date }}</span>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        @else
            <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-20 text-center animate-fadeIn">
                <div class="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800/10 flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
                    <flux:icon.chart-pie variant="solid" />
                </div>
                <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">No Intelligence Data Available</h3>
                <p class="text-sm text-zinc-500 max-w-xs mx-auto">Complete the exam and finalize grading to generate comprehensive AI-driven performance analytics.</p>
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
    document.addEventListener('refreshAnalytics', () => {
        console.log('Analytics refreshed');
    });
</script>
@endpush
