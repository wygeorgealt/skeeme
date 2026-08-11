<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    Plagiarism Detection
                </h1>
                <p class="text-slate-400">{{ $this->exam->title }}</p>
            </div>
            <div class="flex gap-2">
                <button 
                    wire:click="runCheck"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                    <span class="inline-block mr-2">🔍</span> Run Checks
                </button>
                <button 
                    wire:click="$toggle('showSettings')"
                    class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                    <span class="inline-block mr-2">⚙️</span> Settings
                </button>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    @if (!empty($examReport))
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <!-- Total Checks -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm font-medium">Total Checks</p>
                        <p class="text-3xl font-bold text-white mt-2">{{ $examReport['total_checks'] ?? 0 }}</p>
                    </div>
                    <div class="text-4xl opacity-20">📊</div>
                </div>
            </div>

            <!-- Flagged Count -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm font-medium">Flagged</p>
                        <p class="text-3xl font-bold text-red-400 mt-2">{{ $examReport['flagged_count'] ?? 0 }}</p>
                        <p class="text-xs text-slate-500 mt-1">
                            {{ number_format($examReport['flagged_percentage'] ?? 0, 1) }}%
                        </p>
                    </div>
                    <div class="text-4xl opacity-20">🚨</div>
                </div>
            </div>

            <!-- Average Score -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm font-medium">Average Score</p>
                        <p class="text-3xl font-bold text-white mt-2">
                            {{ number_format(($examReport['average_score'] ?? 0) * 100, 0) }}%
                        </p>
                    </div>
                    <div class="text-4xl opacity-20">📈</div>
                </div>
            </div>

            <!-- Highest Score -->
            <div class="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-400 text-sm font-medium">Highest Score</p>
                        <p class="text-3xl font-bold text-red-400 mt-2">
                            {{ number_format(($examReport['highest_score'] ?? 0) * 100, 0) }}%
                        </p>
                    </div>
                    <div class="text-4xl opacity-20">⚠️</div>
                </div>
            </div>
        </div>
    @endif

    <!-- Severity Distribution -->
    @if (!empty($examReport['by_severity']))
        <div class="max-w-7xl mx-auto mb-8">
            <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6">
                <h3 class="text-lg font-bold text-white mb-4">Severity Distribution</h3>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="bg-red-600/20 rounded-lg p-4 border-l-4 border-l-red-600">
                        <p class="text-red-400 font-bold">{{ $examReport['by_severity']['critical'] ?? 0 }}</p>
                        <p class="text-sm text-red-300">Critical (80%+)</p>
                    </div>
                    <div class="bg-orange-600/20 rounded-lg p-4 border-l-4 border-l-orange-600">
                        <p class="text-orange-400 font-bold">{{ $examReport['by_severity']['high'] ?? 0 }}</p>
                        <p class="text-sm text-orange-300">High (60-79%)</p>
                    </div>
                    <div class="bg-yellow-600/20 rounded-lg p-4 border-l-4 border-l-yellow-600">
                        <p class="text-yellow-400 font-bold">{{ $examReport['by_severity']['medium'] ?? 0 }}</p>
                        <p class="text-sm text-yellow-300">Medium (40-59%)</p>
                    </div>
                    <div class="bg-blue-600/20 rounded-lg p-4 border-l-4 border-l-blue-600">
                        <p class="text-blue-400 font-bold">{{ $examReport['by_severity']['low'] ?? 0 }}</p>
                        <p class="text-sm text-blue-300">Low (20-39%)</p>
                    </div>
                    <div class="bg-green-600/20 rounded-lg p-4 border-l-4 border-l-green-600">
                        <p class="text-green-400 font-bold">{{ $examReport['by_severity']['minimal'] ?? 0 }}</p>
                        <p class="text-sm text-green-300">Minimal (<20%)</p>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Main Content Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Panel: Checks List -->
        <div class="lg:col-span-1">
            <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 overflow-hidden">
                <!-- Controls -->
                <div class="p-4 border-b border-slate-600 space-y-3">
                    <!-- Status Filter -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Filter</label>
                        <div class="space-y-2">
                            <button 
                                wire:click="toggleFilter('all')"
                                class="w-full px-3 py-2 rounded text-sm transition text-left
                                    @if ($filterStatus === 'all')
                                        bg-indigo-600 text-white
                                    @else
                                        bg-slate-600/20 text-slate-300 hover:bg-slate-600/30
                                    @endif
                                "
                            >
                                All Checks ({{ count($filteredChecks) }})
                            </button>
                            <button 
                                wire:click="toggleFilter('flagged')"
                                class="w-full px-3 py-2 rounded text-sm transition text-left
                                    @if ($filterStatus === 'flagged')
                                        bg-red-600 text-white
                                    @else
                                        bg-slate-600/20 text-slate-300 hover:bg-slate-600/30
                                    @endif
                                "
                            >
                                Flagged ({{ $examReport['flagged_count'] ?? 0 }})
                            </button>
                            <button 
                                wire:click="toggleFilter('clean')"
                                class="w-full px-3 py-2 rounded text-sm transition text-left
                                    @if ($filterStatus === 'clean')
                                        bg-green-600 text-white
                                    @else
                                        bg-slate-600/20 text-slate-300 hover:bg-slate-600/30
                                    @endif
                                "
                            >
                                Clean
                            </button>
                        </div>
                    </div>

                    <!-- Sort -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                        <select 
                            wire:model.live="sortBy"
                            class="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 text-sm"
                        >
                            <option value="score_desc">Highest Score</option>
                            <option value="score_asc">Lowest Score</option>
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                        </select>
                    </div>
                </div>

                <!-- Checks List -->
                <div class="overflow-y-auto max-h-96">
                    @if (empty($filteredChecks))
                        <div class="p-4 text-center text-slate-400 text-sm">
                            <p>No plagiarism checks available.</p>
                            <p class="text-xs mt-2">Run checks to analyze answers.</p>
                        </div>
                    @else
                        @foreach ($filteredChecks as $check)
                            <button 
                                wire:click="selectCheck('{{ $check['id'] }}')"
                                class="w-full text-left px-4 py-3 border-b border-slate-600 transition
                                    @if ($selectedCheckId === (string) $check['id'])
                                        bg-indigo-600/20 border-l-4 border-l-indigo-500
                                    @else
                                        hover:bg-slate-600/20
                                    @endif
                                "
                            >
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <span class="text-lg">
                                                {{ $this->getSeverityIcon($check['severity']) }}
                                            </span>
                                            <p class="text-sm font-medium text-slate-100 truncate">
                                                Q{{ $check['question_id'] }}
                                            </p>
                                        </div>
                                        <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {{ $check['session'] }}
                                        </p>
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        <p class="text-sm font-bold text-white">
                                            {{ number_format($check['plagiarism_score'] * 100, 0) }}%
                                        </p>
                                        @if ($check['flagged_at'])
                                            <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-red-600 text-white">
                                                Flagged
                                            </span>
                                        @endif
                                    </div>
                                </div>
                            </button>
                        @endforeach
                    @endif
                </div>
            </div>
        </div>

        <!-- Right Panel: Detailed Analysis -->
        <div class="lg:col-span-2">
            @if ($selectedCheck)
                <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-6 space-y-6">
                    <!-- Question and Status -->
                    <div>
                        <div class="flex items-start justify-between gap-4 mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-bold text-white mb-2">Question</h3>
                                <p class="text-slate-300 text-sm">
                                    {{ $selectedCheck['question_text'] }}
                                </p>
                            </div>
                            <div class="text-right">
                                <span class="inline-block px-3 py-1 rounded {{ $this->getSeverityColor($selectedCheck['severity']) }} font-bold">
                                    {{ $selectedCheck['severity_label'] }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Plagiarism Score -->
                    <div class="bg-slate-600/20 rounded-lg p-4 border border-slate-600">
                        <p class="text-sm font-bold text-slate-300 mb-3">Plagiarism Score</p>
                        <div class="flex items-center gap-4">
                            <div class="flex-1">
                                <div class="relative h-3 bg-slate-600/30 rounded-full overflow-hidden">
                                    <div 
                                        class="h-full transition-all duration-300"
                                        style="width: {{ $selectedCheck['plagiarism_score'] * 100 }}%;
                                                background: @if ($selectedCheck['plagiarism_score'] >= 0.8) rgb(239, 68, 68) @elseif ($selectedCheck['plagiarism_score'] >= 0.6) rgb(249, 115, 22) @elseif ($selectedCheck['plagiarism_score'] >= 0.4) rgb(234, 179, 8) @else rgb(59, 130, 246) @endif"
                                    ></div>
                                </div>
                            </div>
                            <div class="text-right min-w-fit">
                                <p class="text-2xl font-bold text-white">
                                    {{ number_format($selectedCheck['plagiarism_score'] * 100, 1) }}%
                                </p>
                            </div>
                        </div>
                        @if ($selectedCheck['checked_at'])
                            <p class="text-xs text-slate-500 mt-2">
                                Checked: {{ $selectedCheck['checked_at'] }}
                            </p>
                        @endif
                    </div>

                    <!-- Student Answer -->
                    <div>
                        <h4 class="text-sm font-bold text-white mb-2">Student Answer</h4>
                        <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-600 max-h-48 overflow-y-auto">
                            <p class="text-slate-300 text-sm whitespace-pre-wrap">
                                {{ $selectedCheck['student_answer'] }}
                            </p>
                        </div>
                    </div>

                    <!-- Status and Actions -->
                    <div class="flex gap-2">
                        @if ($selectedCheck['flagged_at'])
                            <div class="flex-1 bg-red-600/20 border-l-4 border-l-red-600 rounded-lg p-4">
                                <p class="text-red-300 text-sm font-bold">⚠️ Flagged for Plagiarism</p>
                                <p class="text-red-400 text-xs mt-1">
                                    Flagged at: {{ $selectedCheck['flagged_at'] }}
                                </p>
                            </div>
                        @else
                            <div class="flex-1 bg-green-600/20 border-l-4 border-l-green-600 rounded-lg p-4">
                                <p class="text-green-300 text-sm font-bold">✓ Passed Plagiarism Check</p>
                            </div>
                        @endif
                    </div>
                </div>
            @else
                <div class="bg-slate-700/30 backdrop-blur rounded-lg border border-slate-600 p-12 flex items-center justify-center min-h-96">
                    <div class="text-center">
                        <p class="text-slate-400 text-lg">Select a check to view details</p>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <!-- Settings Modal -->
    @if ($showSettings)
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-slate-800 rounded-lg border border-slate-600 p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                <h3 class="text-xl font-bold text-white mb-6">Plagiarism Settings</h3>
                
                <div class="space-y-6">
                    <!-- Enable/Disable -->
                    <div class="flex items-center justify-between">
                        <label class="text-slate-300 font-medium">Enable Plagiarism Checks</label>
                        <label class="flex items-center">
                            <input 
                                type="checkbox" 
                                wire:model="plagiarism_check_enabled"
                                class="w-4 h-4 rounded"
                            >
                            <span class="ml-2 text-slate-400 text-sm">{{ $plagiarism_check_enabled ? 'Enabled' : 'Disabled' }}</span>
                        </label>
                    </div>

                    <!-- Threshold -->
                    <div>
                        <label class="block text-slate-300 font-medium mb-2">
                            Plagiarism Threshold: {{ number_format($plagiarism_threshold * 100, 0) }}%
                        </label>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="1" 
                            step="0.05"
                            wire:model.live="plagiarism_threshold"
                            class="w-full"
                        >
                        <p class="text-xs text-slate-500 mt-2">
                            Answers with similarity above this threshold will be flagged
                        </p>
                    </div>

                    <!-- Check Mode -->
                    <div>
                        <label class="block text-slate-300 font-medium mb-2">Check Mode</label>
                        <select wire:model="check_mode" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100">
                            <option value="real_time">Real-time (During Grading)</option>
                            <option value="automatic">Automatic (Background Job)</option>
                            <option value="manual">Manual (On Demand)</option>
                        </select>
                    </div>

                    <!-- Penalty Type -->
                    <div>
                        <label class="block text-slate-300 font-medium mb-2">Penalty for Flagged</label>
                        <select wire:model="penalty_for_flagged" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100">
                            <option value="none">No Penalty</option>
                            <option value="warning">Warning Only</option>
                            <option value="mark_deduction">Mark Deduction</option>
                            <option value="fail">Fail Question</option>
                            <option value="investigation">Flag for Investigation</option>
                        </select>
                    </div>

                    <!-- Penalty Marks -->
                    @if ($penalty_for_flagged === 'mark_deduction')
                        <div>
                            <label class="block text-slate-300 font-medium mb-2">Marks to Deduct</label>
                            <input 
                                type="number" 
                                wire:model="penalty_marks"
                                min="0"
                                max="100"
                                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100"
                            >
                        </div>
                    @endif

                    <!-- Service Selection -->
                    <div>
                        <label class="block text-slate-300 font-medium mb-2">Detection Service</label>
                        <select wire:model="plagiarism_service" class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100">
                            <option value="internal">Internal (Similarity Matching)</option>
                            <option value="turnitin">Turnitin</option>
                            <option value="copyscape">Copyscape</option>
                        </select>
                        <p class="text-xs text-slate-500 mt-2">
                            Internal service provides basic similarity matching. External services require API configuration.
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 mt-6 pt-6 border-t border-slate-600">
                    <button 
                        wire:click="saveSettings"
                        class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                        Save Settings
                    </button>
                    <button 
                        wire:click="$toggle('showSettings')"
                        class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    @endif

    <style>
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.5);
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.8);
        }
    </style>
</div>
