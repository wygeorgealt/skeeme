<?php

namespace App\Livewire;

use App\Models\AIGrading;
use App\Models\ExamSession;
use App\Services\AIGradingService;
use App\Services\NotificationService;
use Livewire\Component;
use Livewire\WithPagination;

class LecturerGradingDashboard extends Component
{
    use WithPagination;

    public ExamSession $session;
    public AIGradingService $gradingService;

    public $selectedGrading = null;
    public $filterConfidence = null;
    public $filterStatus = 'pending_review';
    public $sortBy = 'confidence_score';
    public $sortDirection = 'asc';
    public $searchTerm = '';

    public $showOverrideModal = false;
    public $overrideMarks = null;
    public $overrideReason = '';
    public $gradingFeedback = '';
    public $showFeedbackModal = false;
    public $showGradeDistribution = false;
    public $gradingRubrics = [];
    public $selectedRubric = null;
    public $batchSelectedIds = [];

    protected $listeners = ['refreshGradings'];

    public function mount(ExamSession $session, AIGradingService $gradingService)
    {
        $this->authorize('view', $session->exam);
        $this->session = $session;
        $this->gradingService = $gradingService;
    }

    public function render()
    {
        $gradings = $this->getFilteredGradings();
        $statistics = $this->gradingService->getSessionStatistics($this->session);

        return view('livewire.lecturer-grading-dashboard', [
            'gradings' => $gradings,
            'statistics' => $statistics,
            'selectedGrading' => $this->selectedGrading,
        ]);
    }

    private function getFilteredGradings()
    {
        $query = AIGrading::where('exam_session_id', $this->session->id);

        // Filter by status
        if ($this->filterStatus) {
            $query->where('status', $this->filterStatus);
        }

        // Filter by confidence threshold
        if ($this->filterConfidence === 'low') {
            $query->where('confidence_score', '<', 50);
        } elseif ($this->filterConfidence === 'medium') {
            $query->whereBetween('confidence_score', [50, 75]);
        } elseif ($this->filterConfidence === 'high') {
            $query->whereBetween('confidence_score', [75, 90]);
        } elseif ($this->filterConfidence === 'very_high') {
            $query->where('confidence_score', '>=', 90);
        }

        // Search by student name or answer content
        if ($this->searchTerm) {
            $query->whereHas('examAnswer', function ($q) {
                $q->whereHas('examSession', function ($subQ) {
                    $subQ->whereHas('student', function ($studentQ) {
                        $studentQ->where('name', 'like', '%' . $this->searchTerm . '%');
                    });
                })->orWhere('student_answer', 'like', '%' . $this->searchTerm . '%');
            });
        }

        // Sort
        if ($this->sortBy === 'confidence_score') {
            $query->orderBy('confidence_score', $this->sortDirection);
        } elseif ($this->sortBy === 'created_at') {
            $query->orderBy('created_at', $this->sortDirection);
        } elseif ($this->sortBy === 'marks_awarded') {
            $query->orderBy('marks_awarded', $this->sortDirection);
        }

        return $query->paginate(10);
    }

    public function selectGrading(AIGrading $grading)
    {
        $this->selectedGrading = $grading->load('examAnswer.examSession.student');
        $this->showOverrideModal = false;
        $this->overrideMarks = $grading->marks_awarded;
        $this->overrideReason = '';
    }

    public function approveGrading()
    {
        if (!$this->selectedGrading) {
            return;
        }

        $grading = AIGrading::find($this->selectedGrading->id);
        $grading->approve(auth()->id());

        $this->dispatch('notify', [
            'type' => 'success',
            'message' => 'Grading approved successfully',
        ]);

        $this->selectedGrading = null;
        $this->refreshGradings();
    }

    public function rejectGrading()
    {
        if (!$this->selectedGrading) {
            return;
        }

        $grading = AIGrading::find($this->selectedGrading->id);
        $grading->reject('Rejected for manual grading by lecturer', auth()->id());

        $this->dispatch('notify', [
            'type' => 'info',
            'message' => 'Grading rejected. Please grade manually.',
        ]);

        $this->selectedGrading = null;
        $this->refreshGradings();
    }

    public function openOverrideModal()
    {
        $this->showOverrideModal = true;
    }

    public function submitOverride()
    {
        if (!$this->selectedGrading) {
            return;
        }

        $this->validate([
            'overrideMarks' => 'required|numeric|min:0',
            'overrideReason' => 'required|string|min:10',
        ]);

        $grading = AIGrading::find($this->selectedGrading->id);
        $grading->override(
            (float) $this->overrideMarks,
            $this->overrideReason,
            auth()->id()
        );

        $this->dispatch('notify', [
            'type' => 'success',
            'message' => 'Marks overridden successfully',
        ]);

        $this->selectedGrading = null;
        $this->showOverrideModal = false;
        $this->overrideMarks = null;
        $this->overrideReason = '';
        $this->refreshGradings();
    }

    public function batchApprove()
    {
        $pending = AIGrading::where('exam_session_id', $this->session->id)
            ->where('status', 'pending_review');

        if ($this->filterConfidence === 'very_high') {
            $pending->where('confidence_score', '>=', 90);
        }

        $count = $pending->update(['status' => 'approved', 'reviewed_by' => auth()->id()]);

        $this->dispatch('notify', [
            'type' => 'success',
            'message' => "$count gradings approved",
        ]);

        $this->refreshGradings();
    }

    public function confirmFinalGrade()
    {
        $this->authorize('view', $this->session->exam);

        // Calculate final score
        $score = $this->session->answers()->sum('marks_obtained');
        
        $this->session->update([
            'score' => $score,
            'status' => 'published', // Release to student
            'graded_at' => now(),
        ]);

        // Send notification to student
        $student = $this->session->student;
        $exam = $this->session->exam;
        $gradingPercentage = ($score / ($exam->total_marks ?: 100)) * 100;
        $grade = $this->calculateGrade($gradingPercentage);

        // Database notification
        app(NotificationService::class)->sendGradeReleased(
            $student, 
            $exam, 
            (float) $score, 
            $grade
        );

        // Real-time toast for online student
        $this->dispatch('notificationBroadcast', [
            'userIds' => [$student->id],
            'type' => 'success',
            'title' => 'Grade Released',
            'message' => "Your grade for {$exam->title} is now available.",
            'action' => ['label' => 'View Grades', 'url' => route('student.grades')]
        ]);

        // Create or update Grade record
        \App\Models\Grade::updateOrCreate(
            [
                'student_id' => $student->id,
                'course_id' => $exam->course_id,
                'exam_id' => $exam->id,
            ],
            [
                'score' => $score,
                'grade' => $grade,
                'credit_units' => $exam->course->credit_units ?? 3, // Snapshot credits
                'graded_at' => now(),
            ]
        );

        // Calculate and Update GPA
        app(\App\Services\GPACalculationService::class)->updateStudentGPA($student);

        $this->dispatch('notify', [
            'type' => 'success',
            'message' => "Exam grade for {$student->name} confirmed and released! GPA Updated.",
        ]);

        return redirect()->route('lecturer.exams.grading', $this->session->exam);
    }

    private function calculateGrade($percentage)
    {
        if ($percentage >= 70) return 'A';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 45) return 'D';
        return 'F';
    }

    public function refreshGradings()
    {
        $this->resetPage();
    }

    public function setSortBy($column)
    {
        if ($this->sortBy === $column) {
            $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortBy = $column;
            $this->sortDirection = 'asc';
        }
    }

    public function resetFilters()
    {
        $this->filterConfidence = null;
        $this->filterStatus = 'pending_review';
        $this->sortBy = 'confidence_score';
        $this->sortDirection = 'asc';
        $this->searchTerm = '';
        $this->resetPage();
    }

    public function getConfidenceRating($confidence)
    {
        if ($confidence >= 90) {
            return ['rating' => 'Very High', 'color' => 'bg-green-100 text-green-800'];
        } elseif ($confidence >= 75) {
            return ['rating' => 'High', 'color' => 'bg-blue-100 text-blue-800'];
        } elseif ($confidence >= 50) {
            return ['rating' => 'Medium', 'color' => 'bg-yellow-100 text-yellow-800'];
        } else {
            return ['rating' => 'Low', 'color' => 'bg-red-100 text-red-800'];
        }
    }

    public function downloadGradingReport()
    {
        $gradings = AIGrading::where('exam_session_id', $this->session->id)->get();
        $stats = $this->gradingService->getSessionStatistics($this->session);

        // Generate CSV
        $csv = "Student,Question,Marks Awarded,Confidence,Status,Grading Method\n";

        foreach ($gradings as $grading) {
            $csv .= sprintf(
                "\"%s\",\"%s\",%s,%s,\"%s\",\"%s\"\n",
                $grading->examAnswer->examSession->student->name,
                substr($grading->examAnswer->question_id, 0, 8),
                $grading->marks_awarded,
                $grading->confidence_score,
                $grading->status,
                $grading->grading_method
            );
        }

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'grading-report-' . $this->session->id . '.csv');
    }

    /**
     * Open feedback modal for selected grading
     */
    public function openFeedbackModal()
    {
        if (!$this->selectedGrading) {
            return;
        }
        $this->gradingFeedback = $this->selectedGrading->feedback ?? '';
        $this->showFeedbackModal = true;
    }

    /**
     * Save feedback for grading
     */
    public function saveFeedback()
    {
        if (!$this->selectedGrading) {
            return;
        }

        $this->validate([
            'gradingFeedback' => 'required|string|min:5',
        ]);

        $grading = AIGrading::find($this->selectedGrading->id);
        $grading->update([
            'feedback' => $this->gradingFeedback,
            'feedback_provided_by' => auth()->id(),
            'feedback_provided_at' => now(),
        ]);

        $this->dispatch('notify', [
            'type' => 'success',
            'message' => 'Feedback saved successfully',
        ]);

        $this->selectedGrading->refresh();
        $this->showFeedbackModal = false;
    }

    /**
     * Toggle grade distribution view
     */
    public function toggleGradeDistribution()
    {
        $this->showGradeDistribution = !$this->showGradeDistribution;
    }

    /**
     * Get grade distribution data for chart
     */
    public function getGradeDistribution(): array
    {
        $gradings = AIGrading::where('exam_session_id', $this->session->id)->get();
        $distribution = [];

        foreach ($gradings as $grading) {
            $marks = (int) $grading->marks_awarded;
            if (!isset($distribution[$marks])) {
                $distribution[$marks] = 0;
            }
            $distribution[$marks]++;
        }

        ksort($distribution);
        return $distribution;
    }

    /**
     * Get average grade
     */
    public function getAverageGrade(): float
    {
        $gradings = AIGrading::where('exam_session_id', $this->session->id)->get();
        if ($gradings->isEmpty()) {
            return 0;
        }
        return round($gradings->avg('marks_awarded'), 2);
    }

    /**
     * Get grading rubrics for quality scoring
     */
    public function getGradingRubrics(): array
    {
        return [
            'clarity' => ['name' => 'Clarity', 'levels' => ['Unclear', 'Somewhat Clear', 'Clear', 'Very Clear']],
            'completeness' => ['name' => 'Completeness', 'levels' => ['Incomplete', 'Partially Complete', 'Complete', 'Comprehensive']],
            'accuracy' => ['name' => 'Accuracy', 'levels' => ['Inaccurate', 'Mostly Accurate', 'Accurate', 'Highly Accurate']],
            'reasoning' => ['name' => 'Reasoning', 'levels' => ['Weak', 'Adequate', 'Good', 'Excellent']],
        ];
    }

    /**
     * Toggle batch selection for bulk operations
     */
    public function toggleBatchSelect($gradingId)
    {
        if (in_array($gradingId, $this->batchSelectedIds)) {
            $this->batchSelectedIds = array_filter(
                $this->batchSelectedIds,
                fn($id) => $id !== $gradingId
            );
        } else {
            $this->batchSelectedIds[] = $gradingId;
        }
    }

    /**
     * Batch approve selected gradings
     */
    public function batchApproveSelected()
    {
        if (empty($this->batchSelectedIds)) {
            $this->dispatch('notify', [
                'type' => 'warning',
                'message' => 'Please select gradings to approve',
            ]);
            return;
        }

        $count = AIGrading::whereIn('id', $this->batchSelectedIds)
            ->update(['status' => 'approved', 'reviewed_by' => auth()->id()]);

        $this->batchSelectedIds = [];
        $this->dispatch('notify', [
            'type' => 'success',
            'message' => "$count gradings approved",
        ]);

        $this->refreshGradings();
    }

    /**
     * Select all visible gradings
     */
    public function selectAll()
    {
        $gradings = $this->getFilteredGradings();
        $this->batchSelectedIds = $gradings->pluck('id')->toArray();
    }

    /**
     * Clear all selections
     */
    public function clearSelection()
    {
        $this->batchSelectedIds = [];
    }
}