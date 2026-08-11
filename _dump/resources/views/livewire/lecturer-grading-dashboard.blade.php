<div class="p-6 lg:p-10 space-y-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <flux:heading size="xl" level="1">Grading Dashboard</flux:heading>
                <div class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm">AI Assisted</div>
            </div>
            <flux:subheading class="flex items-center gap-2">
                <span class="font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $session->exam->title }}</span>
                <span class="text-zinc-400">•</span>
                <span class="text-xs font-bold text-zinc-500 uppercase">{{ $session->student->name }}</span>
            </flux:subheading>
        </div>
        <div class="flex items-center gap-3">
             <div class="flex items-center gap-2 mr-4 border-r border-zinc-200 dark:border-zinc-800 pr-4">
                <flux:button wire:click="undo" icon="arrow-uturn-left" variant="ghost" size="sm" :disabled="empty($history)" tooltip="Undo (Ctrl+Z)" />
                <flux:button wire:click="redo" icon="arrow-uturn-right" variant="ghost" size="sm" :disabled="empty($redoStack)" tooltip="Redo (Ctrl+Y)" />
             </div>
             <div class="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800 shadow-sm">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Live Sync Active
             </div>
             <flux:button wire:click="downloadGradingReport" icon="arrow-down-tray" variant="ghost">Export Dataset</flux:button>
            <flux:button href="{{ route('lecturer.exam.grading', $session->exam) }}" icon="arrow-left" variant="ghost">Close Session</flux:button>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Graded Answers</div>
            <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $statistics['total_gradings'] ?? 0 }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-amber-500">
            <div class="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-widest">Pending Review</div>
            <div class="text-3xl font-bold text-amber-500 italic">{{ $statistics['pending_review'] ?? 0 }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-emerald-500">
            <div class="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/50 uppercase tracking-widest">Finalized</div>
            <div class="text-3xl font-bold text-emerald-500 italic">{{ $statistics['approved'] ?? 0 }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-zinc-900 dark:border-l-zinc-100">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cumulative GPA</div>
            <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic">{{ round($statistics['average_marks'] ?? 0, 1) }}</div>
        </div>
    </div>

    <!-- Filters & Batch Operations -->
    <div class="space-y-6">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <flux:input wire:model.live="searchTerm" icon="magnifying-glass" placeholder="Search prompts or responses..." label="Quick Search" />
                
                <flux:select wire:model.live="filterStatus" label="Verification Status">
                    <flux:select.option value="">Every Status</flux:select.option>
                    <flux:select.option value="pending_review">Needs Review</flux:select.option>
                    <flux:select.option value="approved">Approved</flux:select.option>
                    <flux:select.option value="revised">Revised</flux:select.option>
                </flux:select>

                <flux:select wire:model.live="filterConfidence" label="AI Confidence">
                    <flux:select.option value="">All Tiers</flux:select.option>
                    <flux:select.option value="low">Critical (< 50%)</flux:select.option>
                    <flux:select.option value="medium">Informational (50-75%)</flux:select.option>
                    <flux:select.option value="high">Reliable (75-90%)</flux:select.option>
                    <flux:select.option value="very_high">High Precision (≥ 90%)</flux:select.option>
                </flux:select>

                <flux:select wire:model.live="sortBy" label="Sort Logic">
                    <flux:select.option value="confidence_score">Confidence Priority</flux:select.option>
                    <flux:select.option value="marks_awarded">Score Weight</flux:select.option>
                    <flux:select.option value="created_at">Chronological</flux:select.option>
                </flux:select>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div class="flex items-center gap-2">
                    @if(!empty($batchSelectedIds))
                        <flux:button wire:click="batchApproveSelected" variant="primary" size="sm" icon="check-badge">Approve Selection ({{ count($batchSelectedIds) }})</flux:button>
                        <flux:button wire:click="clearSelection" variant="ghost" size="sm">Cancel All</flux:button>
                    @else
                        <flux:button wire:click="selectAll" variant="ghost" size="sm" icon="squares-plus">Select Page</flux:button>
                        @if($filterConfidence === 'very_high' && $statistics['pending_review'] > 0)
                            <flux:button wire:click="batchApprove" variant="primary" size="sm" icon="sparkles" class="bg-emerald-600 hover:bg-emerald-700">Auto-Approve Precision Hits</flux:button>
                        @endif
                    @endif
                </div>
                <div class="flex items-center gap-2">
                    <flux:button wire:click="toggleGradeDistribution" variant="ghost" size="sm" icon="chart-bar" class="{{ $showGradeDistribution ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : '' }}">Distribution Analysis</flux:button>
                    <flux:button wire:click="resetFilters" variant="ghost" size="sm" icon="arrow-path">Reset Workspace</flux:button>
                </div>
            </div>
        </div>

        <!-- Main Workspace: Split Pane -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative min-h-[600px]">
            <!-- Global Sidebar/Results Loading -->
            <div wire:loading.flex wire:target="filterStatus, filterConfidence, sortBy, selectGrading, batchApproveSelected" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
                <div class="flex flex-col items-center gap-4">
                    <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] font-mono">Synchronizing workspace...</p>
                </div>
            </div>

            <!-- Left Pane: Gradings Registry -->
            <div class="lg:col-span-7 xl:col-span-8 space-y-4">
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
                    @if($gradings->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th class="p-4 w-12 text-center">
                                            <flux:checkbox @if(!empty($batchSelectedIds) && count($batchSelectedIds) === $gradings->count()) checked @endif wire:change="$toggle('batchSelectAll')" />
                                        </th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer group" wire:click="setSortBy('confidence_score')">
                                            <div class="flex items-center gap-2">
                                                AI Confidence
                                                <i class="fas fa-sort-{{ $sortBy === 'confidence_score' ? ($sortDirection === 'asc' ? 'up' : 'down') : 'alt' }} opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                            </div>
                                        </th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Protocol</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer group" wire:click="setSortBy('marks_awarded')">
                                            <div class="flex items-center justify-center gap-2">
                                                Weight 
                                                <i class="fas fa-sort-{{ $sortBy === 'marks_awarded' ? ($sortDirection === 'asc' ? 'up' : 'down') : 'alt' }} opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                            </div>
                                        </th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Integrity</th>
                                        <th class="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    @foreach($gradings as $grading)
                                        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all cursor-pointer group {{ $selectedGrading && $selectedGrading->id === $grading->id ? 'bg-zinc-50 dark:bg-zinc-800/60 ring-1 ring-inset ring-indigo-500/30' : '' }} {{ in_array($grading->id, $batchSelectedIds) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : '' }}"
                                            wire:click="selectGrading({{ $grading->id }})">
                                            <td class="p-4 text-center" wire:click.stop>
                                                <flux:checkbox @if(in_array($grading->id, $batchSelectedIds)) checked @endif wire:click="toggleBatchSelect({{ $grading->id }})" />
                                            </td>
                                            <td class="p-4">
                                                <div class="flex flex-col gap-2 min-w-[140px]">
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ $grading->confidence_score }}%</span>
                                                        <span class="text-[9px] font-bold uppercase tracking-tighter text-zinc-400">{{ $this->getConfidenceRating($grading->confidence_score)['rating'] }}</span>
                                                    </div>
                                                    <div class="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                                        @php
                                                            $score = $grading->confidence_score;
                                                            $gradient = $score >= 90 ? 'from-emerald-500 to-teal-400' : ($score >= 75 ? 'from-indigo-500 to-indigo-400' : ($score >= 50 ? 'from-amber-500 to-orange-400' : 'from-rose-500 to-rose-400'));
                                                        @endphp
                                                        <div class="h-full bg-gradient-to-r {{ $gradient }} rounded-full transition-all duration-700" style="width: {{ $score }}%"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="p-4 text-center">
                                                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border {{ $grading->grading_method === 'auto_mcq' ? 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' }}">
                                                    {{ $grading->grading_method === 'auto_mcq' ? 'Determinant' : 'Heuristic' }}
                                                </span>
                                            </td>
                                            <td class="p-4 text-center">
                                                <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 italic">{{ round($grading->marks_awarded, 1) }}</span>
                                            </td>
                                            <td class="p-4 text-center">
                                                @php
                                                    $statusColors = [
                                                        'pending_review' => 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                                                        'approved' => 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                                                        'revised' => 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
                                                    ];
                                                    $currentStyle = $statusColors[$grading->status] ?? 'bg-zinc-100 text-zinc-500 border-zinc-200';
                                                @endphp
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border {{ $currentStyle }} shadow-sm">
                                                    {{ str_replace('_', ' ', $grading->status) }}
                                                </span>
                                            </td>
                                            <td class="p-4 text-right">
                                                <i class="fas fa-chevron-right text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all text-[10px]"></i>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="py-24 text-center space-y-4">
                            <i class="fas fa-circle-check text-4xl text-zinc-100 dark:text-zinc-800"></i>
                            <div>
                                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Workspace Cleared</h3>
                                <p class="text-xs text-zinc-500 mt-1">No gradings identified for the current filter criteria.</p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Right Pane: Detail & Verification -->
            <div class="lg:col-span-5 xl:col-span-4 sticky top-6">
                @if($selectedGrading)
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl animate-slideInRight relative overflow-hidden group/panel">
                        <div class="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] text-zinc-900 dark:text-white pointer-events-none group-hover/panel:scale-110 transition-transform">
                            <i class="fas fa-brain text-9xl"></i>
                        </div>

                        <div class="flex items-center justify-between mb-8">
                            <flux:heading size="lg">Verification Console</flux:heading>
                            <flux:button wire:click="selectGrading(null)" variant="ghost" size="xs" icon="x-mark" />
                        </div>

                        <!-- Data Points -->
                        <div class="space-y-8">
                            <div>
                                <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">AI Calculation Threshold</flux:label>
                                <div class="mt-2 flex items-end gap-3">
                                    <span class="text-4xl font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $selectedGrading->confidence_score }}%</span>
                                    <div class="mb-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm {{ $this->getConfidenceRating($selectedGrading->confidence_score)['color'] }}">
                                        {{ $this->getConfidenceRating($selectedGrading->confidence_score)['rating'] }}
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <flux:label class="text-[9px] font-bold text-zinc-500 uppercase">Assessment Marks</flux:label>
                                    <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 italic">{{ $selectedGrading->marks_awarded }}</div>
                                </div>
                                <div class="space-y-1">
                                    <flux:label class="text-[9px] font-bold text-zinc-500 uppercase">Grading Model</flux:label>
                                    <div class="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mt-2">
                                        @if($selectedGrading->grading_method === 'auto_mcq')
                                            <i class="fas fa-microchip text-zinc-400"></i> Determinative
                                        @else
                                            <i class="fas fa-dna text-indigo-500/50"></i> Neural Essay
                                        @endif
                                    </div>
                                </div>
                            </div>

                            @if($selectedGrading->examAnswer)
                                <div class="space-y-3">
                                    <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Student Input Content</flux:label>
                                    <div class="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed italic border border-zinc-100 dark:border-zinc-800 shadow-inner max-h-48 overflow-y-auto">
                                        "{!! nl2br(e($selectedGrading->examAnswer->student_answer)) !!}"
                                    </div>
                                </div>
                            @endif

                            @if($selectedGrading->reasoning)
                                <div class="space-y-3">
                                    <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Neural Rationale</flux:label>
                                    <div class="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 rounded-2xl text-[13px] text-zinc-600 dark:text-indigo-300/80 leading-relaxed">
                                        {{ $selectedGrading->reasoning }}
                                    </div>
                                </div>
                            @endif

                            <div class="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                @if($selectedGrading->status === 'pending_review')
                                    <flux:button wire:click="approveGrading" variant="primary" class="w-full h-11 shadow-lg shadow-indigo-500/20" icon="check-circle">Authorize Grade</flux:button>
                                    <div class="grid grid-cols-2 gap-2">
                                        <flux:button wire:click="openFeedbackModal" variant="ghost" icon="chat-bubble-left-right" class="text-xs">Feedback</flux:button>
                                        <flux:button wire:click="openOverrideModal" variant="ghost" icon="adjustments-horizontal" class="text-xs">Override</flux:button>
                                    </div>
                                    <flux:button wire:click="rejectGrading" variant="ghost" icon="trash" class="w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs">Invalidate Session</flux:button>
                                @else
                                    <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2">
                                        <i class="fas fa-lock text-zinc-300"></i>
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Entry Formalized & Locked</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                @else
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-3xl text-center space-y-4 shadow-sm h-[500px] flex flex-col items-center justify-center animate-fadeIn">
                        <div class="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-200 dark:text-zinc-700">
                            <i class="fas fa-fingerprint text-3xl"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest italic">Contextual Deadlock</h3>
                            <p class="text-[11px] text-zinc-500 mt-1 max-w-[200px] mx-auto">Select a candidate's submission from the registry to initiate verification.</p>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Modals Layer -->
    
    <!-- Distribution Modal -->
    <flux:modal wire:model="showGradeDistribution" class="md:w-96 p-0 overflow-hidden rounded-3xl">
        <div class="p-8 space-y-8">
            <div class="text-center">
                <flux:heading size="lg">Distribution Analysis</flux:heading>
                <flux:subheading>Statistical spread of assessment scores.</flux:subheading>
            </div>

            <div class="space-y-6">
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
                    <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Global Mean</div>
                    <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 italic">{{ round($this->getAverageGrade(), 1) }}</div>
                </div>

                <div class="space-y-3">
                    @php $distribution = $this->getGradeDistribution(); @endphp
                    @if(!empty($distribution))
                        @php $maxCount = max($distribution ?: [1]); @endphp
                        @foreach($distribution as $mark => $count)
                            <div class="flex items-center gap-3">
                                <span class="w-8 text-[11px] font-bold text-zinc-500 uppercase">{{ $mark }} Pt</span>
                                <div class="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative shadow-inner">
                                    <div class="h-full bg-indigo-500 rounded-lg transition-all duration-1000" style="width: {{ ($count / $maxCount) * 100 }}%"></div>
                                    <span class="absolute inset-0 flex items-center justify-end px-3 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{{ $count }} Hits</span>
                                </div>
                            </div>
                        @endforeach
                    @else
                        <p class="text-xs text-zinc-400 text-center italic">Insufficient data for spread analysis.</p>
                    @endif
                </div>
            </div>

            <flux:button wire:click="toggleGradeDistribution" variant="ghost" class="w-full">Close Report</flux:button>
        </div>
    </flux:modal>

    <!-- Feedback Modal -->
    <flux:modal wire:model="showFeedbackModal" class="md:w-[600px] p-0 overflow-hidden rounded-3xl">
        <div class="p-8 space-y-8">
            <div>
                <flux:heading size="lg">Transmit Candidate Feedback</flux:heading>
                <flux:subheading>Provide pedagogical insights for improvement.</flux:subheading>
            </div>

            <div class="space-y-6">
                <flux:textarea wire:model="gradingFeedback" label="Critical Commentary" placeholder="Compose constructive feedback strings..." rows="6" />
                
                <div class="space-y-3">
                    <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Synthesis Macros</flux:label>
                    <div class="grid grid-cols-1 gap-2">
                        @foreach([
                            'Concise Core' => 'Focus on brevity and core categorical definitions.',
                            'Structural Excellence' => 'Excellent structural mapping and logical flow.',
                            'Conceptual Gap' => 'Rethink the application of Topic X in this context.'
                        ] as $title => $msg)
                            <button type="button" wire:click="$set('gradingFeedback', '{{ $msg }}')" class="w-full text-left p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700">
                                <span class="font-bold underline decoration-zinc-300 dark:decoration-zinc-600 mr-2">{{ $title }}:</span> {{ $msg }}
                            </button>
                        @endforeach
                    </div>
                </div>
            </div>

            <div class="flex gap-3 pt-4 justify-end">
                <flux:button wire:click="$set('showFeedbackModal', false)" variant="ghost">Discard</flux:button>
                <flux:button wire:click="saveFeedback" variant="primary" icon="paper-airplane">Transmit Registry</flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Override Modal -->
    <flux:modal wire:model="showOverrideModal" class="md:w-96 p-0 overflow-hidden rounded-3xl">
        <div class="p-8 space-y-8">
            <div class="text-center">
                <div class="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mx-auto mb-4 flex items-center justify-center border border-amber-100 dark:border-amber-800">
                    <i class="fas fa-bolt"></i>
                </div>
                <flux:heading size="lg">Manual Override</flux:heading>
                <flux:subheading>Supersede AI calculation with human logic.</flux:subheading>
            </div>

            <div class="space-y-6">
                <flux:input type="number" step="0.5" wire:model="overrideMarks" label="New Mark Value" placeholder="e.g. 5.0" />
                <flux:textarea wire:model="overrideReason" label="Override Rationale *" placeholder="Explain why the local calculation was revised..." rows="4" />
            </div>

            <div class="flex gap-3 pt-4">
                <flux:button class="flex-1" wire:click="$set('showOverrideModal', false)" variant="ghost">Abort</flux:button>
                <flux:button class="flex-1" wire:click="submitOverride" variant="primary">Authorize Revision</flux:button>
            </div>
        </div>
    </flux:modal>

</div>
