<div class="p-6 lg:p-10">
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Data and Storage</h1>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Search and retrieve historical exam configurations and student performance data.</p>
        </div>

        <div class="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit shadow-inner">
            <button 
                wire:click="setViewMode('exams')"
                class="px-8 py-2.5 text-xs font-black rounded-lg transition-all flex items-center gap-2 {{ $viewMode === 'exams' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300' }}"
            >
                <i class="fas fa-file-invoice"></i> EXAMS
            </button>
            <button 
                wire:click="setViewMode('results')"
                class="px-8 py-2.5 text-xs font-black rounded-lg transition-all flex items-center gap-2 {{ $viewMode === 'results' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300' }}"
            >
                <i class="fas fa-poll-h"></i> RESULTS
            </button>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div class="md:col-span-1">
                <flux:input 
                    label="Search {{ $viewMode === 'exams' ? 'Exam Title' : 'Student/Exam Name' }}" 
                    placeholder="Type to search..." 
                    wire:model.live.debounce.300ms="search"
                    icon="magnifying-glass"
                />
            </div>

            <div>
                <flux:select label="Class/Course" wire:model.live="selectedCourse">
                    <option value="">All Classes</option>
                    @foreach($courses as $course)
                        <option value="{{ $course->id }}">{{ $course->name }} ({{ $course->code }})</option>
                    @endforeach
                </flux:select>
            </div>

            <div>
                <flux:input 
                    type="date" 
                    label="From Date" 
                    wire:model.live="dateFrom"
                />
            </div>

            <div>
                <flux:input 
                    type="date" 
                    label="To Date" 
                    wire:model.live="dateTo"
                />
            </div>
        </div>

        <div class="mt-6 flex justify-end">
            <flux:button variant="ghost" icon="arrow-path" wire:click="resetFilters">Reset Filters</flux:button>
        </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-zinc-50 dark:bg-zinc-800/50">
                        @if($viewMode === 'exams')
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Exam Title</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center">Attempts</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Date</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Actions</th>
                        @else
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Student / Exam</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center">Score</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Submitted</th>
                            <th class="px-6 py-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                        @endif
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                    @forelse($items as $item)
                        @if($viewMode === 'exams')
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $this->safeString($item->title) }}</div>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-[10px] text-zinc-400 uppercase tracking-tighter">{{ $this->safeString($item->course->name) }}</span>
                                        <span class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                        <span class="text-[10px] text-zinc-500 uppercase tracking-tighter">{{ $this->safeString($item->lecturer->name) }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <div class="text-sm font-black text-zinc-900 dark:text-zinc-100">{{ $item->attempts }}</div>
                                    <div class="text-[10px] text-zinc-400 uppercase tracking-tighter">attempts</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-zinc-700 dark:text-zinc-300">{{ $item->exam_date->format('M d, Y') }}</div>
                                    <div class="text-[10px] text-zinc-500 uppercase">{{ $item->exam_date->format('h:i A') }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <flux:button size="xs" variant="ghost" icon="eye" wire:click="selectExam('{{ $item->id }}')">View Details</flux:button>
                                </td>
                            </tr>
                        @else
                            <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                                            {{ substr($this->safeString($item->student->first_name), 0, 1) }}{{ substr($this->safeString($item->student->last_name), 0, 1) }}
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $this->safeString($item->student->name) }}</div>
                                            <div class="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{{ $this->safeString($item->exam->title) }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full {{ $item->hasPassed() ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600' }}">
                                        <span class="text-sm font-black">{{ round($item->score, 1) }} / {{ $item->exam->total_marks }}</span>
                                        @if($item->hasPassed())
                                            <i class="fas fa-check-circle text-[10px]"></i>
                                        @else
                                            <i class="fas fa-times-circle text-[10px]"></i>
                                        @endif
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-zinc-700 dark:text-zinc-300">{{ $item->submitted_at ? $item->submitted_at->diffForHumans() : 'N/A' }}</div>
                                    <div class="text-[10px] text-zinc-400">{{ $item->submitted_at ? $item->submitted_at->format('M d, Y') : '' }}</div>
                                </td>
                                <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <flux:button size="xs" variant="ghost" icon="document-text" wire:click="selectResult('{{ $item->id }}')">Details</flux:button>
                                    <flux:button size="xs" variant="ghost" icon="trash" class="text-rose-500 hover:bg-rose-50" wire:click="confirmDeleteResult('{{ $item->id }}')"></flux:button>
                                </td>
                            </tr>
                        @endif
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-20 text-center">
                                <div class="flex flex-col items-center">
                                    <div class="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800">
                                        <i class="fas fa-database text-2xl text-zinc-300 dark:text-zinc-700"></i>
                                    </div>
                                    <p class="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">No records found matching your current filters.</p>
                                    <flux:button variant="ghost" size="sm" wire:click="resetFilters" class="mt-2">Clear all filters</flux:button>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($items->hasPages())
            <div class="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                {{ $items->links() }}
            </div>
        @endif
    </div>

    <!-- Exam Detail Side Modal -->
    <flux:modal wire:model="showExamModal" variant="flyout" class="w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950">
        @if($selectedExam)
            <div class="space-y-8">
                <div>
                    <h2 class="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{{ $this->safeString($selectedExam->title) }}</h2>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">{{ $this->safeString($selectedExam->course->name) }}</span>
                        <span class="text-xs text-zinc-500 font-medium">Lecturer: {{ $this->safeString($selectedExam->lecturer->name) }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Attempts</div>
                        <div class="text-2xl font-black text-indigo-600 text-center">{{ count($selectedExam->sessions) }}</div>
                    </div>
                    <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm border-b-emerald-500 border-b-2">
                        <div class="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 text-center">Passed</div>
                        <div class="text-2xl font-black text-emerald-600 text-center">{{ $selectedExam->sessions->filter->hasPassed()->count() }}</div>
                    </div>
                    <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm border-b-red-500 border-b-2">
                        <div class="text-[10px] font-black text-red-600/60 uppercase tracking-widest mb-1 text-center">Failed</div>
                        <div class="text-2xl font-black text-red-600 text-center">{{ $selectedExam->sessions->reject->hasPassed()->count() }}</div>
                    </div>
                </div>

                <div>
                    <h3 class="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <i class="fas fa-clipboard-list text-zinc-300"></i> Question Overview
                    </h3>
                    <div class="space-y-3">
                        @php
                            $examQuestions = $selectedExam->examQuestions ?? [];
                        @endphp
                        @foreach($examQuestions as $index => $q)
                            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div class="flex items-start gap-4">
                                    <span class="w-6 h-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 shrink-0">{{ $index + 1 }}</span>
                                    <p class="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-snug">{{ $q->question->question_text ?? 'N/A' }}</p>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div>
                    <h3 class="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <i class="fas fa-users text-zinc-300"></i> Student Performance
                    </h3>
                    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <table class="w-full text-left">
                            <thead class="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th class="px-5 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Student</th>
                                    <th class="px-5 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-right">Result</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                @foreach($selectedExam->sessions as $session)
                                    <tr class="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20 transition-colors">
                                        <td class="px-5 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $this->safeString($session->student->name) }}</td>
                                        <td class="px-5 py-3 text-right">
                                            <span class="text-[10px] font-black px-2 py-0.5 rounded-full {{ $session->hasPassed() ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600' }}">
                                                {{ round($session->score, 1) }} / {{ $selectedExam->total_marks }} {{ $session->hasPassed() ? 'PASS' : 'FAIL' }}
                                            </span>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                    <flux:button variant="ghost" wire:click="closeDetail">Close Window</flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    <!-- Result Detail Side Modal -->
    <flux:modal wire:model="showResultModal" variant="flyout" class="w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950">
        @if($selectedResult)
            <div class="space-y-8">
                <div class="flex items-center gap-5">
                    <div class="w-14 h-14 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl font-black text-indigo-600 shadow-sm">
                        {{ substr($this->safeString($selectedResult->student->first_name), 0, 1) }}{{ substr($this->safeString($selectedResult->student->last_name), 0, 1) }}
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{{ $this->safeString($selectedResult->student->name) }}</h2>
                        <div class="flex items-center gap-3 mt-1">
                            <span class="text-xs text-indigo-600 font-bold uppercase tracking-widest">{{ $this->safeString($selectedResult->exam->title) }}</span>
                            <span class="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                            <span class="text-xs text-zinc-500">{{ $this->safeString($selectedResult->exam->course->name) }}</span>
                        </div>
                    </div>
                </div>

                <div class="p-8 rounded-3xl border-2 shadow-sm transition-all {{ $selectedResult->hasPassed() ? 'border-emerald-500/20 bg-emerald-50/30' : 'border-red-500/20 bg-red-50/30' }}">
                    <div class="flex items-end justify-between">
                        <div>
                            <div class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Score</div>
                            <div class="text-4xl font-black {{ $selectedResult->hasPassed() ? 'text-emerald-600' : 'text-red-600' }} tracking-tighter">{{ round($selectedResult->score, 1) }} / {{ $selectedResult->exam->total_marks }}</div>
                        </div>
                        <div class="text-right">
                             <div class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</div>
                             <div class="text-lg font-black uppercase {{ $selectedResult->hasPassed() ? 'text-emerald-700' : 'text-red-700' }}">
                                {{ $selectedResult->hasPassed() ? 'QUALIFIED' : 'NOT QUALIFIED' }}
                             </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <h3 class="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <i class="fas fa-list-check text-zinc-300"></i> Response Breakdown
                    </h3>
                    
                    @php
                        $resultsQuestions = $selectedResult->exam->examQuestions ?? [];
                        
                        $resultsAnswers = [];
                        if ($selectedResult->relationLoaded('examAnswers')) {
                            foreach($selectedResult->examAnswers as $ea) {
                                $resultsAnswers[$ea->question_id] = $ea; // Store full object
                            }
                        }
                    @endphp

                    @foreach($resultsQuestions as $index => $eq)
                        @php
                            $q = $eq->question;
                            $ea = $resultsAnswers[$q->id] ?? null;
                            $rawSAns = $ea ? $ea->student_answer : null;
                            $marksObtained = $ea ? (float)$ea->marks_obtained : 0;
                            $maxMarks = (float)$q->marks;
                            
                            $sAnsString = ($rawSAns !== null) ? $this->safeString($rawSAns) : 'No response';

                            // Accurate Comparison based on Marks Obtained (Real result data)
                            $isRowCorrect = $marksObtained >= $maxMarks;
                            $isPartial = $marksObtained > 0 && $marksObtained < $maxMarks;
                            
                            $correctKey = $q->correct_answer;
                            $cKeyString = $this->safeString($correctKey);
                        @endphp
                        <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            @if($rawSAns !== null)
                                <div class="absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase 
                                    {{ $isRowCorrect ? 'bg-emerald-50 text-emerald-600' : ($isPartial ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600') }} 
                                    rounded-bl-xl border-b border-l border-zinc-100 dark:border-zinc-800">
                                    {{ $isRowCorrect ? 'Correct' : ($isPartial ? 'Partial' : 'Incorrect') }}
                                </div>
                            @endif

                            <div class="flex items-start gap-4 mb-4">
                                <span class="flex-shrink-0 w-6 h-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">{{ $index + 1 }}</span>
                                <p class="text-sm font-black text-zinc-800 dark:text-zinc-200 leading-tight">{{ $q->question_text }}</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div class="space-y-1">
                                    <div class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Student Response</div>
                                    <div class="text-sm font-semibold {{ $isRowCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300' }}">
                                        {{ $sAnsString }}
                                    </div>
                                </div>
                                
                                @if(!$isRowCorrect && $cKeyString !== null && $cKeyString !== '')
                                    <div class="space-y-1">
                                        <div class="text-[9px] font-black text-emerald-600/40 uppercase tracking-widest">Expected Key</div>
                                        <div class="text-sm font-semibold text-emerald-600">
                                            {{ $cKeyString }}
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
                
                <div class="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <flux:button variant="danger" icon="trash" wire:click="confirmDeleteResult('{{ $selectedResult->id }}')">Delete Result</flux:button>
                    <flux:button variant="ghost" wire:click="closeDetail">Close Insights</flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    <!-- Delete Result Confirmation Modal -->
    <flux:modal wire:model="showDeleteResultModal" class="md:w-96 rounded-3xl p-0 overflow-hidden">
        <div class="p-8 space-y-6">
            <div class="text-center">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 mb-4 border border-rose-100 dark:border-rose-900/30">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <flux:heading size="lg">Delete Student Result?</flux:heading>
                <flux:subheading>This will permanently erase this student's attempt, answers, and their associated grade record.</flux:subheading>
            </div>

            <div class="flex gap-3">
                <flux:button class="flex-1" wire:click="$set('showDeleteResultModal', false)" variant="ghost">Abort</flux:button>
                <flux:button class="flex-1" variant="danger" wire:click="deleteResult" wire:loading.attr="disabled">
                    <flux:icon icon="trash" variant="micro" class="mr-2" wire:loading.remove />
                    <flux:icon icon="arrow-path" variant="micro" class="mr-2 animate-spin" wire:loading />
                    Confirm Delete
                </flux:button>
            </div>
        </div>
    </flux:modal>
</div>
