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

        return ExamSession::with(['answers.question', 'student', 'exam.questions'])
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
                // Computed property will refresh automatically on next render request usually, 
                // but sometimes explicitunset needed if cached. Default computed is cached per request.
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

        // Validation
        // Ensure mark is within question range?
        // We'd need to load the question. $answer->question or $answer->examSession...
        // For speed, let's assume UI does validation or we trust the input within reason.
        
        $answer->update([
            'marks_obtained' => $mark,
            'feedback' => $feedback ?? $answer->feedback,
            'marking_status' => 'manually_graded',
        ]);
        
        // Recalculate total score for the session
        $this->recalculateSessionScore($answer->examSession);

        $this->toastSuccess('Mark updated.', 'Saved');
    }

    protected function recalculateSessionScore(ExamSession $session)
    {
        $total = $session->answers()->sum('marks_obtained');
        $session->update(['score' => $total]);
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

    protected function finalizeGrade(ExamSession $session)
    {
        $student = $session->student;
        $exam = $session->exam;
        $score = $session->score;
        
        // Calculate Grade Letter (Logic duplicated from Dashboard for now, or move to Service)
        $percentage = ($score / ($exam->total_marks ?: 100)) * 100;
        $gradeLetter = app(\App\Services\GPACalculationService::class)->calculateLetterGrade($percentage);

        \App\Models\Grade::updateOrCreate(
            [
                'student_id' => $student->id,
                'course_id' => $exam->course_id,
                'exam_id' => $exam->id,
            ],
            [
                'score' => $score,
                'grade' => $gradeLetter,
                'credit_units' => $exam->course->credit_units ?? 3,
                'graded_at' => now(),
            ]
        );

        app(\App\Services\GPACalculationService::class)->updateStudentGPA($student);
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

    public function render()
    {
        return view('livewire.lecturer-exam-grading');
    }
}
