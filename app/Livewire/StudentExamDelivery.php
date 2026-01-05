<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Services\ExamRandomizationService;
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
    
    // Randomization support
    public array $randomizedQuestions = [];
    public bool $isRandomized = false;
    private ExamRandomizationService $randomizationService;

    /**
     * Mount the component with exam session
     */
    public function mount(ExamSession $session)
    {
        $this->session = $session;
        $this->exam = $session->exam;
        $this->randomizationService = app(ExamRandomizationService::class);
        $this->isInExamMode = true;

        // Check if exam has expired
        if ($this->session->isActive() && $this->session->hasExpired()) {
            $this->session->submit();
            $this->redirect(route('student.exams.results', $this->session), navigate: true);
        }

        // Initialize randomization if enabled
        $this->initializeRandomization();

        // Load existing answers
        $this->answers = $this->session->answers()
            ->pluck('student_answer', 'question_index')
            ->toArray();

        // Start the timer
        $this->updateTimeRemaining();
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
     * Update time remaining every second
     */
    #[On('timer')]
    public function updateTimeRemaining()
    {
        if (!$this->session->isActive()) {
            return;
        }

        // Handle untimed exams
        if (!$this->exam->duration) {
            $this->timeRemaining = 999999; // Arbitrary high number for frontend
            return;
        }

        $this->timeRemaining = $this->session->getTimeRemainingSeconds();

        if ($this->timeRemaining <= 0) {
            $this->session->submit();
            $this->dispatch('exam-expired');
            $this->redirect(route('student.exams.results', $this->session), navigate: true);
        }
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
    public function saveAnswer($answer)
    {
        if (!$this->session->isActive()) {
            $this->dispatch('session-expired');
            return;
        }

        // Store answer using the current question index
        $this->answers[$this->currentQuestionIndex] = $answer;

        // Get the original question index if randomized
        $questionIndexToSave = $this->currentQuestionIndex;
        if ($this->isRandomized && isset($this->randomizedQuestions[$this->currentQuestionIndex])) {
            $questionIndexToSave = $this->randomizedQuestions[$this->currentQuestionIndex]['original_index'];
        }

        // Persist to database (store original index)
        $this->session->answers()->updateOrCreate(
            ['question_index' => $questionIndexToSave],
            [
                'student_answer' => $answer,
                'answered_at' => now(),
            ]
        );

        // Update questions answered count
        $answeredCount = collect($this->answers)->filter(fn($a) => !empty($a))->count();
        $this->session->update(['questions_answered' => $answeredCount]);

        $this->dispatch('answer-saved', question: $this->currentQuestionIndex);
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
     * Submit exam
     */
    public function submit()
    {
        if (!$this->session->isActive()) {
            session()->flash('error', 'Exam session is no longer active');
            return;
        }

        // Save any remaining answers
        foreach ($this->answers as $index => $answer) {
            $questionIndexToSave = $index;

            if ($this->isRandomized && isset($this->randomizedQuestions[$index])) {
                $questionIndexToSave = $this->randomizedQuestions[$index]['original_index'];
            }

            $this->session->answers()->updateOrCreate(
                ['question_index' => $questionIndexToSave],
                [
                    'student_answer' => $answer, 
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
                ['was_randomized' => $this->isRandomized]
            ),
        ]);

        session()->flash('success', 'Exam submitted successfully! Awaiting grading.');
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

    public function render()
    {
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

