@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-white dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-[1600px] mx-auto">
        
        <!-- Header Section -->
        <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
                <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Assessment Result</h1>
                <p class="text-zinc-600 dark:text-zinc-400 mt-1">
                    {{ $session->exam->title }}
                </p>
            </div>
            <div class="flex items-center gap-3">
                <flux:button href="{{ route('student.exams') }}" icon="arrow-left" variant="ghost">Back to Exams</flux:button>
                <flux:button icon="printer" onclick="window.print()" variant="subtle">Print Result</flux:button>
            </div>
        </div>

        <!-- Stats Grid (Matches Lecturer Management) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <!-- Score Card -->
            <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
                <div class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Score</div>
                <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    @if(($session->status === 'published' || ($session->status === 'graded' && $session->exam->release_results_immediately)) && $session->score !== null)
                        {{ $session->score }} <span class="text-sm font-medium text-zinc-400">/ {{ $session->exam->total_marks }}</span>
                    @else
                        <span class="text-sm text-zinc-500 italic">Grading in Progress</span>
                    @endif
                </div>
            </div>

            <!-- Grade/Status -->
            <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
                <div class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</div>
                <div class="flex items-center gap-2">
                    @php
                        $displayStatus = $session->status;
                        $statusColors = [
                            'published' => 'text-emerald-600 dark:text-emerald-400',
                            'graded' => 'text-emerald-600 dark:text-emerald-400',
                            'submitted' => 'text-amber-600 dark:text-amber-400',
                            'active' => 'text-indigo-600 dark:text-indigo-400',
                        ];
                        
                        if ($session->status === 'graded' && !$session->exam->release_results_immediately) {
                            $displayStatus = 'Processing';
                            $color = 'text-amber-600 dark:text-amber-400';
                        } else {
                            $color = $statusColors[$session->status] ?? 'text-zinc-600 dark:text-zinc-400';
                        }
                    @endphp
                    <span class="text-2xl font-bold {{ $color }} capitalized">{{ ucfirst($displayStatus) }}</span>
                </div>
            </div>

            <!-- Time Spent -->
            <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
                <div class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Time Spent</div>
                <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {{ gmdate("H:i:s", $session->time_spent_seconds) }}
                </div>
            </div>

            <!-- Questions -->
            <div class="bg-white dark:bg-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-1">
                <div class="text-xs text-zinc-500 font-medium uppercase tracking-wider">Completion</div>
                <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {{ $session->questions_answered ?? 0 }} <span class="text-sm font-medium text-zinc-400">/ {{ count($session->exam->questions ?? []) ?: ($session->exam->questions()->count() ?: 0) }}</span>
                </div>
            </div>
        </div>

        <!-- Detailed Feedback (If Finalized) -->
        @if($session->status === 'published' || ($session->status === 'graded' && $session->exam->release_results_immediately))
            <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div class="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <h3 class="font-bold text-zinc-900 dark:text-zinc-100">Performance Summary</h3>
                </div>
                <div class="p-8 text-center text-zinc-500 dark:text-zinc-400">
                     <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                        <flux:icon name="check-badge" class="w-8 h-8" />
                    </div>
                    <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-2">Excellent Job!</h3>
                    <p>Your results have been finalized. You scored {{ number_format(($session->score / max(1, $session->exam->total_marks)) * 100, 1) }}%</p>
                </div>
            </div>
        @else
            <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm p-12 text-center">
                 <div class="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                    <flux:icon name="clock" class="w-8 h-8" />
                </div>
                <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-2">Grading in Progress</h3>
                <p class="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">Your exam has been submitted successfully. Our AI system has completed its initial assessment, and your lecturer is now performing final verification. Your score will be released shortly.</p>
                
                <div class="mt-8">
                     <flux:button href="{{ route('student.exams') }}" variant="primary">Return to Dashboard</flux:button>
                </div>
            </div>
        @endif

    </div>
</div>
@endsection
