<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Notes & Materials</flux:heading>
            <flux:subheading>Access course materials and lecture notes</flux:subheading>
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
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Loading materials...</p>
            </div>
        </div>

        @if($selectedCourse)
            @if(count($notes) > 0)
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    @foreach($notes as $note)
                        <div class="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-1">
                            <div class="p-6 flex flex-col h-full">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex flex-col text-left">
                                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{{ $note->course_code }}</span>
                                        <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2" title="{{ $note->title }}">
                                            {{ $note->title }}
                                        </h3>
                                    </div>
                                    <div class="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                        {{ $note->uploaded_at->format('M d') }}
                                    </div>
                                </div>

                                @if($note->description)
                                    <p class="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3 leading-relaxed text-left flex-1">
                                        {{ $note->description }}
                                    </p>
                                @else
                                    <p class="text-zinc-400 text-sm mb-4 italic flex-1">No description provided.</p>
                                @endif

                                <div class="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                                    @if($note->topic_name)
                                        <div class="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg w-fit">
                                            <i class="fas fa-hashtag text-[10px]"></i>
                                            {{ $note->topic_name }}
                                        </div>
                                    @endif

                                    <div class="flex items-center justify-between gap-4">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                {{ strtoupper(substr($note->lecturer_name ?? 'U', 0, 1)) }}
                                            </div>
                                            <div class="flex flex-col text-left">
                                                <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Lecturer</span>
                                                <span class="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[120px]">
                                                    {{ $note->lecturer_name ?? 'Unknown' }}
                                                </span>
                                            </div>
                                        </div>

                                        @if($note->file_path && Storage::disk('public')->exists($note->file_path))
                                            <div class="flex flex-col items-end">
                                                <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Size</span>
                                                <span class="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                                    {{ number_format(Storage::disk('public')->size($note->file_path) / 1024, 1) }} KB
                                                </span>
                                            </div>
                                        @endif
                                    </div>

                                    <div class="pt-2">
                                        @if($note->file_path)
                                            <flux:button href="{{ route('download.note', $note->id) }}" variant="ghost" icon="document-text" class="w-full !justify-center !rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                Download Material
                                            </flux:button>
                                        @else
                                            <div class="text-center py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                File Unavailable
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="py-24 text-center space-y-4">
                    <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                        <i class="fas fa-folder-open text-3xl"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Notes Found</h3>
                        <p class="text-xs text-zinc-500 mt-1">No materials have been uploaded for this course yet.</p>
                    </div>
                </div>
            @endif
        @else
            <div class="py-24 text-center space-y-4">
                <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-200 dark:text-zinc-700">
                    <i class="fas fa-layer-group text-3xl"></i>
                </div>
                <div>
                     <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest italic">Course Context Required</h3>
                     <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a course to view materials.</p>
                </div>
            </div>
        @endif
    </div>
</div>
