<div class="p-6 space-y-10">
    <!-- Header -->
    <div>
        <flux:heading size="xl" level="1">Grading Hub</flux:heading>
        <flux:subheading>Centralized grading center for all your course assessments.</flux:subheading>
    </div>

    @if($this->courses->isEmpty())
        <div class="text-center py-20">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600 mb-4">
                <flux:icon name="academic-cap" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Courses Found</h3>
            <p class="text-sm text-zinc-500 max-w-sm mx-auto mt-2">You don't have any active courses assigned to you yet.</p>
        </div>
    @else
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Course Selector Sidebar -->
            <div class="md:col-span-1 space-y-6">
                <div>
                    <h3 class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Select Course</h3>
                    <div class="space-y-2">
                        @foreach($this->courses as $course)
                            <button 
                                wire:click="$set('selectedCourseId', {{ $course->id }})"
                                class="w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group
                                {{ $selectedCourseId === $course->id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm' 
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700' 
                                }}"
                            >
                                <div>
                                    <div class="font-bold text-sm {{ $selectedCourseId === $course->id ? 'text-indigo-700 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300' }}">
                                        {{ $course->code }}
                                    </div>
                                    <div class="text-xs {{ $selectedCourseId === $course->id ? 'text-indigo-600/80 dark:text-indigo-400/80' : 'text-zinc-500' }} truncate max-w-[150px]">
                                        {{ $course->name }}
                                    </div>
                                </div>
                                @if($course->pending_count > 0)
                                    <span class="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
                                        {{ $course->pending_count }}
                                    </span>
                                @endif
                            </button>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Exam List -->
            <div class="md:col-span-3 space-y-6">
                @if($this->exams->isEmpty())
                     <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
                        <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 mb-4">
                            <flux:icon name="check-circle" class="w-6 h-6" />
                        </div>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">All Caught Up!</h3>
                        <p class="text-xs text-zinc-500 mt-1">No pending submissions found for this course.</p>
                    </div>
                @else
                    <div class="grid gap-4">
                        @foreach($this->exams as $exam)
                            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 group">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <h3 class="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                                            {{ $exam->title }}
                                        </h3>
                                        @if($exam->submitted_count > 0)
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30">
                                                {{ $exam->submitted_count }} Needs Grading
                                            </span>
                                        @endif
                                        @if($exam->graded_count > 0)
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30">
                                                {{ $exam->graded_count }} Review Ready
                                            </span>
                                        @endif
                                    </div>
                                    <div class="flex items-center gap-3 text-xs text-zinc-500">
                                        <span><span class="font-semibold text-zinc-700 dark:text-zinc-300">Date:</span> {{ $exam->exam_date->format('M d, Y') }}</span>
                                        <span>•</span>
                                        <span><span class="font-semibold text-zinc-700 dark:text-zinc-300">Total Marks:</span> {{ $exam->total_marks }}</span>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <flux:button href="{{ route('lecturer.exam.grading', $exam->id) }}" variant="primary" size="sm" icon="pencil-square">
                                        Open Grader
                                    </flux:button>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    @endif
</div>
