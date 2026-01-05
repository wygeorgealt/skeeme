<div class="exam-delivery-container min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
    <!-- Header -->
    <header class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="min-w-0">
                    <h1 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs md:max-w-md">{{ $session->exam->title }}</h1>
                    <p class="text-xs text-zinc-500 font-medium">Question {{ $currentQuestionIndex + 1 }} of {{ $totalQuestions }}</p>
                </div>
            </div>

            <!-- Timer & Actions -->
            <div class="flex items-center gap-4 md:gap-6">
                <!-- Timer -->
                <div class="flex flex-col items-end">
                    <div class="text-xl font-mono font-bold leading-none {{ $timeRemaining <= 300 ? 'text-rose-600 animate-pulse' : 'text-zinc-900 dark:text-zinc-100' }}">
                        {{ $this->getFormattedTime() }}
                    </div>
                    <span class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Time Left</span>
                </div>

                <!-- Progress Bar (Desktop) -->
                <div class="hidden md:block w-32">
                    <div class="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                        <span>Progress</span>
                        <span>{{ $this->getProgressPercentage() }}%</span>
                    </div>
                    <div class="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 transition-all duration-500 ease-out" style="width: {{ $this->getProgressPercentage() }}%"></div>
                    </div>
                </div>

                <div class="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

                <flux:button wire:click="confirmSubmit" variant="primary" class="hidden md:flex">Submit Exam</flux:button>
                <flux:button wire:click="toggleAnswerPreview" icon="squares-2x2" variant="ghost" class="md:hidden"></flux:button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex items-start gap-8">
        <!-- Question Area -->
        <div class="flex-1 min-w-0 space-y-6">
            @if ($currentQuestion)
                <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <!-- Toolbar -->
                    <div class="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                            <span class="font-black">{{ $currentQuestion['marks'] ?? 1 }}</span> Mark{{ ($currentQuestion['marks'] ?? 1) > 1 ? 's' : '' }}
                        </span>

                        <button 
                            wire:click="toggleFlagQuestion"
                            class="group flex items-center gap-2 text-xs font-bold transition-colors {{ $this->isQuestionFlagged($currentQuestionIndex) ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300' }}"
                        >
                            <i class="{{ $this->isQuestionFlagged($currentQuestionIndex) ? 'fas' : 'far' }} fa-flag group-hover:scale-110 transition-transform"></i>
                            <span>{{ $this->isQuestionFlagged($currentQuestionIndex) ? 'Flagged for Review' : 'Flag Question' }}</span>
                        </button>
                    </div>

                    <div class="p-6 md:p-8">
                        <!-- Question Text -->
                        <div class="prose dark:prose-invert max-w-none mb-8">
                            <h3 class="text-lg md:text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                                {!! nl2br(e($currentQuestion['question_text'])) !!}
                            </h3>
                            @if(isset($currentQuestion['image_path']) && $currentQuestion['image_path'])
                                <img src="{{ Storage::url($currentQuestion['image_path']) }}" class="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm max-h-96 object-contain">
                            @endif
                        </div>

                        <!-- Answer Input Area -->
                        <div class="space-y-4">
                            @if ($currentQuestion['type'] === 'multiple_choice' || $currentQuestion['type'] === 'mcq')
                                <div class="grid grid-cols-1 gap-3">
                                    @foreach ($currentQuestion['options'] as $index => $option)
                                        @php
                                            $optionValue = $option['id'] ?? $index;
                                            $isSelected = ($answers[$currentQuestionIndex] ?? '') == $optionValue;
                                        @endphp
                                        <label 
                                            class="relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                                            {{ $isSelected 
                                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 z-10' 
                                                : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50' 
                                            }}"
                                        >
                                            <input type="radio" 
                                                name="answer_{{ $currentQuestionIndex }}" 
                                                value="{{ $optionValue }}"
                                                wire:click="saveAnswer('{{ $optionValue }}')" 
                                                class="sr-only"
                                                {{ $isSelected ? 'checked' : '' }}
                                            >
                                            
                                            <div class="flex items-center gap-4 w-full">
                                                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                                    {{ $isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-zinc-300 dark:border-zinc-600 group-hover:border-indigo-400' }}">
                                                    @if($isSelected) <i class="fas fa-check text-[10px]"></i> @endif
                                                </div>
                                                <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                    {{ $option['text'] ?? $option }}
                                                </span>
                                            </div>
                                        </label>
                                    @endforeach
                                </div>

                            @elseif ($currentQuestion['type'] === 'essay')
                                <div class="relative">
                                    <textarea 
                                        wire:model.debounce.500ms="answers.{{ $currentQuestionIndex }}"
                                        wire:change="saveAnswer($event.target.value)"
                                        rows="10"
                                        class="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus:border-indigo-500 focus:ring-0 transition-colors resize-none"
                                        placeholder="Type your detailed answer here..."
                                    ></textarea>
                                    <div class="absolute bottom-4 right-4 text-xs font-bold text-zinc-400 pointer-events-none">
                                        {{ strlen($answers[$currentQuestionIndex] ?? '') }} chars
                                    </div>
                                </div>

                            @elseif ($currentQuestion['type'] === 'true_false')
                                <div class="grid grid-cols-2 gap-4">
                                    @foreach(['true' => 'True', 'false' => 'False'] as $val => $label)
                                        @php $isSelected = ($answers[$currentQuestionIndex] ?? '') === $val; @endphp
                                        <label class="flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all
                                            {{ $isSelected 
                                                ? ($val === 'true' ? 'border-emerald-500 bg-emerald-50/50' : 'border-rose-500 bg-rose-50/50') 
                                                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50' 
                                            }}"
                                        >
                                            <input type="radio" 
                                                name="answer_{{ $currentQuestionIndex }}" 
                                                value="{{ $val }}"
                                                wire:click="saveAnswer('{{ $val }}')"
                                                class="sr-only"
                                            >
                                            <span class="text-lg font-bold mb-2 {{ $isSelected ? ($val === 'true' ? 'text-emerald-700' : 'text-rose-700') : 'text-zinc-600 dark:text-zinc-400' }}">
                                                {{ $label }}
                                            </span>
                                            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
                                                {{ $isSelected 
                                                    ? ($val === 'true' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-rose-500 bg-rose-500 text-white') 
                                                    : 'border-zinc-300 dark:border-zinc-600' 
                                                }}">
                                                @if($isSelected) <i class="fas fa-check text-xs"></i> @endif
                                            </div>
                                        </label>
                                    @endforeach
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Footer Navigation -->
                    <div class="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 md:px-8 md:py-6 flex items-center justify-between gap-4">
                        <flux:button 
                            wire:click="previousQuestion" 
                            disabled="{{ $currentQuestionIndex === 0 }}"
                            icon="arrow-left"
                            variant="subtle"
                        >
                            Previous
                        </flux:button>

                        <div class="hidden md:flex items-center gap-2">
                             @for($i = max(0, $currentQuestionIndex - 2); $i < min($totalQuestions, $currentQuestionIndex + 3); $i++)
                                <button 
                                    wire:click="goToQuestion({{ $i }})"
                                    class="w-2 h-2 rounded-full transition-all {{ $i === $currentQuestionIndex ? 'bg-indigo-600 w-4' : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-indigo-400' }}"
                                ></button>
                             @endfor
                        </div>

                        <flux:button 
                            wire:click="nextQuestion" 
                            disabled="{{ $currentQuestionIndex === $totalQuestions - 1 }}"
                            icon="arrow-right"
                            icon-trailing
                            variant="primary"
                        >
                            Next Question
                        </flux:button>
                    </div>
                </div>
            @endif
        </div>

        <!-- Sidebar (Questions Navigator) -->
        <div class="hidden lg:block w-80 flex-shrink-0">
            <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24 overflow-hidden">
                <div class="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                    <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Question Navigator</h3>
                    <div class="flex items-center gap-4 mt-3 text-[10px] font-bold text-zinc-500">
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-100 border border-emerald-500"></span>Answered</span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-white border border-zinc-300"></span>Unanswered</span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-100 border border-amber-500"></span>Flagged</span>
                    </div>
                </div>
                
                <div class="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                    <div class="grid grid-cols-5 gap-2">
                        @for ($i = 0; $i < $totalQuestions; $i++)
                            @php
                                $isAnswered = $this->isQuestionAnswered($i);
                                $isFlagged = $this->isQuestionFlagged($i);
                                $isCurrent = $i === $currentQuestionIndex;
                            @endphp
                            <button 
                                wire:click="goToQuestion({{ $i }})"
                                class="relative w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all border
                                {{ $isCurrent 
                                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900' 
                                    : ($isAnswered 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100' 
                                        : 'bg-white text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:border-zinc-400') 
                                }}
                                "
                            >
                                {{ $i + 1 }}
                                @if($isFlagged)
                                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white dark:border-zinc-800 rounded-full"></div>
                                @endif
                            </button>
                        @endfor
                    </div>
                </div>

                <div class="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/10">
                    <div class="flex items-center justify-between text-xs font-medium text-zinc-500 mb-4">
                        <span>Completed</span>
                        <span class="text-zinc-900 dark:text-zinc-100 font-bold">{{ $answeredCount }} / {{ $totalQuestions }}</span>
                    </div>
                    <flux:button wire:click="confirmSubmit" variant="primary" color="zinc" class="w-full">Submit Final Answers</flux:button>
                </div>
            </div>
        </div>
    </main>

    <!-- Confirm Submit Modal -->
    <flux:modal name="confirm-submit"  wire:model="showConfirmSubmit" >
             <div class="space-y-6">
                 <div>
                     <flux:heading size="lg">Submit Assessment?</flux:heading>
                     <flux:subheading>You are about to submit your exam. This action cannot be undone.</flux:subheading>
                 </div>
                 
                 <div class="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                     <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-zinc-500">Questions Answered</span>
                            <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ count(array_filter($answers)) }} / {{ $totalQuestions }}</span>
                     </div>
                     @if(count(array_filter($answers) ?? []) < $totalQuestions)
                        <div class="text-xs text-amber-600 font-medium flex items-center gap-2 mt-2">
                             <i class="fas fa-exclamation-triangle"></i>
                             <span>You have unanswered questions!</span>
                        </div>
                     @endif
                 </div>

                 <div class="flex gap-2">
                     <flux:button wire:click="cancelSubmit" variant="ghost" class="flex-1">Cancel</flux:button>
                     <flux:button wire:click="submit" variant="primary" class="flex-1">Submit Exam</flux:button>
                 </div>
             </div>
    </flux:modal>

    <!-- Session Ended Overlay -->
    @if (!$session->isActive())
        <div class="fixed inset-0 bg-zinc-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-zinc-800">
                <div class="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600 dark:text-rose-400">
                    <i class="fas fa-stopwatch text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-zinc-900 dark:text-white mb-2">Session Ended</h3>
                <p class="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                    Your exam time has expired or the session was terminated. All provided answers have been saved.
                </p>
                <flux:button href="{{ route('student.exams.results', $session) }}" variant="primary" class="w-full">View Results</flux:button>
            </div>
        </div>
    @endif
</div>

@push('scripts')
<script>
    document.addEventListener('livewire:navigated', function() {
        setInterval(() => { @this.dispatch('timer'); }, 1000);

        document.addEventListener('keydown', function(e) {
            const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
            if (!isInput) {
                if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') { @this.call('nextQuestion'); }
                if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') { @this.call('previousQuestion'); }
                if (e.key.toLowerCase() === 'f') { @this.call('toggleFlagQuestion'); }
            }
        });
    });

    window.addEventListener('beforeunload', function(e) {
        if (@js($session->isActive())) { e.preventDefault(); e.returnValue = ''; }
    });
</script>
@endpush
