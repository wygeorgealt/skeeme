@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto space-y-8">
        <!-- Header Card -->
        <div class="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                <flux:icon name="check" class="w-10 h-10" />
            </div>
            
            <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Assessment Completed</h1>
            <p class="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">Your responses for <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ $session->exam->title }}</span> have been securely recorded and submitted for grading.</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Status</span>
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800 uppercase">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {{ $session->status }}
                </span>
            </div>

            <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Time Spent</span>
                <span class="text-xl font-mono font-bold text-zinc-900 dark:text-white">
                    {{ gmdate("H:i:s", $session->time_spent_seconds) }}
                </span>
            </div>

            <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Questions</span>
                <span class="text-xl font-bold text-zinc-900 dark:text-white">
                    {{ $session->questions_answered ?? 0 }} <span class="text-zinc-400 text-sm font-normal">/ {{ count($session->exam->questions) }}</span>
                </span>
            </div>
        </div>

        <!-- Results Section (if available) -->
        @if($session->status === 'graded' || ($session->status === 'published' && $session->score !== null))
            <div class="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div class="p-8 text-center border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h2 class="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Final Score</h2>
                    <div class="flex items-baseline justify-center gap-2 mb-2">
                        <span class="text-5xl font-black text-zinc-900 dark:text-white">{{ $session->score }}</span>
                        <span class="text-xl font-medium text-zinc-400">/ {{ $session->exam->total_marks }}</span>
                    </div>
                    <div class="text-2xl font-bold {{ ($session->score / $session->exam->total_marks) >= 0.5 ? 'text-emerald-500' : 'text-rose-500' }}">
                         {{ number_format(($session->score / $session->exam->total_marks) * 100, 1) }}%
                    </div>
                    
                    @if($session->hasPassed() !== null)
                        <div class="mt-4">
                            @if($session->hasPassed())
                                <span class="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">passed</span>
                            @else
                                <span class="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 px-4 py-1.5 rounded-full text-sm font-bold border border-rose-200 dark:border-rose-800 uppercase tracking-wide">failed</span>
                            @endif
                        </div>
                    @endif
                </div>

                <!-- Detailed Breakdown -->
                <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
                    @foreach($session->answers as $answer)
                        <div class="p-6 md:p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div class="flex items-start justify-between gap-4 mb-4">
                                <h3 class="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wide">Question {{ $loop->iteration }}</h3>
                                <span class="flex-shrink-0 text-xs font-bold px-2 py-1 rounded {{ $answer->marks_obtained > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' }}">
                                    {{ $answer->marks_obtained }} / {{ $answer->question->marks }} Marks
                                </span>
                            </div>
                            
                            <div class="mb-4">
                                <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px] mb-1">Your Answer</p>
                                <div class="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                                    {{ $answer->student_answer ?? 'No answer provided' }}
                                </div>
                            </div>

                            @if($answer->feedback)
                                <div class="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <flux:icon name="chat-bubble-left-ellipsis" class="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p class="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Lecturer Feedback</p>
                                        <p class="text-sm text-indigo-900 dark:text-indigo-200">{{ $answer->feedback }}</p>
                                    </div>
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @else
            <!-- Awaiting Grading State -->
            <div class="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <flux:icon name="clock" class="w-8 h-8" />
                </div>
                <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-2">Grading in Progress</h3>
                <p class="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-8">
                    Your assessment has been received and is currently being graded by your lecturer or our AI system. You will be notified when results are available.
                </p>
                <flux:button href="{{ route('student.dashboard') }}" variant="primary" icon="home">Return to Dashboard</flux:button>
            </div>
        @endif
        
        @if(isset($session->metadata['is_preview']) && $session->metadata['is_preview'])
            <div class="flex justify-center">
                 <flux:button href="{{ route('lecturer.exam-questions', $session->exam) }}" variant="ghost" icon="arrow-left">Return to Exam Editor</flux:button>
            </div>
        @endif
    </div>
</div>
@endsection
