<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Course Curriculum</flux:heading>
            <flux:subheading>View the syllabus and learning objectives</flux:subheading>
        </div>
    </div>

    <!-- Course Selection -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm relative">
        <div class="max-w-xs space-y-4">
            <flux:label for="course-select" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Select Course</flux:label>
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
        <div wire:loading.flex wire:target="selectedCourse" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synchronizing curriculum...</p>
            </div>
        </div>

        @if($selectedCourse && $curriculum->count() > 0)
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 animate-fadeIn">
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md">
                    <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Topics</div>
                    <div class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 italic">{{ $curriculum->count() }}</div>
                </div>
                
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-emerald-500">
                    <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Completed</div>
                    <div class="text-3xl font-bold text-emerald-500 italic">{{ $curriculum->where('status', 'completed')->count() }}</div>
                </div>

                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:shadow-md border-l-4 border-l-amber-500">
                    <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">In Progress</div>
                    <div class="text-3xl font-bold text-amber-500 italic">{{ $curriculum->where('status', 'in_progress')->count() }}</div>
                </div>
            </div>

            <!-- Curriculum List -->
            <div class="space-y-6 animate-fadeIn">
                @foreach($curriculum as $topic)
                    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div class="p-6">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div class="flex items-center gap-4">
                                     <div class="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                                        <span class="text-[10px] font-bold uppercase tracking-wider">Week</span>
                                        <span class="text-2xl font-bold leading-none">{{ $topic->week_number }}</span>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{{ $topic->course_code }}</span>
                                        <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                            {{ $topic->topic }}
                                        </h3>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    @php
                                        $statusConfig = [
                                            'completed' => ['bg' => 'bg-emerald-100 dark:bg-emerald-900/30', 'text' => 'text-emerald-700 dark:text-emerald-400', 'label' => 'Completed'],
                                            'in_progress' => ['bg' => 'bg-amber-100 dark:bg-amber-900/30', 'text' => 'text-amber-700 dark:text-amber-400', 'label' => 'In Progress'],
                                            'pending' => ['bg' => 'bg-zinc-100 dark:bg-zinc-800', 'text' => 'text-zinc-600 dark:text-zinc-400', 'label' => 'Pending'],
                                        ];
                                        $config = $statusConfig[$topic->status] ?? $statusConfig['pending'];
                                    @endphp
                                    <span class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest {{ $config['bg'] }} {{ $config['text'] }}">
                                        {{ $config['label'] }}
                                    </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    @if($topic->description)
                                        <div>
                                            <flux:label class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">Overview</flux:label>
                                            <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                {{ $topic->description }}
                                            </p>
                                        </div>
                                    @endif

                                    @if($topic->resources)
                                        <div>
                                            <flux:label class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">Resources</flux:label>
                                            <div class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                {{ $topic->resources }}
                                            </div>
                                        </div>
                                    @endif
                                </div>

                                @if($topic->objectives)
                                    <div>
                                        <flux:label class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">Learning Objectives</flux:label>
                                        <ul class="space-y-2">
                                            @foreach(explode("\n", $topic->objectives) as $objective)
                                                @if(trim($objective))
                                                    <li class="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors shadow-sm">
                                                        <div class="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                            <flux:icon icon="check" class="w-3 h-3" />
                                                        </div>
                                                        <span class="leading-snug">{{ trim($objective) }}</span>
                                                    </li>
                                                @endif
                                            @endforeach
                                        </ul>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @elseif($selectedCourse)
            <div class="py-24 text-center space-y-4">
                <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                    <i class="fas fa-book-open text-3xl"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Curriculum Found</h3>
                    <p class="text-xs text-zinc-500 mt-1">The curriculum for this course hasn't been set up yet.</p>
                </div>
            </div>
        @else
            <div class="py-24 text-center space-y-4">
                <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-200 dark:text-zinc-700">
                    <i class="fas fa-graduation-cap text-3xl"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest italic">Course Context Required</h3>
                     <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a course to view curriculum.</p>
                </div>
            </div>
        @endif
    </div>
</div>
