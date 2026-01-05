<?php

namespace App\Livewire;

use App\Models\Course;
use App\Models\Note;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Services\AIQuestionGeneratorService;
use Livewire\Component;
use Illuminate\Support\Facades\Auth;

class LecturerAIQuestionGenerator extends Component
{
    public $selectedCourse = null;
    public $selectedNotes = [];
    public $courses = [];
    public $availableNotes = [];
    public $questionPools = [];
    public $selectedPool = null;
    public $generatedQuestions = [];
    public $isGenerating = false;
    public $generationProgress = 0;
    public $questionPrompt = ''; // Add custom question prompt

    // Generation configuration
    public $questionCount = 5;
    public $selectedBloomLevels = ['understand', 'apply', 'analyze'];
    public $selectedQuestionTypes = ['multiple_choice', 'essay'];
    public $difficultyDistribution = [
        'easy' => 30,
        'medium' => 50,
        'hard' => 20,
    ];

    public $showReviewModal = false;
    public $reviewingQuestion = null;
    public $reviewNotes = '';

    public function mount()
    {
        $this->loadCourses();
    }

    public function loadCourses()
    {
        $user = Auth::user();
        $this->courses = Course::whereHas('users', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->get();
    }

    public function updatedSelectedCourse()
    {
        if (!$this->selectedCourse) {
            $this->availableNotes = [];
            $this->questionPools = [];
            return;
        }

        // Load notes for this course that have been ingested
        $this->availableNotes = Note::where('course_id', $this->selectedCourse)
            ->where('lecturer_id', Auth::id())
            ->where('embedding_status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        // Load question pools for this course
        $this->questionPools = QuestionPool::where('course_id', $this->selectedCourse)
            ->where('lecturer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        $this->selectedNotes = [];
        $this->selectedPool = null;
    }

    public function toggleNoteSelection($noteId)
    {
        if (in_array($noteId, $this->selectedNotes)) {
            $this->selectedNotes = array_filter($this->selectedNotes, fn($id) => $id !== $noteId);
        } else {
            $this->selectedNotes[] = $noteId;
        }
    }

    public function toggleBloomLevel($level)
    {
        if (in_array($level, $this->selectedBloomLevels)) {
            $this->selectedBloomLevels = array_filter($this->selectedBloomLevels, fn($l) => $l !== $level);
        } else {
            $this->selectedBloomLevels[] = $level;
        }
    }

    public function toggleQuestionType($type)
    {
        if (in_array($type, $this->selectedQuestionTypes)) {
            $this->selectedQuestionTypes = array_filter($this->selectedQuestionTypes, fn($t) => $t !== $type);
        } else {
            $this->selectedQuestionTypes[] = $type;
        }
    }

    public function createNewPool()
    {
        if (!$this->selectedCourse) {
            $this->dispatch('toast', 'error', 'Please select a course first');
            return;
        }

        $poolName = 'AI Generated Questions - ' . date('M d, Y H:i');
        $pool = QuestionPool::create([
            'course_id' => $this->selectedCourse,
            'lecturer_id' => Auth::id(),
            'name' => $poolName,
            'description' => 'Questions generated from course notes using AI',
            'status' => 'draft',
        ]);

        $this->selectedPool = $pool->id;
        $this->updatedSelectedCourse();
        $this->dispatch('toast', 'success', 'New question pool created');
    }

    public function generateQuestions()
    {
        $validation = $this->validateGenerationInputs();
        if ($validation['errors']) {
            foreach ($validation['errors'] as $error) {
                $this->dispatch('toast', 'error', $error);
            }
            return;
        }

        $this->isGenerating = true;
        $this->generationProgress = 0;

        try {
            $pool = QuestionPool::find($this->selectedPool);
            $service = new AIQuestionGeneratorService();

            // Prepare configuration
            $config = [
                'count' => $this->questionCount,
                'bloom_levels' => $this->selectedBloomLevels,
                'types' => $this->selectedQuestionTypes,
                'difficulty' => [
                    'easy' => $this->difficultyDistribution['easy'] / 100,
                    'medium' => $this->difficultyDistribution['medium'] / 100,
                    'hard' => $this->difficultyDistribution['hard'] / 100,
                ],
                'with_review' => true,
                'prompt' => $this->questionPrompt, // Add custom prompt
            ];

            // Get selected notes
            $notes = Note::whereIn('id', $this->selectedNotes)->get();

            // Generate questions
            $this->generatedQuestions = $service->generate($notes, $pool, $config);
            $this->generationProgress = 100;

            // Update pool question count
            $pool->updateQuestionCount();

            $this->dispatch('toast', 'success', count($this->generatedQuestions) . ' questions generated successfully!');
            
        } catch (\Exception $e) {
            $this->dispatch('toast', 'error', 'Generation failed: ' . $e->getMessage());
        } finally {
            $this->isGenerating = false;
        }
    }

    public function validateGenerationInputs(): array
    {
        $errors = [];

        if (!$this->selectedCourse) {
            $errors[] = 'Please select a course';
        }

        if (empty($this->selectedNotes)) {
            $errors[] = 'Please select at least one note';
        }

        if (!$this->selectedPool) {
            $errors[] = 'Please select or create a question pool';
        }

        if ($this->questionCount < 1 || $this->questionCount > 50) {
            $errors[] = 'Question count must be between 1 and 50';
        }

        if (empty($this->selectedBloomLevels)) {
            $errors[] = 'Please select at least one Bloom\'s level';
        }

        if (empty($this->selectedQuestionTypes)) {
            $errors[] = 'Please select at least one question type';
        }

        return ['errors' => $errors];
    }

    public function reviewQuestion($questionId)
    {
        $this->reviewingQuestion = Question::find($questionId);
        $this->showReviewModal = true;
    }

    public function saveReview()
    {
        if (!$this->reviewingQuestion) {
            return;
        }

        $this->reviewingQuestion->update([
            'metadata' => array_merge(
                $this->reviewingQuestion->metadata ?? [],
                ['lecturer_review' => $this->reviewNotes]
            ),
        ]);

        $this->dispatch('toast', 'success', 'Review saved');
        $this->closeReviewModal();
    }

    public function publishQuestion($questionId)
    {
        $question = Question::find($questionId);
        if ($question) {
            $question->update(['status' => 'published']);
            $this->dispatch('toast', 'success', 'Question published');
            $this->loadGeneratedQuestions();
        }
    }

    public function rejectQuestion($questionId)
    {
        $question = Question::find($questionId);
        if ($question) {
            $question->delete();
            $this->dispatch('toast', 'success', 'Question removed');
            $this->loadGeneratedQuestions();
        }
    }

    public function regenerateQuestion($questionId)
    {
        $question = Question::find($questionId);
        if (!$question) {
            return;
        }

        try {
            $service = new AIQuestionGeneratorService();
            $config = [
                'bloom_levels' => [$question->bloom_level],
                'types' => [$question->question_type],
            ];

            $newQuestion = $service->regenerate($question, $config);

            if ($newQuestion) {
                $this->dispatch('toast', 'success', 'Question regenerated');
                $this->loadGeneratedQuestions();
            } else {
                $this->dispatch('toast', 'error', 'Failed to regenerate question');
            }
        } catch (\Exception $e) {
            $this->dispatch('toast', 'error', 'Regeneration error: ' . $e->getMessage());
        }
    }

    public function closeReviewModal()
    {
        $this->showReviewModal = false;
        $this->reviewingQuestion = null;
        $this->reviewNotes = '';
    }

    public function loadGeneratedQuestions()
    {
        if ($this->selectedPool) {
            $this->generatedQuestions = Question::where('question_pool_id', $this->selectedPool)
                ->where('status', 'draft')
                ->orderBy('created_at', 'desc')
                ->get();
        }
    }

    public function publishAllQuestions()
    {
        if (!$this->selectedPool) {
            return;
        }

        Question::where('question_pool_id', $this->selectedPool)
            ->where('status', 'draft')
            ->update(['status' => 'published']);

        $this->dispatch('toast', 'success', 'All questions published');
        $this->loadGeneratedQuestions();
    }

    public function discardAllDrafts()
    {
        if (!$this->selectedPool) {
            return;
        }

        Question::where('question_pool_id', $this->selectedPool)
            ->where('status', 'draft')
            ->delete();

        $this->dispatch('toast', 'success', 'Draft questions removed');
        $this->loadGeneratedQuestions();
    }

    public function render()
    {
        return view('livewire.lecturer-ai-question-generator', [
            'bloomLevelOptions' => [
                'remember' => 'Remember',
                'understand' => 'Understand',
                'apply' => 'Apply',
                'analyze' => 'Analyze',
                'evaluate' => 'Evaluate',
                'create' => 'Create',
            ],
            'questionTypeOptions' => [
                'multiple_choice' => 'Multiple Choice',
                'essay' => 'Essay',
                'true_false' => 'True/False',
            ],
        ]);
    }
}
