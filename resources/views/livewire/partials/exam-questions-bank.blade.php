<!-- Question Bank Tab -->
<div id="tab-bank" class="space-y-8 {{ $activeTab === 'bank' ? 'block' : 'hidden' }}">
    <div>
        <flux:heading size="lg">Add from Question Bank</flux:heading>
        <flux:subheading>Leverage existing questions from your curriculum and past assessments.</flux:subheading>
    </div>

    @if(count($questionBanks) === 0)
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-24 text-center space-y-4">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm text-zinc-300 dark:text-zinc-600">
                <i class="fas fa-database text-3xl"></i>
            </div>
            <div>
                <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Repository Empty</h3>
                <p class="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">No question banks are available at this time. Create content using Manual Entry to populate the bank.</p>
            </div>
        </div>
    @else
        <!-- Selection & Filters -->
        <div class="space-y-6">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                <div class="max-w-md">
                    <flux:select wire:model.live="selectedQuestionBank" label="Choose Source Bank" placeholder="Select a repository...">
                        @foreach($questionBanks as $bank)
                            <flux:select.option value="{{ $bank->id }}">{{ $bank->name }}</flux:select.option>
                        @endforeach
                    </flux:select>
                </div>

                @if($selectedQuestionBank)
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <flux:input wire:model.live="searchQuery" label="Search Content" placeholder="Keywords or concepts..." icon="magnifying-glass" />
                        
                        <flux:select wire:model.live="filterDifficulty" label="Complexity">
                            <flux:select.option value="">All Levels</flux:select.option>
                            <flux:select.option value="easy">Easy</flux:select.option>
                            <flux:select.option value="medium">Medium</flux:select.option>
                            <flux:select.option value="hard">Hard</flux:select.option>
                        </flux:select>

                        <flux:input wire:model.live="filterTopic" label="Refine by Topic" placeholder="e.g. Thermodynamics" icon="tag" />
                    </div>
                @endif
            </div>

            @if($selectedQuestionBank)
                <!-- Questions List -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between px-2">
                        <flux:heading size="sm" class="italic uppercase tracking-widest text-[10px] text-zinc-400">Available Registry ({{ count($bankQuestions) }})</flux:heading>
                    </div>

                    @if(count($bankQuestions) === 0)
                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-16 text-center">
                            <i class="fas fa-search text-2xl text-zinc-200 dark:text-zinc-700 mb-2"></i>
                            <p class="text-xs text-zinc-400 font-bold uppercase tracking-widest">No matching results</p>
                        </div>
                    @else
                        <div class="grid gap-3 animate-fadeIn">
                            @foreach($bankQuestions as $question)
                                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md group flex items-start justify-between gap-6">
                                    <div class="space-y-3">
                                        <div class="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed max-w-2xl">
                                            {{ $question['question_text'] }}
                                        </div>
                                        @if(isset($question['image_path']) && $question['image_path'])
                                            <div class="mt-2 text-zinc-400">
                                                <i class="fas fa-image text-[10px] mr-1"></i>
                                                <span class="text-[9px] font-bold uppercase tracking-widest">Image Content Attached</span>
                                            </div>
                                        @endif
                                        <div class="flex flex-wrap gap-1.5 focus:ring-2 focus:ring-zinc-500 outline-none transition-all">
                                            <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight border
                                                @if($question['question_type'] === 'multiple_choice') bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800
                                                @elseif($question['question_type'] === 'true_false') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                                @else bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 @endif shadow-sm">
                                                {{ str_replace('_', ' ', $question['question_type']) }}
                                            </span>
                                            <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight border
                                                @if($question['difficulty_level'] === 'easy') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                                @elseif($question['difficulty_level'] === 'hard') bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800
                                                @else bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 @endif shadow-sm">
                                                {{ $question['difficulty_level'] }}
                                            </span>
                                            @if($question['topic'])
                                                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight bg-zinc-50 text-zinc-500 border border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700 shadow-sm">
                                                    {{ $question['topic'] }}
                                                </span>
                                            @endif
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center gap-1">
                                        <flux:button wire:click="previewQuestion({{ $question['id'] }}, 'bank')" variant="ghost" size="xs" icon="eye" title="Preview" inset="top bottom" />
                                        <flux:button wire:click="addBankQuestion({{ $question['id'] }})" variant="ghost" size="xs" icon="plus" title="Add to Exam" inset="top bottom" class="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif
        </div>
    @endif
</div>
