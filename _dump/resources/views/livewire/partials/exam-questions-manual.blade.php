<!-- Manual Entry Tab -->
<div id="tab-manual" class="space-y-8 {{ $activeTab === 'manual' ? 'block' : 'hidden' }}">
    <div>
        <flux:heading size="lg">Create Question Manually</flux:heading>
        <flux:subheading>Draft your own questions with full control over structure and marking.</flux:subheading>
    </div>

    <form wire:submit="addManualQuestion" class="space-y-8 animate-fadeIn">
        <div class="space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm relative isolate">
            <div class="absolute -z-10 top-0 right-0 p-8 text-zinc-50 dark:text-zinc-800/20 translate-x-1/4 -translate-y-1/4">
                <i class="fas fa-keyboard text-9xl"></i>
            </div>

            <flux:textarea wire:model="manualQuestion.question_text" label="Question Prompt *" placeholder="Draft your assessment question here..." rows="4" />
            
            @error('manualQuestion.question_text')
                <span class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{{ $message }}</span>
            @enderror

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <flux:select wire:model.live="manualQuestion.question_type" label="Question Category *">
                    <flux:select.option value="multiple_choice">Multiple Choice (4 Options)</flux:select.option>
                    <flux:select.option value="true_false">True / False</flux:select.option>
                    <flux:select.option value="short_answer">Short Answer (Manual Grade)</flux:select.option>
                    <flux:select.option value="essay">Essay / Reflection</flux:select.option>
                    <flux:select.option value="fill_blank">Fill in the Blank</flux:select.option>
                </flux:select>

                <flux:select wire:model="manualQuestion.difficulty_level" label="Complexity Level *">
                    <flux:select.option value="easy">Easy (Foundational)</flux:select.option>
                    <flux:select.option value="medium">Medium (Application)</flux:select.option>
                    <flux:select.option value="hard">Hard (Synthesis)</flux:select.option>
                </flux:select>
            </div>

            <!-- Dynamic Options Section -->
            <div class="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                <div class="flex items-center justify-between">
                    <flux:heading size="sm" class="italic">Define Validation & Scoring</flux:heading>
                    @if($manualQuestion['correct_answer'] !== null)
                        <flux:button wire:click="clearCorrectAnswer" variant="ghost" size="xs" icon="x-mark" class="text-rose-500 hover:text-rose-600">Clear Selection</flux:button>
                    @endif
                </div>

                @if($manualQuestion['question_type'] === 'multiple_choice')
                    <flux:radio.group wire:model="manualQuestion.correct_answer">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            @for($i = 0; $i < 4; $i++)
                                <div class="space-y-2 {{ $manualQuestion['correct_answer'] == $i ? 'ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800' : 'p-3' }} transition-all">
                                    <flux:label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Option {{ chr(65 + $i) }}</flux:label>
                                    <div class="flex items-center gap-3">
                                        <flux:input wire:model="manualQuestion.options.{{ $i }}" placeholder="Enter answer choice..." class="flex-1" />
                                        <flux:radio value="{{ $i }}" title="Mark as Correct" />
                                    </div>
                                </div>
                            @endfor
                        </div>
                    </flux:radio.group>
                    @error('manualQuestion.correct_answer')
                        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{{ $message }}</span>
                    @enderror

                @elseif($manualQuestion['question_type'] === 'true_false')
                    <flux:radio.group wire:model="manualQuestion.correct_answer" class="flex gap-4">
                        <flux:radio value="0" label="TRUE" class="flex-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" />
                        <flux:radio value="1" label="FALSE" class="flex-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" />
                    </flux:radio.group>
                    @error('manualQuestion.correct_answer')
                        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{{ $message }}</span>
                    @enderror

                @elseif(in_array($manualQuestion['question_type'], ['short_answer', 'essay', 'fill_blank']))
                    <flux:textarea wire:model="manualQuestion.correct_answer" 
                        label="{{ $manualQuestion['question_type'] === 'fill_blank' ? 'Correct Fill-in Text *' : 'Reference / Accepted Answers *' }}" 
                        placeholder="Provide the benchmark answer for grading evaluation..." 
                        rows="3" />
                @endif
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div class="md:col-span-2">
                    <flux:textarea wire:model="manualQuestion.explanation" label="Rational / Explanation (Optional)" placeholder="Provide context for the correct solution..." rows="2" />
                </div>
                <div class="space-y-2">
                    <flux:label class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1 leading-none">Score Weight *</flux:label>
                    <flux:input type="number" wire:model="manualQuestion.marks" min="0.5" step="0.5" placeholder="e.g. 1.0" class="h-10" />
                    @error('manualQuestion.marks')
                        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{{ $message }}</span>
                    @enderror
                </div>
            </div>

            <!-- Image Upload Section -->
            <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div class="flex items-center gap-4">
                    <div class="flex-1">
                        <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Attach Visual Asset (Optional)</flux:label>
                        <flux:subheading class="text-[10px]">Import a diagram, chart, or reference image from your system.</flux:subheading>
                    </div>
                    <div>
                        <input type="file" wire:model="manualQuestionImage" id="manual-image-upload" class="hidden" accept="image/*" />
                        <flux:button href="#" onclick="document.getElementById('manual-image-upload').click(); return false;" variant="ghost" size="sm" icon="photo">Select Image</flux:button>
                    </div>
                </div>

                @if ($manualQuestionImage)
                    <div class="mt-4 relative inline-block">
                        <img src="{{ $manualQuestionImage->temporaryUrl() }}" class="h-32 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm" />
                        <button type="button" wire:click="$set('manualQuestionImage', null)" class="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
                            <i class="fas fa-times text-[10px]"></i>
                        </button>
                    </div>
                @endif
            </div>
        </div>

        <div class="flex justify-end pt-4">
            <flux:button type="submit" variant="primary" icon="plus-circle" class="shadow-lg shadow-zinc-900/10 dark:shadow-none">Register Question</flux:button>
        </div>
    </form>
</div>
