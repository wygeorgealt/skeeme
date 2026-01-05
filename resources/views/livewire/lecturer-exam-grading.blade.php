<div class="h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 overflow-hidden">
    <!-- Global Loading Overlay -->
    <div wire:loading.flex wire:target="selectSession, autoGradeSession, publishAllGraded, publishResult" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synchronizing grading data...</p>
        </div>
    </div>

    <!-- Header -->
    <header class="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 h-16 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
            <flux:button href="{{ route('lecturer.exams') }}" icon="arrow-left" variant="ghost" size="sm" />
            <h1 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                Grading: {{ $exam->title }}
            </h1>
        </div>
        <div class="flex items-center gap-3">
             <flux:button wire:click="publishAllGraded" variant="filled" class="bg-indigo-600 hover:bg-indigo-700 text-white">
                Publish All Graded
            </flux:button>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar: Student List -->
        <aside class="w-80 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 flex flex-col overflow-y-auto">
            <div class="p-4 border-b border-gray-200 dark:border-zinc-700/50">
                <flux:select wire:model.live="filterStatus" placeholder="Filter Status" class="w-full">
                    <option value="all">All Submissions</option>
                    <option value="submitted">Needs Grading</option>
                    <option value="graded">Graded</option>
                    <option value="published">Published</option>
                </flux:select>
            </div>

            <div class="divide-y divide-gray-100 dark:divide-zinc-700/50">
                @forelse($this->sessions as $session)
                    <button 
                        wire:click="selectSession({{ $session->id }})"
                        class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors {{ $selectedSessionId == $session->id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-2 border-indigo-600' : '' }}"
                    >
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-medium text-gray-900 dark:text-white truncate">
                                {{ $session->student->name }}
                            </span>
                            <span class="text-xs px-2 py-0.5 rounded-full 
                                @if($session->status === 'submitted') bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
                                @elseif($session->status === 'graded') bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400
                                @elseif($session->status === 'published') bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400
                                @endif">
                                {{ ucfirst($session->status) }}
                            </span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            Submitted: {{ $session->submitted_at->format('M d, H:i') }}
                        </div>
                        @if($session->score !== null)
                            <div class="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Score: {{ $session->score }} / {{ $exam->total_marks ?? 'N/A' }}
                            </div>
                        @endif
                    </button>
                @empty
                    <div class="p-8 text-center text-gray-500 text-sm">
                        No submissions found based on current filter.
                    </div>
                @endforelse
            </div>
        </aside>

        <!-- Main Content: Grading Area -->
        <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-900 p-6">
            @if($this->selectedSession)
                <div class="max-w-4xl mx-auto space-y-6">
                    <!-- Session Header -->
                    <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                        <div>
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $this->selectedSession->student->name }}</h2>
                            <p class="text-sm text-gray-500">{{ $this->selectedSession->student->email }}</p>
                        </div>
                        
                        <div class="flex gap-3">
                            @if($this->selectedSession->status === 'submitted')
                                <flux:button wire:click="autoGradeSession({{ $this->selectedSession->id }})" icon="sparkles" variant="primary">
                                    Auto-Grade with AI
                                </flux:button>
                            @endif

                            @if($this->selectedSession->status === 'graded')
                                <flux:button wire:click="publishResult({{ $this->selectedSession->id }})" icon="paper-airplane" variant="success">
                                    Publish Result
                                </flux:button>
                            @endif
                        </div>
                    </div>

                    <!-- Questions & Grading -->
                    <div class="space-y-6">
                        @foreach($this->selectedSession->answers as $answer)
                            <div class="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex-1">
                                        <h3 class="font-medium text-gray-900 dark:text-white mb-2">
                                            Q{{ $loop->iteration }}: {{ $answer->question->question_text }}
                                        </h3>
                                        <div class="text-xs text-gray-500 mb-4 bg-gray-50 dark:bg-zinc-700/50 p-2 rounded">
                                            Max Marks: {{ $answer->question->marks }} | Type: {{ ucfirst(str_replace('_', ' ', $answer->question->question_type)) }}
                                        </div>
                                    </div>
                                    <div class="ml-4 shrink-0 flex flex-col items-end gap-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm text-gray-500">Marks:</span>
                                            <input 
                                                type="number" 
                                                wire:change="updateMark({{ $answer->id }}, $event.target.value)"
                                                value="{{ $answer->marks_obtained }}"
                                                class="w-20 px-2 py-1 text-right border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                min="0"
                                                max="{{ $answer->question->marks }}"
                                                step="0.5"
                                            >
                                        </div>
                                    </div>
                                </div>

                                <!-- Student Answer -->
                                <div class="mb-6">
                                    <h4 class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Student Answer</h4>
                                    <div class="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg text-gray-800 dark:text-indigo-100 whitespace-pre-wrap">
                                        {{ $answer->student_answer ?? '(No Answer)' }}
                                    </div>
                                </div>

                                <!-- AI Feedback / Grading Info -->
                                @if($answer->isAutoMarked() || $answer->isAIGraded())
                                    <div class="mb-4 p-4 border rounded-lg {{ $answer->isAIGraded() ? 'border-purple-100 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-900/10' : 'border-gray-100 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-700/30' }}">
                                        <div class="flex items-center gap-2 mb-2">
                                            <flux:icon name="{{ $answer->isAIGraded() ? 'sparkles' : 'check-circle' }}" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            <span class="text-xs font-bold text-purple-700 dark:text-purple-300">
                                                {{ $answer->isAIGraded() ? 'AI Analysis' : 'Auto-Marked' }}
                                            </span>
                                            @if($answer->getConfidenceScore())
                                                <span class="text-xs text-purple-500 ml-auto">Confidence: {{ $answer->getConfidenceScore() * 100 }}%</span>
                                            @endif
                                        </div>
                                        
                                        @if($answer->feedback)
                                            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                <span class="font-semibold">Feedback:</span> {{ $answer->feedback }}
                                            </p>
                                        @endif
                                        
                                        @if($answer->getGradingReasoning())
                                            <p class="text-sm text-gray-600 dark:text-gray-400 italic border-t border-purple-100 dark:border-purple-900/30 pt-2 mt-2">
                                                Reasoning: {{ $answer->getGradingReasoning() }}
                                            </p>
                                        @endif
                                    </div>
                                @endif

                                <!-- Manual Feedback Input -->
                                <div>
                                    <textarea
                                        wire:blur="updateMark({{ $answer->id }}, {{ $answer->marks_obtained ?? 0 }}, $event.target.value)"
                                        class="w-full text-sm rounded-lg border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add your feedback here..."
                                        rows="2"
                                    >{{ $answer->feedback }}</textarea>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @else
                <!-- Empty State -->
                <div class="h-full flex flex-col items-center justify-center text-center">
                    <div class="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <flux:icon name="user" class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Select a Student</h3>
                    <p class="text-gray-500 dark:text-gray-400 max-w-sm">
                        Choose a student submission from the sidebar to view their answers and start grading.
                    </p>
                </div>
            @endif
        </main>
    </div>
</div>
