<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Exam;
use App\Models\Course;
use App\Models\ExamSession;
use Illuminate\Support\Facades\Auth;

class AdminDataStorage extends Component
{
    use WithPagination;

    // Filter properties
    public $search = '';
    public $selectedCourse = '';
    public $dateFrom = '';
    public $dateTo = '';
    
    // View state
    public $viewMode = 'exams'; // 'exams' or 'results'
    
    // Selection state for drill-down
    public $selectedExamId = null;
    public $selectedResultId = null;
    
    // Modal visibility
    public $showExamModal = false;
    public $showResultModal = false;
    public $showDeleteResultModal = false;
    public $resultIdToDelete = null;

    protected $queryString = [
        'search' => ['except' => ''],
        'selectedCourse' => ['except' => ''],
        'dateFrom' => ['except' => ''],
        'dateTo' => ['except' => ''],
        'viewMode' => ['except' => 'exams'],
    ];

    public function updating()
    {
        $this->resetPage();
    }

    public function setViewMode($mode)
    {
        $this->viewMode = $mode;
        $this->resetFilters();
    }

    public function resetFilters()
    {
        $this->reset(['search', 'selectedCourse', 'dateFrom', 'dateTo', 'selectedExamId', 'selectedResultId', 'showExamModal', 'showResultModal']);
        $this->resetPage();
    }

    public function selectExam($id)
    {
        $this->selectedExamId = (string)$id;
        $this->selectedResultId = null;
        $this->showExamModal = true;
        $this->showResultModal = false;
    }

    public function selectResult($id)
    {
        $this->selectedResultId = (string)$id;
        $this->selectedExamId = null;
        $this->showResultModal = true;
        $this->showExamModal = false;
    }

    public function closeDetail()
    {
        $this->showExamModal = false;
        $this->showResultModal = false;
        $this->showDeleteResultModal = false;
    }

    public function confirmDeleteResult($id)
    {
        $this->resultIdToDelete = $id;
        $this->showDeleteResultModal = true;
    }

    public function deleteResult()
    {
        if (!$this->resultIdToDelete) return;

        $session = ExamSession::find($this->resultIdToDelete);
        if ($session) {
            // Delete associated grade if it exists
            \App\Models\Grade::where([
                'student_id' => $session->student_id,
                'exam_id' => $session->exam_id,
                'course_id' => $session->exam->course_id,
            ])->delete();

            // Delete answers and session
            $session->examAnswers()->delete();
            $session->delete();

            // Refresh student GPA
            app(\App\Services\GPACalculationService::class)->updateStudentGPA($session->student);

            $this->dispatch('notify', [
                'type' => 'success',
                'message' => 'Student result and grade deleted successfully.',
            ]);
        }

        $this->showDeleteResultModal = false;
        $this->resultIdToDelete = null;
        $this->selectedResultId = null;
        $this->showResultModal = false;
    }

    /**
     * Safely convert any value to a string for display.
     */
    public function safeString($val, $glue = ', ')
    {
        if (is_scalar($val)) return (string)$val;
        if ($val instanceof \Illuminate\Support\Collection) $val = $val->all();
        if (is_array($val)) return implode($glue, array_filter($val, 'is_scalar'));
        if (is_object($val) && method_exists($val, '__toString')) return (string)$val;
        return 'N/A';
    }

    public function render()
    {
        $schoolId = Auth::user()->school_id;
        $courses = Course::where('school_id', $schoolId)->orderBy('name')->get();

        $data = [];

        if ($this->viewMode === 'exams') {
            $data = Exam::whereHas('course', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            // Only show exams that have at least one graded or published session
            ->whereHas('sessions', function ($query) {
                $query->whereIn('status', ['graded', 'published']);
            })
            ->when($this->search, function ($query) {
                $query->where('title', 'like', '%' . $this->search . '%');
            })
            ->when($this->selectedCourse, function ($query) {
                $query->where('course_id', $this->selectedCourse);
            })
            ->when($this->dateFrom, function ($query) {
                $query->whereDate('exam_date', '>=', $this->dateFrom);
            })
            ->when($this->dateTo, function ($query) {
                $query->whereDate('exam_date', '<=', $this->dateTo);
            })
            ->with(['course', 'lecturer'])
            // Only count graded or published sessions as attempts
            ->withCount(['sessions as attempts' => function ($query) {
                $query->whereIn('status', ['graded', 'published']);
            }])
            ->orderBy('exam_date', 'desc')
            ->paginate(15);
        } else {
            $data = ExamSession::whereHas('exam.course', function ($query) use ($schoolId) {
                $query->where('school_id', $schoolId);
            })
            // Only show graded or published results
            ->whereIn('status', ['graded', 'published'])
            ->when($this->search, function ($query) {
                $query->where(function($master) {
                    $master->whereHas('student', function ($q) {
                        $q->where('first_name', 'like', '%' . $this->search . '%')
                          ->orWhere('last_name', 'like', '%' . $this->search . '%');
                    })->orWhereHas('exam', function ($q) {
                        $q->where('title', 'like', '%' . $this->search . '%');
                    });
                });
            })
            ->when($this->selectedCourse, function ($query) {
                $query->whereHas('exam', function ($q) {
                    $q->where('course_id', $this->selectedCourse);
                });
            })
            ->when($this->dateFrom, function ($query) {
                $query->whereDate('submitted_at', '>=', $this->dateFrom);
            })
            ->when($this->dateTo, function ($query) {
                $query->whereDate('submitted_at', '<=', $this->dateTo);
            })
            ->with(['exam.course', 'student'])
            ->orderBy('submitted_at', 'desc')
            ->paginate(15);
        }

        // Fetch detail data if selected
        $selectedExam = null;
        if ($this->selectedExamId) {
            $selectedExam = Exam::with(['course', 'lecturer', 'sessions.student', 'examQuestions.question'])
                ->find($this->selectedExamId);
        }

        $selectedResult = null;
        if ($this->selectedResultId) {
            $selectedResult = ExamSession::with(['exam.course', 'student', 'examAnswers', 'exam.examQuestions.question'])
                ->find($this->selectedResultId);
        }

        return view('livewire.admin-data-storage', [
            'items' => $data,
            'courses' => $courses,
            'selectedExam' => $selectedExam,
            'selectedResult' => $selectedResult,
        ]);
    }
}
