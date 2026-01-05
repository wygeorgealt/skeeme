@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
        <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <!-- Header -->
            <div class="bg-indigo-600 px-8 py-12 text-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                <div class="relative z-10">
                    <div class="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                        <flux:icon name="check" class="w-8 h-8 text-white" />
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-2">Exam Submitted!</h1>
                    <p class="text-indigo-100 text-lg">Your answers have been securely recorded.</p>
                </div>
            </div>

            <!-- Exam Details -->
            <div class="px-8 py-10">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{{ $session->exam->title }}</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <!-- Status Card -->
                    <div class="bg-gray-50 dark:bg-zinc-700/50 rounded-xl p-6 text-center border border-gray-100 dark:border-zinc-700">
                        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                        <div class="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {{ ucfirst($session->status) }}
                        </div>
                    </div>

                    <!-- Time Spent -->
                    <div class="bg-gray-50 dark:bg-zinc-700/50 rounded-xl p-6 text-center border border-gray-100 dark:border-zinc-700">
                        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Spent</div>
                        <div class="font-semibold text-gray-900 dark:text-white">
                            {{ gmdate("H:i:s", $session->time_spent_seconds) }}
                        </div>
                    </div>

                    <!-- Questions Answered -->
                    <div class="bg-gray-50 dark:bg-zinc-700/50 rounded-xl p-6 text-center border border-gray-100 dark:border-zinc-700">
                        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Questions Answered</div>
                        <div class="font-semibold text-gray-900 dark:text-white">
                            {{ $session->questions_answered ?? 0 }} / {{ count($session->exam->questions) }}
                        </div>
                    </div>
                </div>

                <!-- Grading Message / Results -->
                @if($session->status === 'published' || ($session->status === 'graded' && $session->score !== null))
                    <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-8 mb-8 border border-indigo-100 dark:border-indigo-800 text-center">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Final Grade</h3>
                        <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                            {{ $session->score }} <span class="text-lg text-gray-500 font-normal">/ {{ $session->exam->total_marks }}</span>
                        </div>
                            {{ number_format(($session->score / $session->exam->total_marks) * 100, 1) }}% Score
                        </p>
                        @if($session->hasPassed() !== null)
                            <div class="mt-4">
                                @if($session->hasPassed())
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                        <flux:icon name="check-circle" class="w-4 h-4 mr-1.5" />
                                        PASSED
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                        <flux:icon name="x-circle" class="w-4 h-4 mr-1.5" />
                                        FAILED
                                    </span>
                                @endif
                            </div>
                        @endif
                    </div>

                    <!-- Feedback Breakdown -->
                     <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden mb-8">
                        <div class="bg-gray-50 dark:bg-zinc-700/50 px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
                             <h3 class="font-medium text-gray-900 dark:text-white">Question Feedback</h3>
                        </div>
                        <div class="divide-y divide-gray-100 dark:divide-zinc-700/50">
                             @foreach($session->answers as $answer)
                                <div class="p-6">
                                    <div class="flex justify-between items-start mb-2">
                                        <span class="font-medium text-gray-900 dark:text-white">Question {{ $loop->iteration }}</span>
                                        <span class="text-sm font-semibold {{ $answer->marks_obtained > 0 ? 'text-green-600' : 'text-red-500' }}">
                                            {{ $answer->marks_obtained }} / {{ $answer->question->marks }} Marks
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Your Answer: {{ $answer->student_answer }}
                                    </div>
                                    @if($answer->feedback)
                                        <div class="mt-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg">
                                            <strong>Feedback:</strong> {{ $answer->feedback }}
                                        </div>
                                    @endif
                                </div>
                             @endforeach
                        </div>
                     </div>
                @else
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border border-blue-100 dark:border-blue-800">
                        <div class="flex items-start gap-4">
                            <flux:icon name="information-circle" class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h3 class="font-medium text-blue-900 dark:text-blue-300">Awaiting Grade</h3>
                                <p class="text-blue-700 dark:text-blue-400 mt-1 text-sm">
                                    Your exam has been submitted for grading. Check back later to see your final score and feedback from your lecturer.
                                </p>
                            </div>
                        </div>
                    </div>
                @endif

                <!-- Actions -->
                <div class="flex justify-center gap-4">
                    <flux:button href="{{ route('dashboard') }}" variant="primary">Return to Dashboard</flux:button>
                    <!-- If allowing review later, button could go here -->
                </div>
            </div>
        </div>

        @if(isset($session->metadata['is_preview']) && $session->metadata['is_preview'])
        <div class="mt-8 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                <flux:icon name="eye" class="w-4 h-4" />
                Student Preview Mode
            </div>
            <div class="mt-4">
                 <flux:button href="{{ route('lecturer.exam-questions', $session->exam) }}" variant="ghost">Return to Editor</flux:button>
            </div>
        </div>
        @endif
    </div>
</div>
@endsection
