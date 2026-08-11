<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\Attributes\Computed;
use Illuminate\Support\Facades\Auth;
use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Services\DeepseekAIService;
use App\Traits\HasToastNotifications;

class LecturerExamQuestions extends Component
{
    use WithFileUploads, HasToastNotifications;

    public $exam;
    public $activeTab = 'review'; // review, manual, bank, ai_generator
    public $selectedCourse;

    // Manual question entry
    public $manualQuestion = [
        'question_text' => '',
        'question_type' => 'multiple_choice',
        'difficulty_level' => 'medium',
        'options' => ['', '', '', ''],
        'correct_answer' => '',
        'explanation' => '',
        'marks' => 1,
    ];

    // Question bank
    public $questionBanks = [];
    public $selectedQuestionBank = null;
    public $bankQuestions = [];
    public $searchQuery = '';
    public $filterDifficulty = null;
    public $filterTopic = null;

    // AI Generation
    public $notes = [];
    public $uploadedNotes = [];
    public $numberOfQuestions = 10;
    public $aiDifficulty = 'mixed';
    public $aiQuestionTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank'];
    public $aiIncludeVisuals = false;
    public $questionPrompt = '';
    public $aiGeneratedQuestions = [];
    public $isGeneratingQuestions = false;
    public $selectedAIQuestions = [];
    public $generationProgress = 0;
    public $generationProgressMessage = '';
    public $generationError = false;
    public $manualQuestionImage = null;

    // Review/Edit
    public $examQuestions = [];
    public $editingQuestion = null;
    public $editingQuestionId = null;

    // UI
    public $showQuestionPreview = false;
    public $previewQuestion = null;

    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->selectedCourse = $exam->course_id;
        $this->loadExamQuestions();
        $this->loadQuestionBanks();
    }

    public function loadExamQuestions()
    {
        $this->examQuestions = $this->exam->examQuestions()
            ->with('question')
            ->get()
            ->map(function ($eq) {
                return [
                    'id' => $eq->id,
                    'question_id' => $eq->question_id,
                    'order' => $eq->order,
                    'marks' => $eq->marks,
                    'question' => $eq->question,
                ];
            })
            ->toArray();
    }

    public function loadQuestionBanks()
    {
        $this->questionBanks = QuestionBank::where('course_id', $this->selectedCourse)
            ->where('created_by', Auth::id())
            ->get();
    }

    public function selectQuestionBank($bankId)
    {
        $this->selectedQuestionBank = $bankId;
        $this->loadBankQuestions();
    }

    public function loadBankQuestions()
    {
        if (!$this->selectedQuestionBank) {
            $this->bankQuestions = [];
            return;
        }

        $query = Question::where('question_bank_id', $this->selectedQuestionBank);

        if ($this->searchQuery) {
            $query->where('question_text', 'like', "%{$this->searchQuery}%")
                ->orWhere('topic', 'like', "%{$this->searchQuery}%");
        }

        if ($this->filterDifficulty) {
            $query->where('difficulty_level', $this->filterDifficulty);
        }

        if ($this->filterTopic) {
            $query->where('topic', $this->filterTopic);
        }

        $this->bankQuestions = $query->get()->toArray();
    }

    public function updatedSearchQuery()
    {
        $this->loadBankQuestions();
    }

    public function updatedFilterDifficulty()
    {
        $this->loadBankQuestions();
    }

    public function updatedFilterTopic()
    {
        $this->loadBankQuestions();
    }

    public function updatedActiveTab()
    {
        $this->dispatch('render-math');
    }

    #[Computed]
    public function totalMarks()
    {
        return array_sum(array_column($this->examQuestions, 'marks'));
    }

    #[Computed]
    public function questionCount()
    {
        return count($this->examQuestions);
    }

    #[Computed]
    public function canAccessAI()
    {
        /** @var \App\Models\User */
        $user = Auth::user();
        $school = $user->school;
        
        if (!$school || !$school->activeSubscription) {
            return false;
        }

        return $school->activeSubscription->hasFeature('ai_exams_management') || $school->activeSubscription->isPro();
    }

    // Manual question management
    public function addManualQuestion()
    {
        $this->validate([
            'manualQuestion.question_text' => 'required|string|min:5',
            'manualQuestion.question_type' => 'required|in:multiple_choice,true_false,short_answer,essay,fill_blank',
            'manualQuestion.difficulty_level' => 'required|in:easy,medium,hard',
            'manualQuestion.marks' => 'required|numeric|min:0.5|max:999',
        ]);

        // Validate options if MCQ or TrueFalse
        if (in_array($this->manualQuestion['question_type'], ['multiple_choice', 'true_false'])) {
            if ($this->manualQuestion['correct_answer'] === '' || $this->manualQuestion['correct_answer'] === null) {
                $this->addError('manualQuestion.correct_answer', 'Please select a correct answer');
                return;
            }
        }

        $imagePath = null;
        if ($this->manualQuestionImage) {
            $imagePath = $this->manualQuestionImage->store('question-images', 'public');
        }

        $question = Question::create([
            'question_text' => $this->manualQuestionImage ? $this->manualQuestion['question_text'] : $this->manualQuestion['question_text'], // placeholder for logic
            'question_type' => $this->manualQuestion['question_type'],
            'difficulty_level' => $this->manualQuestion['difficulty_level'],
            'options' => $this->manualQuestion['question_type'] !== 'essay' ? $this->manualQuestion['options'] : null,
            'correct_answer' => $this->manualQuestion['correct_answer'],
            'explanation' => $this->manualQuestion['explanation'],
            'image_path' => $imagePath,
            'source' => 'manual',
            'created_by' => Auth::id(),
            'question_bank_id' => $this->getOrCreateQuestionBank()?->id,
        ]);

        $this->addQuestionToExam($question->id, $this->manualQuestion['marks']);
        $this->resetManualQuestion();
        $this->manualQuestionImage = null;
        $this->loadExamQuestions();
        $this->toastSuccess('Question added successfully!', 'Success');
    }

    public function addBankQuestion($questionId, $marks = null)
    {
        $question = Question::find($questionId);
        if (!$question) {
            return;
        }

        $this->addQuestionToExam($questionId, $marks);
        $this->loadExamQuestions();
        $this->toastSuccess('Question added successfully!', 'Success');
    }

    protected function saveAIQuestionToExam($selectedQuestion)
    {
        // Save to question bank
        $question = Question::create([
            'question_text' => $selectedQuestion['question_text'] ?? 'Untitled Question',
            'question_type' => $selectedQuestion['question_type'] ?? 'multiple_choice',
            'difficulty_level' => $selectedQuestion['difficulty_level'] ?? 'medium',
            'options' => (in_array(($selectedQuestion['question_type'] ?? ''), ['multiple_choice', 'true_false']) && is_array($selectedQuestion['options'] ?? null)) ? $selectedQuestion['options'] : null,
            'correct_answer' => $selectedQuestion['correct_answer'] ?? '',
            'explanation' => $selectedQuestion['explanation'] ?? '',
            'learning_objective' => $selectedQuestion['learning_objective'] ?? '',
            'image_path' => $selectedQuestion['image_path'] ?? null,
            'source' => 'ai_generated',
            'created_by' => Auth::id(),
            'question_bank_id' => $this->getOrCreateQuestionBank()?->id,
        ]);

        // Add to exam
        $this->addQuestionToExam($question->id, $selectedQuestion['marks'] ?? 1);
    }

    public function addAIQuestionByIndex($index)
    {
        if (!isset($this->aiGeneratedQuestions[$index])) {
            $this->toastError('Question not found at index: ' . $index, 'Error');
            return;
        }

        $selectedQuestion = $this->aiGeneratedQuestions[$index];
        $this->saveAIQuestionToExam($selectedQuestion);
        
        // Remove from AI generated list by index and re-index
        unset($this->aiGeneratedQuestions[$index]);
        $this->aiGeneratedQuestions = array_values($this->aiGeneratedQuestions);

        $this->loadExamQuestions();
        $this->toastSuccess('Question added successfully!', 'Success');
        
        // Trigger re-render to ensure Math/SVG stays correct after dom update
        $this->dispatch('render-math');
    }

    public function addQuestionToExam($questionId, $marks = 1)
    {
        $examQuestion = ExamQuestion::firstOrCreate(
            ['exam_id' => $this->exam->id, 'question_id' => $questionId],
            ['order' => count($this->examQuestions) + 1, 'marks' => $marks]
        );
    }

    public function removeQuestion($examQuestionId)
    {
        ExamQuestion::find($examQuestionId)?->delete();
        $this->loadExamQuestions();
        $this->toastSuccess('Question removed!', 'Success');
    }

    public function updateQuestionMarks($examQuestionId, $marks)
    {
        ExamQuestion::find($examQuestionId)?->update(['marks' => $marks]);
        $this->loadExamQuestions();
        $this->toastSuccess('Marks updated!', 'Success');
    }

    public function reorderQuestions($orders)
    {
        foreach ($orders as $order => $id) {
            ExamQuestion::find($id)?->update(['order' => $order]);
        }
        $this->loadExamQuestions();
        $this->toastSuccess('Questions reordered!', 'Success');
    }

    // AI Generation
    public function generateAIQuestions()
    {
        if (count($this->uploadedNotes) === 0 && count($this->notes) === 0) {
            $this->addError('notes', 'Please provide at least one note or upload a file');
            return;
        }

        if ($this->numberOfQuestions < 1 || $this->numberOfQuestions > 120) {
            $this->addError('numberOfQuestions', 'Number of questions must be between 1 and 120');
            return;
        }

        $this->isGeneratingQuestions = true;
        $this->generationProgress = 0;
        $this->generationError = false;
        $this->generationProgressMessage = 'Initializing AI engine...';
        $this->dispatch('progressUpdated');

        try {
            $notesContent = array_merge($this->notes, $this->uploadedNotes);
            $service = app(DeepseekAIService::class);
            
            $progressCallback = function($progress) {
                if ($progress <= 25) {
                    $this->generationProgressMessage = "Reading material...";
                } elseif ($progress <= 50) {
                    $this->generationProgressMessage = "Checking details...";
                } elseif ($progress <= 75) {
                    $this->generationProgressMessage = "Writing questions...";
                } else {
                    $this->generationProgressMessage = "Finishing up...";
                }
                
                $this->dispatch('generation-progress', progress: $progress);
            };

            $questions = $service->generateQuestions(
                $notesContent,
                $this->numberOfQuestions,
                $this->aiDifficulty,
                $this->aiQuestionTypes,
                $this->questionPrompt,
                $this->aiIncludeVisuals,
                $progressCallback // Pass the callback
            );

            // Add IDs to questions for tracking
            $this->aiGeneratedQuestions = array_map(function ($q, $index) {
                $q['id'] = 'ai_' . $index . '_' . time();
                $q['marks'] = 1;

                // Handle MCQ letter-to-value mapping if necessary
                if ($q['question_type'] === 'multiple_choice' && isset($q['options'])) {
                    $letterMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'E' => 4];
                    $ans = $q['correct_answer'];
                    if (isset($letterMap[strtoupper($ans)])) {
                        $idx = $letterMap[strtoupper($ans)];
                        $q['correct_answer'] = $q['options'][$idx] ?? $ans;
                    }
                }
                
                return $q;
            }, $questions, array_keys($questions));

            // Final progress
            $this->generationProgress = 100;
            $this->generationProgressMessage = count($questions) . ' questions generated successfully!';
            $this->dispatch('progressUpdated');
            $this->dispatch('render-math');
            
            $this->toastSuccess(count($questions) . ' questions generated!', 'Success');
        } catch (\Exception $e) {
            \Log::error('Question Generation Error: ' . $e->getMessage());
            $this->generationError = true;
            $this->toastError('Failed to generate questions. Please try again.', 'Error');
            $this->generationProgressMessage = 'Error: ' . $e->getMessage();
            $this->dispatch('progressUpdated');
        } finally {
            $this->isGeneratingQuestions = false;
            $this->dispatch('progressUpdated');
        }
    }


    public function previewQuestion($questionId, $source = 'exam')
    {
        $question = null;
        
        if ($source === 'ai') {
            $question = collect($this->aiGeneratedQuestions)->firstWhere('id', $questionId);
        } elseif ($source === 'bank') {
            $question = Question::find($questionId);
        } else {
            $examQuestion = $this->examQuestions[$questionId] ?? null;
            $question = $examQuestion ? $examQuestion['question'] : null;
        }

        // Convert question model to array if needed
        if (is_object($question)) {
            $question = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'difficulty_level' => $question->difficulty_level,
                'options' => is_string($question->options) ? json_decode($question->options, true) : $question->options,
                'correct_answer' => $question->correct_answer,
                'topic' => $question->topic ?? '',
                'explanation' => $question->explanation ?? '',
                'learning_objective' => $question->learning_objective ?? '',
            ];
        }

        $this->previewQuestion = $question;
        $this->showQuestionPreview = true;
        $this->dispatch('render-math');
    }

    public function editQuestion($examQuestionId)
    {
        $examQuestion = collect($this->examQuestions)->firstWhere('id', $examQuestionId);
        if (!$examQuestion) {
            return;
        }

        $question = $examQuestion['question'];
        
        // Convert question model to array if needed
        if (is_object($question)) {
            $correctAnswer = $question->correct_answer;
            // Normalize correct_answer: if it's an array, get first element
            if (is_array($correctAnswer)) {
                $correctAnswer = $correctAnswer[0] ?? '';
            }
            
            $question = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'difficulty_level' => $question->difficulty_level,
                'options' => is_string($question->options) ? json_decode($question->options, true) : $question->options,
                'correct_answer' => $correctAnswer,
                'topic' => $question->topic ?? '',
                'explanation' => $question->explanation ?? '',
                'learning_objective' => $question->learning_objective ?? '',
            ];
        }
        
        $this->previewQuestion = $question;
        $this->showQuestionPreview = true;
        $this->editingQuestionId = $examQuestionId;
    }

    public function cancelEdit()
    {
        $this->editingQuestionId = null;
        $this->previewQuestion = null;
        $this->showQuestionPreview = false;
    }

    public function saveQuestion()
    {
        if (!$this->editingQuestionId || !$this->previewQuestion) {
            return;
        }

        $examQuestion = collect($this->examQuestions)->firstWhere('id', $this->editingQuestionId);
        if (!$examQuestion) {
            return;
        }

        try {
            $question = Question::find($examQuestion['question_id']);
            if (!$question) {
                $this->toastError('Question not found', 'Error');
                return;
            }

            // Update question based on type
            $question->update([
                'question_text' => $this->previewQuestion['question_text'] ?? '',
                'difficulty_level' => $this->previewQuestion['difficulty_level'] ?? 'medium',
            ]);

            // Handle options and answer based on question type
            $questionType = $this->previewQuestion['question_type'] ?? 'multiple_choice';
            $correctAnswer = $this->previewQuestion['correct_answer'] ?? '';
            
            if ($questionType === 'true_false') {
                // For true/false, normalize to 'true' or 'false' string
                $normalizedAnswer = ($correctAnswer === 'true' || $correctAnswer === true || $correctAnswer === '1' || $correctAnswer === 1) ? 'true' : 'false';
                $question->update([
                    'options' => $this->previewQuestion['options'] ?? [],
                    'correct_answer' => $normalizedAnswer,
                ]);
            } elseif ($questionType === 'multiple_choice') {
                // For multiple choice, store as array
                $question->update([
                    'options' => $this->previewQuestion['options'] ?? [],
                    'correct_answer' => [$correctAnswer],
                ]);
            } else {
                // For essay, short_answer, fill_blank - store as array
                $question->update([
                    'correct_answer' => [$correctAnswer],
                    'options' => null,
                ]);
            }

            $this->loadExamQuestions();
            $this->editingQuestionId = null;
            $this->previewQuestion = null;
            $this->showQuestionPreview = false;
            
            // Dispatch event to trigger UI refresh
            $this->dispatch('question-updated');

            $this->toastSuccess('Question updated successfully!', 'Success');
        } catch (\Exception $e) {
            $this->toastError('Error updating question: ' . $e->getMessage(), 'Error');
        }
    }

    public function selectAIQuestions(array $questionIds)
    {
        $this->selectedAIQuestions = $questionIds;
    }

    public function getAllAIQuestionIds()
    {
        return array_column($this->aiGeneratedQuestions, 'id');
    }

    public function addSelectedAIQuestions()
    {
        if (empty($this->selectedAIQuestions)) {
            $this->toastWarning('Please select at least one question.', 'No Selection');
            return;
        }

        foreach ($this->selectedAIQuestions as $questionId) {
            $this->addAIQuestion($questionId);
        }

        $this->selectedAIQuestions = [];
        $this->toastSuccess('Selected questions added to exam!', 'Success');
    }

    public function addAllAIQuestions()
    {
        if (empty($this->aiGeneratedQuestions)) return;
        
        foreach ($this->aiGeneratedQuestions as $question) {
            $this->saveAIQuestionToExam($question);
        }
        
        $this->selectedAIQuestions = [];
        $this->toastSuccess('All questions added to exam!', 'Success');
    }

    public function clearAIQuestions()
    {
        $this->aiGeneratedQuestions = [];
        $this->selectedAIQuestions = [];
        $this->generationError = false;
        $this->generationProgress = 0;
        $this->generationProgressMessage = '';
    }

    public function clearCorrectAnswer()
    {
        $this->manualQuestion['correct_answer'] = null;
    }

    private function resetManualQuestion()
    {
        $this->manualQuestion = [
            'question_text' => '',
            'question_type' => 'multiple_choice',
            'difficulty_level' => 'medium',
            'options' => ['', '', '', ''],
            'correct_answer' => null,
            'explanation' => '',
            'marks' => 1,
        ];
    }

    private function getOrCreateQuestionBank()
    {
        return QuestionBank::firstOrCreate(
            ['course_id' => $this->selectedCourse, 'name' => 'Default Question Bank'],
            ['created_by' => Auth::id()]
        );
    }

    public function publishExam()
    {
        // Validation: If "Release Results Immediately" is on, ensure no manual grading questions exist
        if ($this->exam->release_results_immediately) {
            $nonAutoGradableTypes = ['essay', 'short_answer', 'fill_blank'];
            $hasManualQuestions = $this->exam->questions()->whereIn('question_type', $nonAutoGradableTypes)->exists();

            if ($hasManualQuestions) {
                // Auto-disable the setting and inform the lecturer
                $this->exam->update(['release_results_immediately' => false]);
                $this->toastWarning('Immediate results setting disabled. This exam contains questions that require manual grading.', 'Note');
            }
        }

        $this->exam->update(['status' => 'published']);
        $this->toastSuccess('Exam published successfully!', 'Success');
    }

    public function previewAsStudent()
    {
        // Use updateOrCreate to handle existing preview sessions
        $session = ExamSession::updateOrCreate(
            [
                'exam_id' => $this->exam->id,
                'student_id' => Auth::id(),
            ],
            [
                'status' => 'in_progress',
                'started_at' => now(),
                'metadata' => ['is_preview' => true],
            ]
        );

        return redirect()->route('student.exam.delivery', $session);
    }

    public function render()
    {
        return view('livewire.lecturer-exam-questions');
    }
}
