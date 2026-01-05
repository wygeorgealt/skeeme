<!-- Question Preview & Edit Modal -->
<flux:modal wire:model="showQuestionPreview" class="md:w-[700px] p-0 overflow-hidden rounded-3xl" wire:on:close="cancelEdit">
    @if($previewQuestion)
        <div class="flex flex-col h-full max-h-[90vh]">
            <!-- Modal Header -->
            <div class="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        <i class="fas {{ $editingQuestionId ? 'fa-pencil-alt' : 'fa-eye' }} text-sm"></i>
                    </div>
                    <div>
                        <flux:heading size="lg">{{ $editingQuestionId ? 'Update Question Parameters' : 'Assessment Preview' }}</flux:heading>
                        <flux:subheading class="text-[10px] uppercase font-bold tracking-tighter">{{ $editingQuestionId ? 'Modifying existing registry entry' : 'High-fidelity preview of student view' }}</flux:subheading>
                    </div>
                </div>
                <flux:button wire:click="$set('showQuestionPreview', false)" variant="ghost" size="xs" icon="x-mark" />
            </div>

            <!-- Modal Body -->
            <div class="p-8 space-y-8 overflow-y-auto scroll-smooth">
                @if($editingQuestionId)
                    <!-- EDITING STATE -->
                    <div class="space-y-6">
                        <flux:textarea wire:model.live="previewQuestion.question_text" label="Question Text *" placeholder="Modify the question prompt..." rows="3" />
                        
                        <div class="grid grid-cols-2 gap-4">
                            <flux:select wire:model.live="previewQuestion.difficulty_level" label="Complexity">
                                <flux:select.option value="easy">Easy (Foundational)</flux:select.option>
                                <flux:select.option value="medium">Medium (Standard)</flux:select.option>
                                <flux:select.option value="hard">Hard (Advanced)</flux:select.option>
                            </flux:select>
                            <flux:input wire:model.live="previewQuestion.topic" label="Thematic Topic" placeholder="e.g. Molecular Biology" />
                        </div>

                        <!-- Response Validation Edit -->
                        <div class="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                            <flux:heading size="sm" class="italic">Validation Logic</flux:heading>
                            
                            @if(($previewQuestion['question_type'] ?? '') === 'multiple_choice')
                                <div class="grid grid-cols-1 gap-3">
                                    @foreach($previewQuestion['options'] ?? [] as $index => $option)
                                        <div class="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                            <span class="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">{{ chr(65 + $index) }}</span>
                                            <flux:input wire:model.live="previewQuestion.options.{{ $index }}" placeholder="Choice text..." class="flex-1 !border-none !bg-transparent" />
                                            <flux:radio wire:model.live="previewQuestion.correct_answer" value="{{ is_array($option) ? ($option['text'] ?? $option) : $option }}" name="edit_correct_choice" />
                                        </div>
                                    @endforeach
                                </div>
                            @elseif(($previewQuestion['question_type'] ?? '') === 'true_false')
                                @php
                                    $isTrue = in_array(strtolower((string)($previewQuestion['correct_answer'] ?? '')), ['true', '1']);
                                @endphp
                                <div class="flex gap-4">
                                    <button wire:click="$set('previewQuestion.correct_answer', 'true')" class="flex-1 p-4 rounded-xl border flex items-center justify-between transition-all {{ $isTrue ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700' }}">
                                        <span class="text-xs font-bold {{ $isTrue ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500' }}">TRUE</span>
                                        <div class="w-4 h-4 rounded-full border-2 {{ $isTrue ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-300 dark:border-zinc-600' }} flex items-center justify-center">
                                            @if($isTrue) <div class="w-1.5 h-1.5 rounded-full bg-white"></div> @endif
                                        </div>
                                    </button>
                                    <button wire:click="$set('previewQuestion.correct_answer', 'false')" class="flex-1 p-4 rounded-xl border flex items-center justify-between transition-all {{ !$isTrue ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700' }}">
                                        <span class="text-xs font-bold {{ !$isTrue ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500' }}">FALSE</span>
                                        <div class="w-4 h-4 rounded-full border-2 {{ !$isTrue ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-300 dark:border-zinc-600' }} flex items-center justify-center">
                                            @if(!$isTrue) <div class="w-1.5 h-1.5 rounded-full bg-white"></div> @endif
                                        </div>
                                    </button>
                                </div>
                            @elseif(in_array(($previewQuestion['question_type'] ?? ''), ['short_answer', 'essay', 'fill_blank']))
                                <flux:textarea wire:model.live="previewQuestion.correct_answer" label="Benchmark Answer" placeholder="Enter standard response for grading..." rows="3" />
                            @endif
                        </div>
                    </div>
                @else
                    <!-- PREVIEW STATE -->
                    <div class="space-y-8 animate-fadeIn">
                        <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border bg-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-700 shadow-sm">
                                {{ str_replace('_', ' ', $previewQuestion['question_type'] ?? 'Multiple Choice') }}
                            </span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border
                                @if(($previewQuestion['difficulty_level'] ?? 'medium') === 'easy') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                @elseif(($previewQuestion['difficulty_level'] ?? 'medium') === 'hard') bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800
                                @else bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 @endif shadow-sm">
                                {{ $previewQuestion['difficulty_level'] ?? 'Medium' }}
                            </span>
                            @if($previewQuestion['topic'] ?? null)
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-zinc-50 text-zinc-500 border border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 shadow-sm">
                                    {{ $previewQuestion['topic'] }}
                                </span>
                            @endif
                        </div>

                        <div class="space-y-4">
                            <flux:heading size="sm" class="italic uppercase tracking-widest text-[9px] text-zinc-400">Question Prompt</flux:heading>
                            <div class="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-base font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed shadow-inner">
                                {!! nl2br(e($previewQuestion['question_text'])) !!}
                            </div>
                        </div>

                        @if(($previewQuestion['question_type'] ?? '') === 'multiple_choice')
                            <div class="space-y-4">
                                <flux:heading size="sm" class="italic uppercase tracking-widest text-[9px] text-zinc-400">Response Configuration</flux:heading>
                                <div class="grid grid-cols-1 gap-3">
                                    @foreach($previewQuestion['options'] ?? [] as $index => $option)
                                        @php
                                            $optionText = is_array($option) ? ($option['text'] ?? $option) : $option;
                                            $isCorrect = $option == ($previewQuestion['correct_answer'] ?? null) || (is_array($option) && ($option['is_correct'] ?? false));
                                        @endphp
                                        <div class="flex items-center gap-4 p-4 rounded-2xl border transition-all {{ $isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 shadow-sm' : 'bg-white border-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-800 text-zinc-500' }}">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm {{ $isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400' }}">
                                                {{ chr(65 + $index) }}
                                            </div>
                                            <div class="flex-1 font-bold text-sm">{{ $optionText }}</div>
                                            @if($isCorrect)
                                                <div class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <i class="fas fa-check-circle"></i> Valid Answer
                                                </div>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @else
                            <div class="space-y-4">
                                <flux:heading size="sm" class="italic uppercase tracking-widest text-[9px] text-zinc-400">Expected Outcome</flux:heading>
                                <div class="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-sm font-bold text-indigo-700 dark:text-indigo-400 italic shadow-inner">
                                    {{ is_array($previewQuestion['correct_answer'] ?? '') ? ($previewQuestion['correct_answer'][0] ?? '') : ($previewQuestion['correct_answer'] ?? '') }}
                                </div>
                            </div>
                        @endif
                    </div>
                @endif
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                @if($editingQuestionId)
                    <flux:button wire:click="cancelEdit" variant="ghost">Discard Modifications</flux:button>
                    <flux:button wire:click="saveQuestion" variant="primary" icon="check-circle">Commit Snapshot</flux:button>
                @else
                    <flux:button wire:click="$set('showQuestionPreview', false)" variant="ghost">Return to Workspace</flux:button>
                    <flux:button wire:click="editQuestion({{ $previewQuestion['id'] }})" variant="primary" icon="pencil-square">Update Parameters</flux:button>
                @endif
            </div>
        </div>
    @endif
</flux:modal>
