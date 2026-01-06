<div class="p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
            <flux:heading size="xl" level="1">My Exams</flux:heading>
            <flux:subheading>Track your schedules, active sessions, and graded results</flux:subheading>
        </div>
        <div class="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{{ count($upcomingExams) + count($activeExams) }} Active Schedules</span>
        </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-fit mb-8 border border-zinc-200 dark:border-zinc-800 relative">



        <button 
            wire:click="setActiveTab('active')"
            wire:loading.attr="disabled"
            class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all {{ $activeTab === 'active' ? 'bg-white dark:bg-zinc-800 text-orange-600 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300' }}"
        >
            <i class="fas fa-play"></i>
            Active
            @if(count($activeExams) > 0)
                <span class="ml-1 px-1.5 py-0.5 bg-orange-500 text-white rounded text-[10px] animate-pulse">{{ count($activeExams) }}</span>
            @endif
        </button>


        <button 
            wire:click="setActiveTab('completed')"
            wire:loading.attr="disabled"
            class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all {{ $activeTab === 'completed' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300' }}"
        >
            <i class="fas fa-check-double"></i>
            Completed
            @if(count($completedExams) > 0)
                <span class="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[10px]">{{ count($completedExams) }}</span>
            @endif
        </button>

    </div>

    <!-- Content Area -->
    <div class="max-w-7xl mx-auto relative min-h-[400px]">
        <!-- Loading Overlay -->
        <div wire:loading.flex wire:target="setActiveTab" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Updating view...</p>
            </div>
        </div>


        <!-- Active Exams Tab -->
        @if($activeTab === 'active')
            <div class="space-y-6 animate-fadeIn">
                @if(count($activeExams) === 0)
                    <div class="col-span-full py-20 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
                        <i class="fas fa-play text-4xl text-zinc-300 dark:text-zinc-600 mb-4 opacity-50"></i>
                        <h3 class="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">No Active Sessions</h3>
                    </div>
                @else
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                        @foreach($activeExams as $exam)
                            <div class="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-orange-500/50 shadow-lg shadow-orange-500/10 overflow-hidden flex flex-col relative">
                                <div class="absolute top-0 right-0 p-4">
                                    <span class="flex h-3 w-3">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
                                    </span>
                                </div>

                                <div class="p-8 flex-1">
                                    <div class="flex items-center gap-4 mb-6">
                                        <div class="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                            <i class="fas fa-hourglass-start text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">{{ $exam['title'] }}</h3>
                                            <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                                {{ $exam['course_code'] }} <span class="mx-1 opacity-50">•</span> {{ $exam['course'] }}
                                            </p>
                                        </div>

                                    </div>


                                    <div class="grid grid-cols-2 gap-6">
                                        <div>
                                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Duration</p>
                                            <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $exam['duration'] }} min</p>
                                        </div>
                                        <div>
                                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Marks</p>
                                            <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ $exam['total_marks'] }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="px-8 py-6 bg-orange-50 dark:bg-orange-950/20 border-t border-orange-100 dark:border-orange-900/50">
                                    @if($exam['session'] && $exam['session']->status === 'in_progress')
                                        <flux:button wire:click="resumeExam({{ $exam['session']->id }})" variant="primary" color="orange" class="w-full text-xs font-bold uppercase tracking-[0.2em] py-4">Continue Exam Session</flux:button>
                                    @else
                                        <flux:button wire:click="startExam({{ $exam['id'] }})" variant="primary" color="indigo" class="w-full text-xs font-bold uppercase tracking-[0.2em] py-4">Start Exam Now</flux:button>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        @endif

        <!-- Completed Exams Tab -->
        @if($activeTab === 'completed')
            <div class="space-y-6 animate-fadeIn">
                @if(count($completedExams) === 0)
                    <div class="py-20 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
                        <i class="fas fa-history text-4xl text-zinc-300 dark:text-zinc-600 mb-4 opacity-50"></i>
                        <h3 class="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">No Completed Exams</h3>
                    </div>
                @else
                    <div class="space-y-4 animate-fadeIn">
                        @foreach($completedExams as $exam)
                            <div class="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
                                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div class="flex items-center gap-6 flex-1">
                                        <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                            <i class="fas fa-check-circle text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-500 transition-colors">{{ $exam['title'] }}</h3>
                                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                {{ $exam['course_code'] }} <span class="mx-1 opacity-50">•</span> {{ $exam['course'] }}
                                            </p>
                                        </div>

                                    </div>

                                    <div class="h-10 w-px bg-zinc-200 dark:bg-zinc-800 hidden lg:block"></div>

                                    <div class="flex flex-wrap items-center gap-8">
                                        <div>
                                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Submitted on</p>
                                            <p class="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">{{ $exam['session']?->submitted_at?->format('M d, Y') }}</p>
                                        </div>

                                        @if($exam['session']?->status === 'graded')
                                            <div>
                                                <p class="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Final Result</p>
                                                <p class="text-sm font-black text-emerald-600">85 / 100</p>
                                            </div>
                                            <div class="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">GRADED</div>
                                        @else
                                            <div class="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20">PENDING GRADE</div>
                                        @endif
                                    </div>

                                    <div class="flex items-center gap-3 ml-auto">
                                        <flux:button wire:click="reviewResults({{ $exam['session']?->id ?? 'null' }})" variant="ghost" class="text-[10px] font-bold uppercase tracking-widest">Review</flux:button>
                                        <flux:button wire:click="showExamDetails({{ $exam['session'] ?? 'null' }})" variant="ghost" icon="information-circle" class="text-[10px] font-bold uppercase tracking-widest"></flux:button>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        @endif
    </div>

    <!-- Details Modal (Using Flux-like structure/standards) -->
    @if($showDetailsModal && $selectedExamSession)
        <div class="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full shadow-2xl overflow-hidden">
                <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Exam Details</h2>
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{{ $selectedExamSession->exam->title }}</p>
                    </div>
                    <flux:button wire:click="closeModal" variant="ghost" icon="x-mark"></flux:button>
                </div>

                <div class="p-8">
                    <div class="grid grid-cols-2 gap-6 mb-8">
                        <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Course</p>
                            <p class="text-sm font-bold text-zinc-700 dark:text-zinc-200">{{ $selectedExamSession->exam->course->name }}</p>
                        </div>
                        <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Session Type</p>
                            <p class="text-sm font-bold text-indigo-500 uppercase tracking-widest">{{ $selectedExamSession->status }}</p>
                        </div>
                    </div>

                    @if($selectedExamSession->exam->description)
                        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                            <i class="fas fa-info-circle mr-2 text-indigo-500"></i>
                            {{ $selectedExamSession->exam->description }}
                        </p>
                    @endif

                    <div class="space-y-3">
                        <div class="flex items-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <i class="fas fa-check-circle text-emerald-500"></i>
                            <span>Stable internet connection required.</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <i class="fas fa-check-circle text-emerald-500"></i>
                            <span>Avoid refreshing the browser during active session.</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <i class="fas fa-check-circle text-emerald-500"></i>
                            <span>Automatic submission occurs when timer expires.</span>
                        </div>
                    </div>
                </div>

                <div class="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                    <flux:button wire:click="closeModal" variant="ghost" class="flex-1 font-bold">CLOSE</flux:button>
                    @if($selectedExamSession->status === 'in_progress')
                        <flux:button wire:click="resumeExam({{ $selectedExamSession->id }})" variant="primary" color="orange" class="flex-1 font-bold">RESUME SESSION</flux:button>
                    @elseif($selectedExamSession->status === 'not_started')
                        <flux:button wire:click="startExam({{ $selectedExamSession->exam->id }})" variant="primary" class="flex-1 font-bold">START NOW</flux:button>
                    @endif
                </div>
            </div>
        </div>
    @endif

    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    </style>
</div>

