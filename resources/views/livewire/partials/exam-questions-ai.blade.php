<!-- AI Generator Tab -->
<div id="tab-ai_generator" class="space-y-10 {{ $activeTab === 'ai_generator' ? 'block' : 'hidden' }}" x-data="aiGenerator(@this)">
    <div>
        <flux:heading size="lg">AI Question Generation</flux:heading>
        <flux:subheading>Create questions from your course material.</flux:subheading>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <!-- Configuration & Notes -->
        <div class="space-y-8 animate-fadeIn">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
                <div class="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        <i class="fas fa-file-signature text-sm"></i>
                    </div>
                    <div>
                        <flux:heading size="sm">Exam Material</flux:heading>
                        <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter">Paste notes or type a topic</flux:subheading>
                    </div>
                </div>

                <flux:textarea wire:model="notes.0" label="Topic or Lecture Notes" placeholder="Paste lecture notes, textbook excerpts, or describe a specific topic to generate questions from..." rows="8" />
                
                <flux:input wire:model="questionPrompt" label="Direct Focus (Optional)" placeholder="e.g. 'Emphasize regulatory frameworks' or 'Focus on Chapter 4'" icon="bolt" />

                <div class="space-y-2">
                    <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 leading-none">Upload Files</flux:label>
                    <div class="relative group">
                        <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer">
                            <i class="fas fa-cloud-upload-alt text-2xl text-zinc-300 dark:text-zinc-600 mb-2 group-hover:scale-110 transition-transform"></i>
                            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select PDF or Word files</span>
                            <input type="file" wire:model="uploadedNotes" multiple class="hidden" />
                        </label>
                    </div>
                    @if(count($uploadedNotes) > 0)
                        <div class="flex flex-wrap gap-2 mt-3">
                            @foreach($uploadedNotes as $file)
                                <div class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                    <i class="fas fa-file"></i>
                                    {{ $file->getClientOriginalName() }}
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
                <div class="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                        <i class="fas fa-sliders text-sm"></i>
                    </div>
                    <div>
                        <flux:heading size="sm">Question Settings</flux:heading>
                        <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter">Set your preferences</flux:subheading>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <flux:input type="number" wire:model="numberOfQuestions" label="Number of Questions" min="1" max="120" />
                    <flux:select wire:model="aiDifficulty" label="Difficulty">
                        <flux:select.option value="mixed">Mixed Profile</flux:select.option>
                        <flux:select.option value="easy">Foundational (Easy)</flux:select.option>
                        <flux:select.option value="medium">Standard (Medium)</flux:select.option>
                        <flux:select.option value="hard">Advanced (Hard)</flux:select.option>
                    </flux:select>
                </div>

                <div class="space-y-3">
                    <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 leading-none">Question Types</flux:label>
                    <div class="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            @foreach(['multiple_choice' => 'MCQ', 'true_false' => 'T / F', 'short_answer' => 'Short', 'essay' => 'Essay', 'fill_blank' => 'Blanks'] as $type => $label)
                                <flux:checkbox wire:model="aiQuestionTypes" value="{{ $type }}" label="{{ $label }}" />
                            @endforeach
                        </div>

                    </div>
                </div>

                <div class="pt-4">
                    <flux:button @click="generateWithPuter()" icon="sparkles" variant="primary" class="w-full h-12 shadow-lg shadow-indigo-500/20" x-bind:disabled="isGeneratingPuter">
                        <span x-show="!isGeneratingPuter">Create Questions</span>
                        <span x-show="isGeneratingPuter" x-text="puterProgress"></span>
                    </flux:button>
                </div>
            </div>
        </div>
        


        <!-- Generated Results -->
        <div class="min-h-[600px] flex flex-col">
            <!-- Puter Loading Overlay using Alpine -->
            <div x-data="{ show: false }" x-init="$watch('isGeneratingPuter', value => show = value)" x-show="show" class="flex-1 flex flex-col items-center justify-center p-10 space-y-8 animate-fadeIn" style="display: none;">
                <div class="relative">
                    <div class="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <i class="fas fa-magic text-2xl text-indigo-500 animate-pulse"></i>
                    </div>
                </div>
                <div class="text-center space-y-2">
                    <flux:heading size="lg" class="italic" x-text="puterProgress">Processing...</flux:heading>
                </div>
            </div>

            @if(count($aiGeneratedQuestions) > 0)
                <div class="space-y-6 animate-fadeIn h-full" x-data x-show="!isGeneratingPuter">
                    <div class="flex items-center justify-between px-2">
                        <div>
                            <flux:heading size="lg">Draft Results</flux:heading>
                            <flux:subheading>Found {{ count($aiGeneratedQuestions) }} draft questions for you.</flux:subheading>
                        </div>
                        <div class="flex items-center gap-2">
                            <flux:button wire:click="addAllAIQuestions" variant="ghost" size="xs" icon="plus" class="hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Add All</flux:button>
                        </div>
                    </div>

                    <div class="space-y-4 overflow-y-auto pr-2 max-h-[1000px] scroll-smooth">
                        @foreach($aiGeneratedQuestions as $index => $question)
                            <div wire:key="{{ $question['id'] }}" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm transition-all hover:border-indigo-500/50 relative group">
                                <div class="absolute top-4 right-4">
                                    <flux:checkbox wire:model="selectedAIQuestions" value="{{ $question['id'] }}" />
                                </div>

                                <div class="space-y-3">
                                    <div class="flex items-center gap-2">
                                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight border bg-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-700 shadow-sm">
                                            {{ str_replace('_', ' ', $question['question_type'] ?? 'unknown') }}
                                        </span>
                                        <span class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest italic">{{ $question['difficulty_level'] ?? 'Normal' }}</span>
                                    </div>

                                    <div class="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed pr-8">
                                        {!! $question['question_text'] ?? 'No Question Text' !!}
                                    </div>
                                    
                                    <!-- Simplified Choice Display -->
                                    <div class="space-y-2 pt-2">
                                        @if(($question['question_type'] ?? '') === 'multiple_choice')
                                            <div class="grid grid-cols-2 gap-2">
                                                @foreach(($question['options'] ?? []) as $option)
                                                    <div class="px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800 text-[10px] font-bold {{ ($question['correct_answer'] ?? '') == $option ? 'bg-emerald-50 text-emerald-700 border-emerald-500/30 dark:bg-emerald-900/40' : 'text-zinc-500' }} truncate">
                                                        {{ $option }}
                                                    </div>
                                                @endforeach
                                            </div>
                                        @else
                                            <div class="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                                <div class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Correct Answer</div>
                                                <div class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{{ $question['correct_answer'] }}</div>
                                            </div>
                                        @endif
                                    </div>

                                    <div class="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div class="flex items-center gap-1">
                                            <flux:button wire:click="previewQuestion('{{ $question['id'] }}', 'ai')" variant="ghost" size="xs" icon="eye" />
                                        </div>
                                        <flux:button wire:click="addAIQuestionByIndex({{ $index }})" variant="primary" size="xs" icon="plus" class="rounded-lg">Add Question</flux:button>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>

                    @if(count($selectedAIQuestions) > 0)
                        <div class="pt-6 mt-auto border-t border-zinc-100 dark:border-zinc-800 animate-slideUp">
                            <flux:button wire:click="addSelectedAIQuestions" variant="primary" class="w-full h-12 shadow-xl shadow-indigo-500/20" icon="plus-circle">
                                Add Selected to Exam ({{ count($selectedAIQuestions) }})
                            </flux:button>
                        </div>
                    @endif
                </div>
            @else
                <div class="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl" x-data x-show="!isGeneratingPuter">
                    <div class="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-100 dark:text-zinc-800 mb-6 scale-125">
                        <i class="fas fa-brain text-4xl"></i>
                    </div>
                    <flux:heading size="lg" class="text-center font-bold italic">Awaiting Input</flux:heading>
                </div>
            @endif
        </div>
    </div>
</div>
