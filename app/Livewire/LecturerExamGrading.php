<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamAnswer;
use App\Services\GradingService;
use Livewire\Component;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Computed;
use App\Traits\HasToastNotifications;

class LecturerExamGrading extends Component
{
    use HasToastNotifications;

    public Exam $exam;
    
    // Selection state
    public $selectedSessionId = null;
    public $filterStatus = 'all'; // all, submitted, graded, published

    // Grading Service
    // We inject in methods where needed or use app() helper if preferred in Livewire 
    // but constructor injection works in newer Livewire versions if handled correctly, 
    // though property injection for services is often safer or use app() in actions.

    public function mount(Exam $exam)
    {
        $this->exam = $exam;
    }

    #[Computed]
    public function sessions()
    {
        return $this->exam->sessions()
            ->when($this->filterStatus !== 'all', function ($query) {
                $query->where('status', $this->filterStatus);
            })
            ->whereIn('status', ['submitted', 'graded', 'published']) // Only show actionable sessions
            ->with(['student'])
            ->latest('submitted_at')
            ->get();
    }

    #[Computed]
    public function selectedSession()
    {
        if (!$this->selectedSessionId) return null;

        return ExamSession::with(['examAnswers.question', 'examAnswers.aiGrading', 'student', 'exam.questions'])
            ->find($this->selectedSessionId);
    }

    public function selectSession($sessionId)
    {
        $this->selectedSessionId = $sessionId;
    }

    public function closeSession()
    {
        $this->selectedSessionId = null;
    }

    /**
     * Trigger Auto/AI Grading for a specific session
     */
    public function autoGradeSession($sessionId, GradingService $gradingService)
    {
        $session = ExamSession::find($sessionId);
        
        if (!$session) return;

        try {
            $gradingService->gradeSession($session);
            $this->toastSuccess('Session auto-graded successfully!', 'Grading Complete');
            
            // Refund/Refresh view
            if ($this->selectedSessionId == $sessionId) {
                unset($this->selectedSession); 
                unset($this->sessions);
            }

        } catch (\Exception $e) {
            $this->toastError('Failed to grade session: ' . $e->getMessage(), 'Error');
        }
    }

    /**
     * Update a specific answer's mark manually
     */
    public function updateMark($answerId, $mark, $feedback = null)
    {
        $answer = ExamAnswer::find($answerId);
        if (!$answer) return;

        $answer->update([
            'marks_obtained' => $mark,
            'feedback' => $feedback ?? $answer->feedback,
        ]);
        
        // Recalculate total score for the session
        $session = $answer->examSession;
        $total = $session->examAnswers()->sum('marks_obtained');
        
        $session->update([
            'score' => $total,
            'status' => 'graded',
            'graded_at' => now(),
        ]);

        $this->toastSuccess('Mark updated. Remember to publish results when finished.', 'Saved');
    }

    /**
     * Publish results for a session
     */
    public function publishResult($sessionId)
    {
        $session = ExamSession::find($sessionId);
        if ($session) {
            $session->update([
                'status' => 'published',
                'graded_at' => now(),
            ]);

            // Create/Update Grade and GPA
            $this->finalizeGrade($session);

            $this->toastSuccess('Result published to student.', 'Published');
        }
    }

    /**
     * Publish ALL graded sessions
     */
    public function publishAllGraded()
    {
        $sessions = $this->exam->sessions()->where('status', 'graded')->get();
        $count = $sessions->count();

        foreach ($sessions as $session) {
            $session->update([
                'status' => 'published',
                'graded_at' => now(),
            ]);
            $this->finalizeGrade($session);
        }

        $this->toastSuccess("$count results published.", 'Batch Publish');
    }

    protected function finalizeGrade(ExamSession $session)
    {
        app(GradingService::class)->syncSessionResults($session);
    }

    // Finalize grade and update GPA on explicit publish

    public function render()
    {
        return view('livewire.lecturer-exam-grading');
    }
}
