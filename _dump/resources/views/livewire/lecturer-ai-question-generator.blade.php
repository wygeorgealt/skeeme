<div class="ai-question-generator">
    <!-- Header -->
    <div class="page-header">
        <div>
            <h1 class="page-title">AI Question Generator</h1>
            <p class="page-subtitle">Generate questions from your ingested course notes using AI</p>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
        <!-- Configuration Panel -->
        <div class="content-card">
            <div class="content-card-header">
                <h2 class="content-card-title">Generation Configuration</h2>
            </div>
            <div class="content-card-body">
                <!-- Course Selection -->
                <div class="form-group relative">
                    <label class="form-label">Course</label>
                    <select wire:model.live="selectedCourse" class="form-select">
                        <option value="">Select a course</option>
                        @foreach($courses as $course)
                            <option value="{{ $course->id }}">{{ $course->name }}</option>
                        @endforeach
                    </select>

    <!-- Loading Overlay for course/notes loading -->
    <div wire:loading.flex wire:target="selectedCourse" class="fixed inset-0 h-screen w-screen bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md z-[100] items-center justify-center animate-fadeIn text-center">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Loading notes...</p>
        </div>
    </div>
                </div>

                @if($selectedCourse)
                    <!-- Note Selection -->
                    <div class="form-group">
                        <label class="form-label">Source Notes (Ingested)</label>
                        <div class="notes-selector">
                            @if($availableNotes->isEmpty())
                                <p class="text-gray-500 text-sm">No ingested notes available. Upload and ingest notes first.</p>
                            @else
                                @foreach($availableNotes as $note)
                                    <label class="checkbox-item">
                                        <input type="checkbox" 
                                               wire:model="selectedNotes" 
                                               value="{{ $note->id }}"
                                               class="checkbox">
                                        <span class="checkbox-label">
                                            <strong>{{ $note->title }}</strong>
                                            <br><span class="text-xs text-gray-500">{{ $note->description ? Str::limit($note->description, 60) : 'No description' }}</span>
                                        </span>
                                    </label>
                                @endforeach
                            @endif
                        </div>
                    </div>

                    <!-- Question Pool Selection -->
                    <div class="form-group">
                        <label class="form-label">Target Question Pool</label>
                        <div class="flex gap-2 mb-3">
                            <select wire:model="selectedPool" class="form-select flex-1">
                                <option value="">Select or create a pool</option>
                                @foreach($questionPools as $pool)
                                    <option value="{{ $pool->id }}">
                                        {{ $pool->name }} ({{ $pool->total_questions }} questions)
                                    </option>
                                @endforeach
                            </select>
                            <button wire:click="createNewPool" class="btn-secondary px-4">
                                <i class="fas fa-plus mr-2"></i>New Pool
                            </button>
                        </div>
                    </div>

                    <!-- Number of Questions -->
                    <div class="form-group">
                        <label class="form-label">Number of Questions to Generate</label>
                        <div class="flex items-center gap-2">
                            <input type="range" 
                                   wire:model.live="questionCount" 
                                   min="1" 
                                   max="50" 
                                   class="flex-1">
                            <span class="text-lg font-semibold w-12">{{ $questionCount }}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">1-50 questions</p>
                    </div>

                    <!-- Bloom's Taxonomy Levels -->
                    <div class="form-group">
                        <label class="form-label">Bloom's Taxonomy Levels</label>
                        <div class="grid grid-cols-2 gap-2">
                            @foreach(['remember' => 'Remember', 'understand' => 'Understand', 'apply' => 'Apply', 'analyze' => 'Analyze', 'evaluate' => 'Evaluate', 'create' => 'Create'] as $value => $label)
                                <label class="checkbox-item flex items-center">
                                    <input type="checkbox" 
                                           wire:model="selectedBloomLevels" 
                                           value="{{ $value }}"
                                           class="checkbox w-4 h-4">
                                    <span class="ml-2 text-sm">{{ $label }}</span>
                                </label>
                            @endforeach
                        </div>
                    </div>

                    <!-- Question Types -->
                    <div class="form-group">
                        <label class="form-label">Question Types</label>
                        <div class="grid grid-cols-2 gap-2">
                            @foreach(['multiple_choice' => 'Multiple Choice', 'essay' => 'Essay', 'true_false' => 'True/False'] as $value => $label)
                                <label class="checkbox-item flex items-center">
                                    <input type="checkbox" 
                                           wire:model="selectedQuestionTypes" 
                                           value="{{ $value }}"
                                           class="checkbox w-4 h-4">
                                    <span class="ml-2 text-sm">{{ $label }}</span>
                                </label>
                            @endforeach
                        </div>
                    </div>

                    <!-- Difficulty Distribution -->
                    <div class="form-group">
                        <label class="form-label">Difficulty Distribution (%)</label>
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <label class="w-20">Easy:</label>
                                <input type="range" wire:model.live="difficultyDistribution.easy" min="0" max="100" class="flex-1">
                                <span class="w-12">{{ $difficultyDistribution['easy'] }}%</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <label class="w-20">Medium:</label>
                                <input type="range" wire:model.live="difficultyDistribution.medium" min="0" max="100" class="flex-1">
                                <span class="w-12">{{ $difficultyDistribution['medium'] }}%</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <label class="w-20">Hard:</label>
                                <input type="range" wire:model.live="difficultyDistribution.hard" min="0" max="100" class="flex-1">
                                <span class="w-12">{{ $difficultyDistribution['hard'] }}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Generate Button -->
                    <button wire:click="generateQuestions" 
                            wire:loading.attr="disabled"
                            :disabled="$isGenerating"
                            class="btn-primary w-full mt-6">
                        @if($isGenerating)
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            Generating Questions...
                        @else
                            <i class="fas fa-wand-magic-sparkles mr-2"></i>
                            Generate Questions
                        @endif
                    </button>

                    @if($isGenerating)
                        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="fas fa-circle-notch fa-spin text-blue-600"></i>
                                <span class="text-sm font-semibold">Generating {{ $questionCount }} questions...</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full transition-all" 
                                     style="width: {{ $generationProgress }}%"></div>
                            </div>
                        </div>
                    @endif
                @endif
            </div>
        </div>

        <!-- Generated Questions Review Panel -->
        @if(!empty($generatedQuestions))
            <div class="content-card">
                <div class="content-card-header">
                    <div class="flex justify-between items-center">
                        <h2 class="content-card-title">Generated Questions ({{ count($generatedQuestions) }})</h2>
                        <div class="flex gap-2">
                            <button wire:click="publishAllQuestions" class="btn-success btn-sm">
                                <i class="fas fa-check mr-1"></i>Publish All
                            </button>
                            <button wire:click="discardAllDrafts" class="btn-danger btn-sm">
                                <i class="fas fa-trash mr-1"></i>Discard All
                            </button>
                        </div>
                    </div>
                </div>
                <div class="content-card-body">
                    <div class="space-y-4">
                        @foreach($generatedQuestions as $question)
                            <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                <!-- Question Header -->
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="badge badge-info">{{ ucfirst($question->question_type) }}</span>
                                            <span class="badge badge-primary">{{ $question->bloom_level }}</span>
                                            <span class="badge badge-gray">{{ $question->marks }} mark{{ $question->marks > 1 ? 's' : '' }}</span>
                                        </div>
                                        <p class="font-semibold text-gray-800">{{ Str::limit($question->question_text, 100) }}</p>
                                    </div>
                                </div>

                                <!-- Question Preview -->
                                @if($question->question_type === 'multiple_choice' && $question->options)
                                    <div class="mb-3 pl-4 border-l-2 border-gray-200">
                                        <p class="text-xs text-gray-600 mb-2">Options:</p>
                                        @foreach($question->options as $option)
                                            <div class="text-sm text-gray-700">
                                                <i class="fas fa-circle text-xs mr-2"></i>
                                                {{ $option['text'] ?? $option }}
                                                @if($option['is_correct'] ?? false)
                                                    <span class="text-green-600 font-semibold ml-2">✓ Correct</span>
                                                @endif
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                <!-- Actions -->
                                <div class="flex gap-2 justify-end pt-3 border-t border-gray-200">
                                    <button wire:click="reviewQuestion({{ $question->id }})" class="btn-secondary btn-sm">
                                        <i class="fas fa-eye mr-1"></i>Review
                                    </button>
                                    <button wire:click="regenerateQuestion({{ $question->id }})" class="btn-warning btn-sm">
                                        <i class="fas fa-sync mr-1"></i>Regenerate
                                    </button>
                                    <button wire:click="publishQuestion({{ $question->id }})" class="btn-success btn-sm">
                                        <i class="fas fa-check mr-1"></i>Publish
                                    </button>
                                    <button wire:click="rejectQuestion({{ $question->id }})" class="btn-danger btn-sm">
                                        <i class="fas fa-trash mr-1"></i>Reject
                                    </button>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        @endif
    </div>

    <!-- Review Modal -->
    @if($showReviewModal && $reviewingQuestion)
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h3 class="text-lg font-semibold">Review Question</h3>
                    <button wire:click="closeReviewModal" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-6">
                    <!-- Question Content -->
                    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 class="font-semibold mb-3">Question</h4>
                        <p class="text-gray-800 mb-4">{{ $reviewingQuestion->question_text }}</p>

                        @if($reviewingQuestion->question_type === 'multiple_choice' && $reviewingQuestion->options)
                            <div class="space-y-2">
                                @foreach($reviewingQuestion->options as $option)
                                    <div class="flex items-center p-2 rounded {{ ($option['is_correct'] ?? false) ? 'bg-green-50 border border-green-200' : 'bg-white' }}">
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 mr-3">
                                            {{ chr(65 + $loop->index) }}
                                        </span>
                                        <span>{{ $option['text'] ?? $option }}</span>
                                        @if($option['is_correct'] ?? false)
                                            <span class="ml-auto text-green-600 font-semibold">✓ Correct</span>
                                        @endif
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>

                    <!-- Metadata -->
                    <div class="mb-6 grid grid-cols-3 gap-4">
                        <div class="p-3 bg-blue-50 rounded">
                            <p class="text-xs text-gray-600">Type</p>
                            <p class="font-semibold">{{ ucfirst($reviewingQuestion->question_type) }}</p>
                        </div>
                        <div class="p-3 bg-purple-50 rounded">
                            <p class="text-xs text-gray-600">Bloom's Level</p>
                            <p class="font-semibold">{{ ucfirst($reviewingQuestion->bloom_level) }}</p>
                        </div>
                        <div class="p-3 bg-orange-50 rounded">
                            <p class="text-xs text-gray-600">Marks</p>
                            <p class="font-semibold">{{ $reviewingQuestion->marks }}</p>
                        </div>
                    </div>

                    <!-- Notes Textarea -->
                    <div class="form-group">
                        <label class="form-label">Lecturer Notes</label>
                        <textarea wire:model="reviewNotes" 
                                  rows="4" 
                                  placeholder="Add notes about this question..."
                                  class="form-textarea"></textarea>
                        <p class="text-xs text-gray-500 mt-1">Your private notes for this question</p>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="flex justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50">
                    <button wire:click="closeReviewModal" class="btn-secondary">Close</button>
                    <button wire:click="saveReview" class="btn-primary">Save Notes</button>
                </div>
            </div>
        </div>
    @endif

    <style>
        .ai-question-generator {
            padding: 2rem;
            background: #f9fafb;
            min-height: 100vh;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }

        .page-subtitle {
            color: #6b7280;
            margin: 0.5rem 0 0 0;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        @media (max-width: 1024px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
        }

        .content-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .content-card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .content-card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }

        .content-card-body {
            padding: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
        }

        .form-select,
        .form-textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
            font-family: inherit;
            transition: all 0.2s;
        }

        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .notes-selector {
            space-y: 0.5rem;
            max-height: 200px;
            overflow-y: auto;
        }

        .checkbox-item {
            display: flex;
            align-items: flex-start;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .checkbox-item:hover {
            background: #f9fafb;
            border-color: #3b82f6;
        }

        .checkbox {
            margin-right: 0.75rem;
            margin-top: 0.25rem;
        }

        .checkbox-label {
            flex: 1;
        }

        .btn-primary,
        .btn-secondary,
        .btn-success,
        .btn-warning,
        .btn-danger,
        .btn-sm {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #3b82f6;
            color: white;
        }

        .btn-primary:hover {
            background: #2563eb;
        }

        .btn-secondary {
            background: #e5e7eb;
            color: #1f2937;
        }

        .btn-secondary:hover {
            background: #d1d5db;
        }

        .btn-success {
            background: #10b981;
            color: white;
        }

        .btn-success:hover {
            background: #059669;
        }

        .btn-warning {
            background: #f59e0b;
            color: white;
        }

        .btn-warning:hover {
            background: #d97706;
        }

        .btn-danger {
            background: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-sm {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
        }

        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-info {
            background: #dbeafe;
            color: #1e40af;
        }

        .badge-primary {
            background: #ddd6fe;
            color: #4c1d95;
        }

        .badge-gray {
            background: #f3f4f6;
            color: #374151;
        }
    </style>
</div>
