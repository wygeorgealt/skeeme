<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Services\ExamRandomizationService;
use App\Services\AIGradingService;
use Livewire\Component;
use Livewire\Attributes\On;

class StudentExamDelivery extends Component
{
    public ExamSession $session;
    public Exam $exam;
    public int $currentQuestionIndex = 0;
    public array $answers = [];
    public int $timeRemaining = 0;
    public bool $showConfirmSubmit = false;
    public array $flaggedQuestions = [];
    public bool $showAnswerPreview = false;
    public bool $showKeyboardHelp = false;
    public bool $isFullscreen = false;
    public bool $isInExamMode = true;
    public bool $showReviewPage = false;
    
    // Randomization support
    public array $randomizedQuestions = [];
    public bool $isRandomized = false;
    private ExamRandomizationService $randomizationService;

    /**
     * Mount the component with exam session
     */
    /**
     * Mount the component with exam session
     */
    public function mount(ExamSession $session)
    {
        $this->session = $session;
        // Load exam details and questions with correct order if randomized
        $this->exam = $session->exam;
        $this->randomizationService = app(ExamRandomizationService::class);
        $this->isInExamMode = true;

        // Auto-start session if new
        if ($this->session->status === 'not_started') {
            $this->session->update([
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
            $this->session->refresh();
        }

        // If already submitted, redirect to results
        if (in_array($this->session->status, ['submitted', 'graded'])) {
            $this->redirect(route('student.exams.results', $this->session), navigate: true);
            return;
        }

        // Initialize randomization if enabled
        $this->initializeRandomization();

        // Load existing answers
        $this->answers = $this->session->examAnswers()
            ->pluck('student_answer', 'question_index')
            ->toArray();

        // Initial time check and state restoration
        $this->timeRemaining = $this->session->getTimeRemainingSeconds();
        
        if (isset($this->session->metadata['last_question_index'])) {
            $this->currentQuestionIndex = (int) $this->session->metadata['last_question_index'];
        }
    }

    /**
     * Initialize question randomization
     */
    private function initializeRandomization(): void
    {
        if (!$this->randomizationService->isRandomizationEnabled($this->exam)) {
            $this->isRandomized = false;
            return;
        }

        $this->isRandomized = true;
        $this->randomizedQuestions = $this->randomizationService->getRandomizedQuestions($this->session);
    }

    /**
     * Forced submission from client-side timer
     */
    public function forceSubmit(AIGradingService $aiGradingService)
    {
        $this->performSubmission($aiGradingService, true);
    }

    /**
     * Navigate to specific question
     */
    public function goToQuestion(int $index)
    {
        $questionCount = $this->isRandomized 
            ? count($this->randomizedQuestions) 
            : count($this->exam->questions);
            
        if ($index < 0 || $index >= $questionCount) {
            return;
        }

        $this->currentQuestionIndex = $index;
    }

    /**
     * Move to next question
     */
    public function nextQuestion()
    {
        $questionCount = $this->isRandomized 
            ? count($this->randomizedQuestions) 
            : count($this->exam->questions);
            
        if ($this->currentQuestionIndex < $questionCount - 1) {
            $this->currentQuestionIndex++;
        }
    }

    /**
     * Move to previous question
     */
    public function previousQuestion()
    {
        if ($this->currentQuestionIndex > 0) {
            $this->currentQuestionIndex--;
        }
    }

    /**
     * Save answer (autosave)
     */
    public function saveAnswer(int $index, $answer)
    {
        if (!$this->session->isActive()) {
            $this->dispatch('session-expired');
            return;
        }

        // Store answer locally
        $this->answers[$index] = $answer;

        // Get the original question index if randomized
        $questionIndexToSave = $index;
        if ($this->isRandomized && isset($this->randomizedQuestions[$index])) {
            $questionIndexToSave = $this->randomizedQuestions[$index]['original_index'];
        }

        // Persist to database (store original index)
        $this->session->examAnswers()->updateOrCreate(
            ['question_index' => $questionIndexToSave],
            [
                'student_answer' => $answer,
                'question_id' => $this->isRandomized ? $this->randomizedQuestions[$index]['question']['id'] : $this->exam->questions[$index]->id,
                'answered_at' => now(),
            ]
        );

        // Update questions answered count
        $answeredCount = collect($this->answers)->filter(fn($a) => !empty($a))->count();
        $this->session->update(['questions_answered' => $answeredCount]);

        $this->dispatch('answer-saved', question: $index);
    }

    /**
     * Heartbeat to keep session alive and sync state
     */
    public function heartbeat(int $currentIndex)
    {
        if (!$this->session->isActive()) return;

        $this->currentQuestionIndex = $currentIndex;
        
        $metadata = $this->session->metadata ?? [];
        $metadata['last_question_index'] = $currentIndex;
        $metadata['last_heartbeat'] = now();
        
        $this->session->update(['metadata' => $metadata]);
    }

    /**
     * Show confirm submit dialog
     */
    public function confirmSubmit()
    {
        $this->showConfirmSubmit = true;
    }

    /**
     * Cancel submit dialog
     */
    public function cancelSubmit()
    {
        $this->showConfirmSubmit = false;
    }

    /**
     * Go to review page
     */
    public function goToReview()
    {
        $this->showReviewPage = true;
        $this->dispatch('go-to-review');
    }

    /**
     * Return to exam from review
     */
    public function backToExam()
    {
        $this->showReviewPage = false;
    }

    /**
     * Submit exam
     */
    public function submit(AIGradingService $aiGradingService)
    {
        $this->performSubmission($aiGradingService);
    }

    /**
     * Core submission logic
     */
    private function performSubmission(AIGradingService $aiGradingService, bool $isAutoSubmit = false)
    {
        if (!$this->session->isActive()) {
            if (!$isAutoSubmit) {
                session()->flash('error', 'Exam session is no longer active');
            }
            return;
        }

        // Save any remaining answers
        foreach ($this->answers as $index => $answer) {
            $questionIndexToSave = $index;

            if ($this->isRandomized && isset($this->randomizedQuestions[$index])) {
                $questionIndexToSave = $this->randomizedQuestions[$index]['original_index'];
            }

            $this->session->examAnswers()->updateOrCreate(
                ['question_index' => $questionIndexToSave],
                [
                    'student_answer' => $answer, 
                    'question_id' => $this->isRandomized ? $this->randomizedQuestions[$index]['question']['id'] : $this->exam->questions[$index]->id,
                    'answered_at' => now(),
                ]
            );
        }

        $timeSpent = $this->session->started_at->diffInSeconds(now());
        $this->session->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'time_spent_seconds' => $timeSpent,
            'metadata' => array_merge(
                $this->session->metadata ?? [],
                ['was_randomized' => $this->isRandomized, 'is_auto_submit' => $isAutoSubmit]
            ),
        ]);

        // AI Grading Logic
        try {
            // First, trigger AI grading (pre-grading)
            $aiGradingService->gradeSession($this->session);
            
            // Check if results should be released immediately (redundant as AIGradingService does it now, but good to be explicit here)
            if ($this->exam->release_results_immediately) {
                $this->session->update(['status' => 'published']); 
            } else {
                $this->session->update(['status' => 'graded']);
            }
        } catch (\Exception $e) {
            \Log::error('AI Grading failed after submission: ' . $e->getMessage());
        }

        if ($isAutoSubmit) {
            $this->dispatch('exam-expired');
        } else {
            session()->flash('success', $this->exam->release_results_immediately 
                ? 'Exam submitted and graded successfully!' 
                : 'Exam submitted successfully! Awaiting lecturer review.');
        }
            
        $this->redirect(route('student.exams.results', $this->session), navigate: true);
    }

    /**
     * Get current question
     */
    public function getCurrentQuestion()
    {
        if ($this->isRandomized && isset($this->randomizedQuestions[$this->currentQuestionIndex])) {
            return $this->randomizedQuestions[$this->currentQuestionIndex]['question'];
        }

        return $this->exam->questions[$this->currentQuestionIndex] ?? null;
    }

    /**
     * Get current question options (randomized if applicable)
     */
    public function getCurrentQuestionOptions(): array
    {
        $question = $this->getCurrentQuestion();
        
        if (!$question) {
            return [];
        }

        if ($this->isRandomized && isset($this->randomizedQuestions[$this->currentQuestionIndex])) {
            return $this->randomizedQuestions[$this->currentQuestionIndex]['randomized_options'];
        }

        return $question->options ?? [];
    }

    /**
     * Get formatted time remaining
     */
    public function getFormattedTime(): string
    {
        $hours = intdiv($this->timeRemaining, 3600);
        $minutes = intdiv($this->timeRemaining % 3600, 60);
        $seconds = $this->timeRemaining % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentage(): int
    {
        return $this->session->getProgressPercentage();
    }

    /**
     * Check if question is answered
     */
    public function isQuestionAnswered(int $index): bool
    {
        return isset($this->answers[$index]) && !empty($this->answers[$index]);
    }

    /**
     * Toggle flag on current question
     */
    public function toggleFlagQuestion()
    {
        if (in_array($this->currentQuestionIndex, $this->flaggedQuestions)) {
            $this->flaggedQuestions = array_filter(
                $this->flaggedQuestions,
                fn($i) => $i !== $this->currentQuestionIndex
            );
        } else {
            $this->flaggedQuestions[] = $this->currentQuestionIndex;
        }

        $this->dispatch('question-flagged', index: $this->currentQuestionIndex);
    }

    /**
     * Check if question is flagged
     */
    public function isQuestionFlagged(int $index): bool
    {
        return in_array($index, $this->flaggedQuestions);
    }

    /**
     * Toggle answer preview modal
     */
    public function toggleAnswerPreview()
    {
        $this->showAnswerPreview = !$this->showAnswerPreview;
    }

    /**
     * Get all answered questions
     */
    public function getAnsweredQuestions(): array
    {
        return array_keys(array_filter($this->answers, fn($a) => !empty($a)));
    }

    /**
     * Get answer summary for preview
     */
    public function getAnswerSummary(): array
    {
        $summary = [];
        $questions = $this->isRandomized ? $this->randomizedQuestions : $this->exam->questions;
        
        foreach ($questions as $index => $questionData) {
            $question = $this->isRandomized ? $questionData['question'] : $questionData;
            $summary[$index] = [
                'question' => substr($question->question_text ?? $question['question_text'] ?? '', 0, 100),
                'answered' => $this->isQuestionAnswered($index),
                'answer' => substr($this->answers[$index] ?? '', 0, 50),
                'flagged' => $this->isQuestionFlagged($index),
            ];
        }
        return $summary;
    }

    /**
     * Get all questions formatted for client-side rendering
     */
    public function getAllQuestionsForClientSide(): array
    {
        $questions = [];
        $sourceQuestions = $this->isRandomized ? $this->randomizedQuestions : $this->exam->questions;
        
        foreach ($sourceQuestions as $index => $questionData) {
            $question = $this->isRandomized ? $questionData['question'] : $questionData;
            $options = $this->isRandomized 
                ? $questionData['randomized_options'] 
                : ($question->options ?? []);
            
            // Format options for client-side
            $formattedOptions = [];
            foreach ($options as $optIndex => $option) {
                if (is_array($option)) {
                    $formattedOptions[] = [
                        'id' => $option['id'] ?? $option['value'] ?? $optIndex,
                        'text' => $option['value'] ?? $option['text'] ?? $option['label'] ?? 'Option',
                    ];
                } else {
                    $formattedOptions[] = [
                        'id' => $optIndex,
                        'text' => (string) $option,
                    ];
                }
            }
            
            $questions[] = [
                'index' => $index,
                'type' => strtolower($question->question_type ?? 'unknown'),
                'text' => $question->question_text ?? '',
                'marks' => $question->marks ?? 1,
                'image_path' => $question->image_path ? \Storage::url($question->image_path) : null,
                'options' => $formattedOptions,
            ];
        }
        
        return $questions;
    }

    public function render()
    {
        $this->timeRemaining = $this->session->getTimeRemainingSeconds();

        $totalQuestions = $this->isRandomized 
            ? count($this->randomizedQuestions) 
            : count($this->exam->questions);

        return view('livewire.student-exam-delivery', [
            'currentQuestion' => $this->getCurrentQuestion(),
            'currentQuestionOptions' => $this->getCurrentQuestionOptions(),
            'totalQuestions' => $totalQuestions,
            'answeredCount' => count($this->getAnsweredQuestions()),
            'flaggedCount' => count($this->flaggedQuestions),
            'answerSummary' => $this->getAnswerSummary(),
            'isRandomized' => $this->isRandomized,
        ])->layout('layouts.exam');
    }
}

