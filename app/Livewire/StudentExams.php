<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\AIGrading;
use Carbon\Carbon;

class StudentExams extends Component
{
    use WithPagination;

    public $upcomingExams = [];
    public $activeExams = [];
    public $completedExams = [];
    public $selectedExamSession = null;
    public $showDetailsModal = false;
    public $activeTab = 'active'; // active, completed
    public $filterSort = 'date'; // date, status, grade

    protected $listeners = ['examGraded' => 'refreshExams'];

    public function mount(): void
    {
        $this->loadExams();
    }

    public function loadExams(): void
    {
        $user = Auth::user();

        // Get all exams student is enrolled in, eager load course, lecturer, and student's sessions
        $allExams = Exam::whereHas('course.enrollments', function($query) use ($user) {
            $query->where('student_id', $user->id);
        })
        ->with([
            'course', 
            'lecturer', 
            'sessions' => function($query) use ($user) {
                $query->where('student_id', $user->id)->latest('created_at');
            }
        ])
        ->get();

        // Categorize by status
        $this->upcomingExams = [];
        $this->activeExams = [];
        $this->completedExams = [];

        foreach ($allExams as $exam) {
            // Get the latest session from the eager-loaded collection
            $session = $exam->sessions->first();

            $examData = [
                'id' => $exam->id,
                'title' => $exam->title,
                'course' => $exam->course?->name,
                'course_code' => $exam->course?->code,
                'lecturer' => $exam->lecturer?->full_name,
                'exam_date' => $exam->exam_date,
                'duration' => $exam->duration,
                'total_marks' => $exam->total_marks,
                'session' => $session,
                'days_until' => $exam->exam_date ? now()->diffInDays($exam->exam_date, false) : null,
            ];

            if ($session) {
                // Session exists
                if ($session->status === 'in_progress' || $session->status === 'not_started') {
                    $this->activeExams[] = $examData;
                } elseif (in_array($session->status, ['submitted', 'graded', 'appeal'])) {
                    $this->completedExams[] = $examData;
                }
            } else {
                // No session yet
                if ($exam->status === 'published') {
                    if ($exam->exam_date && $exam->exam_date->isAfter(now()->endOfDay())) {
                        // $this->upcomingExams[] = $examData; // Hidden by request (future days)
                    } elseif (!$exam->end_date || $exam->end_date > now()) {
                        // It's published and date has passed (or is null/flexible) AND not ended -> It's Active/Ready
                        $this->activeExams[] = $examData;
                    }
                    // Else: Exam has ended and not started -> Hidden (or move to missed)
                }
            }
        }

        // Sort by date
        usort($this->upcomingExams, fn($a, $b) => $a['exam_date']?->timestamp <=> $b['exam_date']?->timestamp);
        usort($this->completedExams, fn($a, $b) => $b['session']?->submitted_at?->timestamp <=> $a['session']?->submitted_at?->timestamp);
    }

    public function setActiveTab($tab): void
    {
        $this->activeTab = $tab;
    }

    public function refreshExams(): void
    {
        $this->loadExams();
        $this->dispatch('notify', ...['message' => 'Exams refreshed']);
    }

    public function showExamDetails(?ExamSession $session): void
    {
        if ($session) {
            $this->selectedExamSession = $session->load('exam', 'student');
            $this->showDetailsModal = true;
        }
    }

    public function closeModal(): void
    {
        $this->showDetailsModal = false;
        $this->selectedExamSession = null;
    }

    public function startExam($examId): void
    {
        $exam = Exam::find($examId);
        if (!$exam) return;

        $session = ExamSession::firstOrCreate(
            [
                'exam_id' => $exam->id,
                'student_id' => Auth::id(),
            ],
            [
                'status' => 'not_started',
            ]
        );

        $this->redirect(route('student.exam.delivery', $session->id));
    }

    public function resumeExam($sessionId): void
    {
        $session = ExamSession::find($sessionId);
        if ($session && in_array($session->status, ['in_progress', 'not_started'])) {
            $this->redirect(route('student.exam.delivery', $session->id));
        }
    }

    public function reviewResults($sessionId): void
    {
        $this->redirect(route('student.exams.results', $sessionId));
    }

    public function render()
    {
        return view('livewire.student-exams', [
            'upcomingExams' => $this->upcomingExams,
            'activeExams' => $this->activeExams,
            'completedExams' => $this->completedExams,
            'selectedExamSession' => $this->selectedExamSession,
            'showDetailsModal' => $this->showDetailsModal,
        ]);
    }
}
