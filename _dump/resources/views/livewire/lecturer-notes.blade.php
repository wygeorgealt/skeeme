<div class="p-6 space-y-10">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <flux:heading size="xl" level="1">Notes & Materials</flux:heading>
            <flux:subheading>Upload and distribute course resources</flux:subheading>
        </div>
    </div>

    <!-- Course Selection -->
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
        <div wire:loading.flex wire:target="selectedCourse" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synchronizing materials...</p>
            </div>
        </div>

        @if($selectedCourse)
            <!-- Toolbar -->
            <div class="flex justify-end mb-6">
                <flux:button wire:click="$set('showUploadForm', true)" variant="primary" icon="plus">Upload Material</flux:button>
            </div>

            <!-- Upload Modal -->
            <flux:modal wire:model="showUploadForm" variant="flyout" class="space-y-6">
                <div class="p-6 space-y-6">
                    <div>
                        <flux:heading size="xl">Upload Material</flux:heading>
                        <flux:subheading>Share documents and resources with your students.</flux:subheading>
                    </div>

                    <form wire:submit="uploadNote" class="space-y-6">
                        <flux:input wire:model="newNote.title" label="Title" placeholder="e.g. Week 1 Lecture Slides" />
                        
                        <flux:textarea wire:model="newNote.description" label="Description" placeholder="Briefly describe the contents..." rows="3" />

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <flux:select wire:model="newNote.topic_id" label="Topic (Optional)" placeholder="Select a topic...">
                                <flux:select.option value="">Select a topic</flux:select.option>
                                @foreach($topics as $topic)
                                    <flux:select.option value="{{ $topic->id }}">{{ $topic->topic }}</flux:select.option>
                                @endforeach
                            </flux:select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">File Attachment</label>
                            <div class="flex items-center justify-center w-full">
                                <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-xl cursor-pointer bg-zinc-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 transition-colors">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        @if(isset($newNote['file']) && $newNote['file'])
                                            <p class="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">{{ $newNote['file']->getClientOriginalName() }}</p>
                                        @else
                                            <flux:icon icon="cloud-arrow-up" class="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />
                                            <p class="text-xs text-zinc-500 dark:text-zinc-400">
                                                <span class="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">PDF, DOCX, PPTX, TXT, IMG</p>
                                        @endif
                                    </div>
                                    <input id="dropzone-file" type="file" wire:model="newNote.file" class="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                            @error('newNote.file') <p class="mt-2 text-xs text-rose-500 font-medium">{{ $message }}</p> @enderror
                        </div>

                        <div class="flex gap-3 pt-4 justify-end">
                            <flux:button wire:click="$set('showUploadForm', false)" variant="ghost">Cancel</flux:button>
                            <flux:button type="submit" variant="primary">Upload</flux:button>
                        </div>
                    </form>
                </div>
            </flux:modal>

            <!-- Notes Grid -->
            @if($notes && $notes->count() > 0)
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    @foreach($notes as $note)
                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] flex flex-col overflow-hidden group">
                            <div class="p-5 flex-1 space-y-3">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2 mb-1">
                                            @if($note->topic_name)
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    {{ $note->topic_name }}
                                                </span>
                                            @endif
                                        </div>
                                        <h3 class="font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 transition-colors" title="{{ $note->title }}">{{ $note->title }}</h3>
                                    </div>
                                    <div class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <flux:button wire:click="editNote({{ $note->id }})" variant="ghost" size="xs" icon="pencil-square" title="Edit" />
                                        <flux:button wire:click="deleteNote({{ $note->id }})" wire:confirm="Delete this material?" variant="ghost" size="xs" icon="trash" class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Delete" />
                                    </div>
                                </div>
                                
                                @if($note->description)
                                    <p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{{ $note->description }}</p>
                                @else
                                    <p class="text-sm text-zinc-400 italic">No description provided.</p>
                                @endif

                                <!-- Ingestion Status -->
                                <div class="flex items-center gap-2">
                                     @php
                                        $statusConfig = [
                                            'pending' => ['bg' => 'bg-zinc-100 dark:bg-zinc-800', 'text' => 'text-zinc-500', 'label' => 'Processing'],
                                            'processing' => ['bg' => 'bg-indigo-100 dark:bg-indigo-900/30', 'text' => 'text-indigo-600 dark:text-indigo-400', 'label' => 'Indexing'],
                                            'completed' => ['bg' => 'bg-green-100 dark:bg-green-900/30', 'text' => 'text-green-600 dark:text-green-400', 'label' => 'Ready'],
                                            'failed' => ['bg' => 'bg-rose-100 dark:bg-rose-900/30', 'text' => 'text-rose-600 dark:text-rose-400', 'label' => 'Error'],
                                        ];
                                        $config = $statusConfig[$note->embedding_status] ?? $statusConfig['pending'];
                                     @endphp
                                     <span class="text-[10px] font-bold uppercase tracking-wider {{ $config['text'] }}">
                                         AI Status: {{ $config['label'] }}
                                     </span>
                                </div>
                            </div>

                            <div class="p-4 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                                <div>
                                    <span class="font-medium">{{ $note->uploaded_at->format('M d, Y') }}</span>
                                    @if($note->file_path && Storage::disk('public')->exists($note->file_path))
                                        <span class="mx-1">&bull;</span>
                                        <span>{{ number_format(Storage::disk('public')->size($note->file_path) / 1024, 0) }} KB</span>
                                    @endif
                                </div>
                                @if($note->file_path)
                                    <flux:button href="{{ route('download.note', $note->id) }}" variant="ghost" size="xs" icon="arrow-down-tray" class="!h-6 !px-2">Download</flux:button>
                                @endif
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
                        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Materials Found</h3>
                        <p class="text-xs text-zinc-500 mt-1">Start building your course repository by uploading documents.</p>
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
                     <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a course to manage materials.</p>
                </div>
            </div>
        @endif
    </div>
</div>
