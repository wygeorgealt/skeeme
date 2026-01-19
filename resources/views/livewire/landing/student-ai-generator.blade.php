<div>
    <div class="grid lg:grid-cols-5 gap-8 items-start mb-24">
        
        <!-- Left: Controls -->
        <div class="lg:col-span-2 space-y-6">
            <div class="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-indigo-100/50">

                <!-- Inputs -->
                <div class="space-y-4">
                    <div>
                        <flux:label class="text-xs font-bold text-slate-500 mb-1">Topic</flux:label>
                        <flux:input wire:model="topic" placeholder="e.g. Photosynthesis, World War II..." class="!bg-slate-50 !border-slate-200" />
                        @error('topic') <span class="text-xs text-red-500 font-bold">{{ $message }}</span> @enderror
                    </div>

                    <!-- Advanced Settings -->
                    <div class="grid grid-cols-2 gap-4 pb-2">
                        <div>
                            <flux:label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                                Questions <span class="text-indigo-500">10-50</span>
                            </flux:label>
                            <flux:input type="number" wire:model.blur="questionCount" min="10" max="50" class="!bg-slate-50 !border-slate-200 !h-9 text-sm font-bold" />
                        </div>
                        <div>
                            <flux:label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</flux:label>
                            <div class="flex gap-3">
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" wire:model="questionTypes" value="mcq" class="size-3.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500">
                                    <span class="text-[10px] font-bold text-slate-500 group-hover:text-slate-700">MCQ</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" wire:model="questionTypes" value="theory" class="size-3.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500">
                                    <span class="text-[10px] font-bold text-slate-500 group-hover:text-slate-700">Theory</span>
                                </label>
                            </div>
                            @error('questionTypes') <span class="text-[9px] text-red-500 font-bold">{{ $message }}</span> @enderror
                        </div>
                    </div>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                            <div class="w-full border-t border-slate-100"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="bg-white px-2 text-xs text-slate-400 font-bold uppercase transition hover:text-indigo-400 cursor-help" title="To fix R2 CORS locally, add LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK=local to your .env">Or Upload File</span>
                        </div>
                    </div>

                            <div class="relative group">
                                <label class="flex flex-col items-center justify-center h-48 border-2 border-slate-100 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all">
                                    <div class="flex flex-col items-center justify-center pt-2">
                                        @if($file)
                                            <flux:icon.document-text variant="solid" class="size-10 text-indigo-500 mb-2" />
                                            <p class="text-xs text-indigo-600 font-bold truncate max-w-[200px]">{{ $file->getClientOriginalName() }}</p>
                                        @else
                                            <flux:icon.cloud-arrow-up variant="micro" class="size-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                            <p class="text-xs text-slate-500 font-bold mt-2">Upload your notes</p>
                                            <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">PDF, DOCX, TXT, MD</p>
                                        @endif
                                    </div>
                                    <input type="file" wire:model="file" class="hidden" accept=".pdf,.docx,.txt,.md" />
                                </label>
                                
                                @if($file)
                                    <button wire:click="$set('file', null)" class="absolute top-4 right-4 size-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                                        <flux:icon.x-mark variant="micro" class="size-4" />
                                    </button>
                                @endif
                            </div>

                                <div wire:loading wire:target="file" class="mt-2">
                                    <div class="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                        <div class="bg-indigo-500 h-full animate-progress" style="width: 0%; animation: progress 2s ease-in-out infinite;"></div>
                                    </div>
                                    <p class="text-[9px] text-slate-400 font-bold mt-1">Uploading...</p>
                                </div>
                                
                                @error('file') <span class="text-xs text-red-500 font-bold mt-1 block">{{ $message }}</span> @enderror
                            </div>

                            <flux:button wire:click="generate" @click="resultsVisible = true" variant="primary" class="w-full !rounded-xl !py-4 font-bold shadow-lg shadow-indigo-500/20" :disabled="$isGenerating">
                        <span wire:loading.remove wire:target="generate">Generate Quiz</span>
                        <span wire:loading wire:target="generate" class="flex items-center gap-2">
                            <flux:icon.loading class="animate-spin" /> Thinking...
                        </span>
                    </flux:button>
                    
                    @if(Auth::check())
                        <div class="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
                            <span>Credits: {{ Auth::user()->fresh()->is_unlimited_student ? 'Unlimited' : Auth::user()->fresh()->credits }}</span>
                            <span>Cost: 50</span>
                        </div>
                    @else
                        <div class="text-center text-xs font-bold text-slate-400 px-1">
                            Free trial available
                        </div>
                    @endif
                </div>

            <!-- Info Card -->
            <div class="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div class="flex items-start gap-4">
                    <div class="size-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-indigo-600">
                        <i class="fas fa-bolt text-xs"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-900 text-sm mb-1">Instant Corrections</h4>
                        <p class="text-xs text-slate-500 font-medium">Get immediate feedback on your answers. No more waiting for grading.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Results / Empty State -->
        <div x-data="{ resultsVisible: true }" class="lg:col-span-3 min-h-[500px]">
            @if(empty($generatedQuestions) && !$isGenerating)
                <div class="h-full flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
                    <div class="size-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-slate-300 transform rotate-12">
                        <flux:icon.document-text variant="solid" class="size-8" />
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-2">Ready to study?</h3>
                    <p class="text-slate-500 max-w-sm text-sm">Enter a topic or paste your notes on the left to generate a personalized practice quiz instantly.</p>
                </div>
            @elseif($isGenerating)
                <div class="h-full flex flex-col items-center justify-center p-12 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div class="relative size-24 mb-8">
                        <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                        <div class="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <flux:icon.sparkles class="text-indigo-500 size-8 animate-pulse" variant="solid" />
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Analyzing your notes...</h3>
                    <p class="text-slate-500 text-sm">Our AI is identifying key concepts and creating questions.</p>
                </div>
            @else
                <div x-show="resultsVisible" x-collapse x-transition.duration.300ms class="space-y-6 pb-12">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xl font-bold text-slate-900">Your Quiz</h3>
                        <flux:button 
                            wire:click="resetQuestions" 
                            @click="resultsVisible = false"
                            variant="ghost" 
                            size="sm" 
                            icon="arrow-path"
                        >Reset</flux:button>
                    </div>
                
                    @foreach($generatedQuestions as $index => $q)
                    <div x-data="{ showAnswer: false }" class="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition hover:shadow-md">
                        <div class="flex items-start gap-4 mb-4">
                            <span class="flex items-center justify-center size-6 rounded bg-slate-100 text-xs font-bold text-slate-500 shrink-0">{{ $index + 1 }}</span>
                            <div class="space-y-1">
                                <h4 class="text-base font-bold text-slate-800 leading-snug">{{ $q['question_text'] }}</h4>
                                <span class="text-[10px] uppercase font-black tracking-widest text-slate-400">{{ str_replace('_', ' ', $q['question_type']) }}</span>
                            </div>
                        </div>

                        <div class="pl-10 space-y-3">
                            @if($q['question_type'] === 'multiple_choice' && isset($q['options']))
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    @foreach($q['options'] as $option)
                                        @php
                                            $isSelected = ($selectedAnswers[$index] ?? null) === $option;
                                            $isCorrect = $q['correct_answer'] === $option;
                                            $hasBeenAnswered = isset($selectedAnswers[$index]);
                                            
                                            $classes = 'p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ';
                                            
                                            if (!$hasBeenAnswered) {
                                                $classes .= 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50';
                                            } else {
                                                if ($isSelected && $isCorrect) {
                                                    $classes .= 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100';
                                                } elseif ($isSelected && !$isCorrect) {
                                                    $classes .= 'border-red-500 bg-red-50 text-red-700';
                                                } elseif (!$isSelected && $isCorrect) {
                                                    $classes .= 'border-emerald-200 bg-emerald-50/50 text-emerald-600/70 opacity-80';
                                                } else {
                                                    $classes .= 'border-slate-100 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed';
                                                }
                                            }
                                        @endphp
                                        <div 
                                            wire:click="selectAnswer({{ $index }}, '{{ addslashes($option) }}')"
                                            class="{{ $classes }}"
                                        >
                                            <div class="flex items-center justify-between">
                                                <span>{{ $option }}</span>
                                                @if($hasBeenAnswered)
                                                    @if($isSelected && $isCorrect)
                                                        <flux:icon.check-circle variant="solid" class="size-4 text-emerald-500" />
                                                    @elseif($isSelected && !$isCorrect)
                                                        <flux:icon.x-circle variant="solid" class="size-4 text-red-500" />
                                                    @elseif($isCorrect)
                                                        <flux:icon.check variant="micro" class="size-3 text-emerald-400" />
                                                    @endif
                                                @endif
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @endif

                            <div x-show="showAnswer" x-collapse style="display: none;">
                                <div class="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm">
                                    <p class="font-bold text-indigo-800 mb-1 flex items-center gap-2">
                                        <flux:icon.information-circle variant="micro" /> Explanation
                                    </p>
                                    <p class="text-indigo-700 leading-relaxed">{{ $q['explanation'] ?? 'No explanation provided.' }}</p>
                                </div>
                            </div>

                            <div class="pt-2 flex items-center gap-4">
                                <button @click="showAnswer = !showAnswer" class="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                    <flux:icon.sparkles variant="micro" />
                                    <span x-text="showAnswer ? 'Hide Explanation' : 'Show Explanation'"></span>
                                </button>
                                
                                @if(isset($selectedAnswers[$index]))
                                     <span class="text-[10px] font-black uppercase tracking-tighter {{ $selectedAnswers[$index] === $q['correct_answer'] ? 'text-emerald-500' : 'text-red-400' }}">
                                        {{ $selectedAnswers[$index] === $q['correct_answer'] ? 'Correct!' : 'Incorrect' }}
                                     </span>
                                @endif
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>

    <!-- Modals -->
    <flux:modal name="signup-modal" wire:model="showSignupModal" class="md:w-96 text-center">
        <div class="p-6">
            <div class="size-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <flux:icon.lock-open variant="solid" />
            </div>
            <h3 class="font-bold text-lg text-slate-900 mb-2">Continue for free?</h3>
            <p class="text-sm text-slate-500 mb-6">You've used your guest trial. Create a free account to get 500 more credits instantly!</p>
            <flux:button href="{{ route('register') }}" variant="primary" class="w-full font-bold">Sign Up Free</flux:button>
            <flux:button @click="$dispatch('modal-close')" variant="ghost" class="w-full mt-2 text-xs">Maybe later</flux:button>
        </div>
    </flux:modal>

    <flux:modal name="upgrade-modal" wire:model="showUpgradeModal" class="md:w-96 text-center">
        <div class="p-6">
            <div class="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-coins"></i>
            </div>
            <h3 class="font-bold text-lg text-slate-900 mb-2">Out of credits</h3>
            <p class="text-sm text-slate-500 mb-6">You've used your 500 monthly credits. Upgrade to Unlimited for just $2.99/mo to keep studying.</p>
            <flux:button href="#pricing" @click="$dispatch('modal-close')" variant="primary" class="w-full font-bold">View Plans</flux:button>
            <flux:button @click="$dispatch('modal-close')" variant="ghost" class="w-full mt-2 text-xs">Close</flux:button>
        </div>
    </flux:modal>
</div>
