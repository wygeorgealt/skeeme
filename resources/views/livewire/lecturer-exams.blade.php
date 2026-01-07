<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Exam Management</flux:heading>
            <flux:subheading>Design and oversee academic assessments for your courses</flux:subheading>
        </div>
        @if($selectedCourse)
            <flux:button wire:click="$set('showCreateForm', true)" icon="plus" variant="primary">Create New Exam</flux:button>
        @endif
    </div>

    <!-- Stats Overview (Dynamic based on selected course if applicable) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Exams</div>
            <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic">{{ count($this->exams) }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-indigo-500">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Now</div>
            <div class="text-3xl font-bold text-indigo-500 italic">{{ $this->exams->filter(fn($e) => $e->status === 'published' && (!$e->end_date || $e->end_date->isFuture()) && $e->exam_date->isPast())->count() }}</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-emerald-500">
            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Avg. Pass Rate</div>
            <div class="text-3xl font-bold text-emerald-500 italic">{{ $this->avgPassRate }}%</div>
        </div>
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-amber-500">
            <div class="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-widest">Total Attempts</div>
            <div class="text-3xl font-bold text-amber-500 italic">{{ $this->exams->sum('sessions_count') }}</div>
        </div>
    </div>

    <!-- Course Filter -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm relative">
        <div class="max-w-xs space-y-4">
            <flux:label for="course-select" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Select Course to Manage</flux:label>
            <flux:select wire:model.live="selectedCourse" id="course-select" placeholder="Choose a course...">
                <flux:select.option value="" disabled hidden>Choose a course...</flux:select.option>
                @foreach($courses as $course)
                    <flux:select.option value="{{ $course->id }}">{{ $course->name }}</flux:select.option>
                @endforeach
            </flux:select>
        </div>
    </div>

    <div class="relative min-h-[400px]">
        <!-- Global Loading Overlay -->
        <div wire:loading.flex wire:target="selectedCourse, createExam, updateExam, deleteExam" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synchronizing examination data...</p>
            </div>
        </div>

        @if($selectedCourse || $this->exams->isNotEmpty())
            <!-- Create/Edit Exam Modal (Only when course selected or editing) -->
            @if($showCreateForm)
            <flux:modal wire:model="showCreateForm" variant="flyout" class="space-y-6">
                <div class="p-6 space-y-6 max-h-[90vh]">
                    <div>
                        <flux:heading size="xl">{{ $editingExam ? 'Update Exam' : 'Design New Exam' }}</flux:heading>
                        <flux:subheading>Define the parameters and schedule for this assessment.</flux:subheading>
                    </div>

                    <form wire:submit="{{ $editingExam ? 'updateExam' : 'createExam' }}" class="space-y-6">
                        <flux:input wire:model="newExam.title" label="Assessment Title" placeholder="e.g. 2024 End of Semester Finals" />
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <flux:select wire:model="newExam.category" label="Assessment Category">
                                <flux:select.option value="exam">Exam</flux:select.option>
                                <flux:select.option value="test">Test / Quiz</flux:select.option>
                                <flux:select.option value="assignment">Assignment / Project</flux:select.option>
                            </flux:select>
                            <flux:input type="datetime-local" wire:model="newExam.exam_date" label="Start Date/Time" />
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <flux:input type="datetime-local" wire:model="newExam.end_date" label="End Date/Time (Optional)" description="Leave blank for unlimited duration" />
                            <flux:input type="number" wire:model="newExam.duration" label="Time Limit (Minutes)" min="1" />
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <flux:input type="number" wire:model="newExam.total_marks" label="Max Score" min="1" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <flux:input type="number" wire:model="newExam.passing_marks" label="Threshold (Pass)" min="1" />
                            <div class="flex items-end pb-1">
                                @if($hasLinkedGoogle)
                                    <flux:checkbox wire:model="newExam.sync_to_calendar" label="Sync to Google Calendar" description="Proactively add to student calendars." />
                                @else
                                    <div class="text-[10px] text-zinc-400 italic px-1">Connect Google to sync with calendar</div>
                                @endif
                            </div>
                        </div>

                        <flux:textarea wire:model="newExam.description" label="Instructions / Description" placeholder="Enter session-specific guidelines for students..." rows="3" />

                        <div class="space-y-4 p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <flux:heading size="sm" class="italic">Integrity & Structure</flux:heading>
                            
                            <flux:checkbox wire:model="newExam.randomize_questions" label="Shuffle Questions" description="Force unique question paths for every candidate." />
                            <flux:checkbox wire:model="newExam.randomize_options" label="Scramble Options" description="Rearrange MCQ choices to prevent pattern recognition." />
                            <div class="pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                                <flux:checkbox wire:model="newExam.release_results_immediately" label="Immediate Results" description="Allow students to view their grade immediately after submission. (Only for auto-graded exams)" />
                            </div>
                        </div>

                        <div class="flex gap-3 pt-4 justify-end">
                            <flux:button wire:click="$set('showCreateForm', false)" variant="ghost">Discard Change</flux:button>
                            <flux:button type="submit" variant="primary" icon="check-circle">{{ $editingExam ? 'Commit Update' : 'Initialize Session' }}</flux:button>
                        </div>
                    </form>
                </div>
            </flux:modal>
            @endif

            <!-- Exams Listing -->
            <div class="space-y-4 animate-fadeIn">
                <flux:heading size="lg" class="italic px-1">Programmed Examinations</flux:heading>
                
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    @if($this->exams && $this->exams->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Exam Name</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Date & Time</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Marks</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Settings</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Status</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    @foreach($this->exams as $exam)
                                        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                            <td class="p-4">
                                                <div class="flex flex-col">
                                                    <div class="flex items-center gap-2 mb-0.5">
                                                        <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{{ $exam->title }}</span>
                                                        @php
                                                            $categoryColors = [
                                                                'exam' => 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
                                                                'test' => 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
                                                                'assignment' => 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
                                                            ];
                                                            $catColor = $categoryColors[$exam->category ?? 'exam'] ?? $categoryColors['exam'];
                                                        @endphp
                                                        <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border {{ $catColor }}">
                                                            {{ $exam->category ?? 'exam' }}
                                                        </span>
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-[10px] font-bold text-zinc-400 font-mono tracking-tighter">{{ $exam->code }}</span>
                                                        @if($exam->google_event_id)
                                                            <span class="flex items-center gap-1 text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">
                                                                <i class="fab fa-google text-[8px]"></i>
                                                                Synced
                                                            </span>
                                                        @endif
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="p-4 text-center">
                                                <div class="flex flex-col gap-0.5 items-center">
                                                    <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $exam->exam_date->format('M d, Y') }}</span>
                                                    <span class="text-[10px] text-zinc-500 font-mono font-bold">{{ $exam->exam_date->format('H:i') }} | {{ $exam->duration }}m</span>
                                                </div>
                                            </td>
                                            <td class="p-4 text-center">
                                                <div class="flex flex-col items-center">
                                                    <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ $exam->total_marks }} Pts</span>
                                                    <span class="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter whitespace-nowrap">Pass Threshold: {{ $exam->passing_marks }}</span>
                                                </div>
                                            </td>
                                            <td class="p-4 text-center">
                                                <div class="flex justify-center gap-1.5 focus:ring-2 focus:ring-zinc-500 outline-none transition-all">
                                                    @if($exam->randomize_questions)
                                                        <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-800 text-[10px] shadow-sm" title="Questions Shuffled">
                                                            <i class="fas fa-random"></i>
                                                        </div>
                                                    @endif
                                                    @if($exam->randomize_options)
                                                        <div class="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 border border-purple-100 dark:border-purple-800 text-[10px] shadow-sm" title="Options Shuffled">
                                                            <i class="fas fa-shuffle"></i>
                                                        </div>
                                                    @endif
                                                    @if(!$exam->randomize_questions && !$exam->randomize_options)
                                                        <span class="text-[9px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest whitespace-nowrap italic">Standard</span>
                                                    @endif
                                                </div>
                                            </td>
                                            <td class="p-4 text-center">
                                                @php
                                                    // Status Logic
                                                    $isPublished = $exam->status === 'published';
                                                    $hasStarted = $exam->exam_date->isPast();
                                                    $hasEnded = $exam->end_date && $exam->end_date->isPast();
                                                    
                                                    if ($isPublished && $hasStarted && !$hasEnded) {
                                                        $status = 'active';
                                                    } elseif ($hasEnded) {
                                                        $status = 'ended';
                                                    } elseif (!$hasStarted && $isPublished) {
                                                        $status = 'upcoming';
                                                    } else {
                                                        $status = 'draft'; 
                                                    }

                                                    $badges = [
                                                        'draft' => 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700',
                                                        'ended' => 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
                                                        'active' => 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 animate-pulse',
                                                        'upcoming' => 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
                                                    ];
                                                @endphp
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border {{ $badges[$status] ?? $badges['draft'] }} shadow-sm">
                                                    {{ $status }}
                                                </span>
                                            </td>
                                            <td class="p-4 text-right">
                                                <div class="flex items-center justify-end gap-2">
                                                    <div class="flex items-center bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                                        <!-- Manage Questions Tooltip -->
                                                        <div id="anchor_exam_questions">
                                                            <flux:button href="{{ route('lecturer.exam-questions', $exam->id) }}" variant="ghost" size="xs" icon="question-mark-circle" title="Questions" inset="top bottom" />
                                                            
                                                            @if($loop->first)
                                                                <template x-teleport="body">
                                                                    <div x-data="discovery('exam_questions')" x-show="show" x-cloak x-transition.opacity :style="coords" class="fixed z-[100]">
                                                                        <div class="w-64 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative">
                                                                            <div class="flex gap-3 items-start">
                                                                                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-100 dark:border-indigo-800">
                                                                                    <flux:icon icon="question-mark-circle" variant="micro" />
                                                                                </div>
                                                                                <div class="space-y-1">
                                                                                    <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 italic">Manage Questions</h4>
                                                                                    <p class="text-[10px] text-zinc-500 leading-relaxed text-left">Design your assessment. Add multiple-choice, theory, or use AI to generate questions from your notes.</p>
                                                                                </div>
                                                                            </div>
                                                                            <div class="mt-4 flex gap-2 justify-end">
                                                                                <button @click="dismiss" class="px-2 py-1 text-[9px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Remind later</button>
                                                                                <button @click="complete" class="px-3 py-1 text-[9px] font-bold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">Got it!</button>
                                                                            </div>
                                                                            <div class="absolute -top-1 right-3 w-3 h-3 bg-white dark:bg-zinc-950 border-t border-l border-indigo-500/30 rotate-45"></div>
                                                                        </div>
                                                                    </div>
                                                                </template>
                                                            @endif
                                                        </div>

                                                        <div class="w-px h-3 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                                                        <!-- Analytics Tooltip -->
                                                        <div id="anchor_exam_analytics">
                                                            <flux:button href="{{ route('lecturer.analytics.dashboard', $exam->id) }}" variant="ghost" size="xs" icon="chart-bar" title="Analytics" inset="top bottom" />
                                                            
                                                            @if($loop->first)
                                                                <template x-teleport="body">
                                                                    <div x-data="discovery('exam_analytics', 'exam_questions')" x-show="show" x-cloak x-transition.opacity :style="coords" class="fixed z-[100]">
                                                                        <div class="w-64 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-emerald-500/30 shadow-2xl backdrop-blur-xl relative">
                                                                            <div class="flex gap-3 items-start">
                                                                                <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100 dark:border-emerald-800">
                                                                                    <flux:icon icon="chart-bar" variant="micro" />
                                                                                </div>
                                                                                <div class="space-y-1">
                                                                                    <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 italic">Deep Analytics</h4>
                                                                                    <p class="text-[10px] text-zinc-500 leading-relaxed text-left">Track student performance, pass rates, and item difficulty metrics in real-time.</p>
                                                                                </div>
                                                                            </div>
                                                                            <div class="mt-4 flex gap-2 justify-end">
                                                                                <button @click="dismiss" class="px-2 py-1 text-[9px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Later</button>
                                                                                <button @click="complete" class="px-3 py-1 text-[9px] font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Understood</button>
                                                                            </div>
                                                                            <div class="absolute -top-1 right-3 w-3 h-3 bg-white dark:bg-zinc-950 border-l border-t border-emerald-500/30 rotate-45"></div>
                                                                        </div>
                                                                    </div>
                                                                </template>
                                                            @endif
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <flux:button wire:click="editExam({{ $exam->id }})" variant="ghost" size="xs" icon="pencil-square" title="Edit Parameters" inset="top bottom" />
                                                        @if($exam->end_date && $exam->end_date->isPast())
                                                            <flux:button wire:click="openReactivateModal({{ $exam->id }})" variant="ghost" size="xs" icon="arrow-path" title="Reactivate Exam" inset="top bottom" class="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" />
                                                        @endif
                                                        <flux:button wire:click="confirmDelete({{ $exam->id }})" variant="ghost" size="xs" icon="trash" title="Delete Session" inset="top bottom" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="py-24 text-center space-y-4">
                            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                                <i class="fas fa-file-signature text-3xl"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Examinations Found</h3>
                                <p class="text-xs text-zinc-500 mt-1">Initialize your first assessment for this course to begin.</p>
                            </div>
                            <flux:button wire:click="$set('showCreateForm', true)" icon="plus" size="sm">Create First Exam</flux:button>
                        </div>
                    @endif
                </div>
            </div>
        @elseif(!$selectedCourse && $this->exams->isEmpty())
             <div class="py-24 text-center space-y-4">
                <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-200 dark:text-zinc-700">
                    <i class="fas fa-layers text-3xl"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest italic">Course Context Required</h3>
                    <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a course to create a new exam, or view all exams above.</p>
                </div>
            </div>
        @endif
    </div>

    <!-- Delete Confirmation Modal -->
    <flux:modal wire:model="showDeleteModal" class="md:w-96 rounded-3xl p-0 overflow-hidden">
        <div class="p-8 space-y-6">
            <div class="text-center">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 mb-4 border border-rose-100 dark:border-rose-900/30">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <flux:heading size="lg">Purge Examination?</flux:heading>
                <flux:subheading>This will permanently erase the session and all associated question configurations.</flux:subheading>
            </div>

            <div class="flex gap-3">
                <flux:button class="flex-1" wire:click="$set('showDeleteModal', false)" variant="ghost">Abort</flux:button>
                <flux:button class="flex-1" variant="danger" wire:click="deleteExam" wire:loading.attr="disabled">
                    <flux:icon icon="trash" variant="micro" class="mr-2" wire:loading.remove />
                    <flux:icon icon="arrow-path" variant="micro" class="mr-2 animate-spin" wire:loading />
                    Confirm Purge
                </flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Reactivate Exam Modal -->
    <flux:modal wire:model="showReactivateModal" class="md:w-96 rounded-3xl p-0 overflow-hidden">
        <div class="p-8 space-y-6">
            <div class="text-center">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mb-4 border border-amber-100 dark:border-amber-900/30">
                    <i class="fas fa-arrow-path"></i>
                </div>
                <flux:heading size="lg">Reactivate Exam</flux:heading>
                <flux:subheading>Extend the duration of this exam to allow new attempts.</flux:subheading>
            </div>

            <div class="space-y-4">
                 <flux:input type="datetime-local" wire:model="reactivateEndDate" label="New End Date/Time" />
            </div>

            <div class="flex gap-3 pt-2">
                <flux:button class="flex-1" wire:click="$set('showReactivateModal', false)" variant="ghost">Cancel</flux:button>
                <flux:button class="flex-1" variant="primary" wire:click="reactivateExam" wire:loading.attr="disabled">
                    Reactivate
                </flux:button>
            </div>
        </div>
    </flux:modal>
    
</div>
