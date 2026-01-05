<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Exam;
use App\Models\Grade;
use App\Models\SocialAccount;
use App\Services\CalendarSyncService;

use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Url;

class LecturerExams extends Component
{
    public $courses = [];
    #[Url]
    public $selectedCourse = '';
    // public $exams; // Removed
    public $showCreateForm = false;
    public $showDeleteModal = false;
    #[Locked]
    public $examIdToDelete = null;
    public $editingExam = null;
    public $newExam = [
        'title' => '',
        'description' => '',
        'exam_date' => '',
        'duration' => '',
        'total_marks' => '',
        'passing_marks' => '',
        'questions' => [],
        'status' => 'draft',
        'randomize_questions' => true,
        'randomize_options' => true,
        'category' => 'exam',
        'sync_to_calendar' => false,
    ];
    public $hasLinkedGoogle = false;
    public $newQuestion = [
        'question' => '',
        'options' => ['', '', '', ''],
        'correct_answer' => '',
        'marks' => 1,
    ];

    public function mount()
    {
        $this->loadCourses();
        $this->checkGoogleIntegration();

        if ($this->selectedCourse) {
            $hasAccess = $this->courses->contains('id', (int) $this->selectedCourse);
            if (!$hasAccess) {
                $this->selectedCourse = '';
            }
        }
    }

    public function loadCourses()
    {
        $user = Auth::user();

        $this->courses = DB::table('courses')
            ->join('course_lecturers', 'courses.id', '=', 'course_lecturers.course_id')
            ->where('course_lecturers.user_id', $user->id)
            ->select('courses.id', 'courses.name', 'courses.code')
            ->orderBy('courses.name')
            ->get();
    }

    public function checkGoogleIntegration()
    {
        $this->hasLinkedGoogle = SocialAccount::where('user_id', Auth::id())
            ->where('provider', 'google')
            ->exists();
    }

    public function selectCourse($courseId)
    {
        $this->selectedCourse = $courseId;
        // $this->loadExams(); // Cache is invalidated automatically by Livewire on re-render if needed, but computed property runs on demand
    }

    public function updatedSelectedCourse($value)
    {
        // $this->loadExams();
    }

    #[Computed]
    public function exams()
    {
        if (!$this->selectedCourse) {
            return collect();
        }

        return Exam::where('course_id', $this->selectedCourse)
            ->with('course')
            ->withCount(['grades', 'sessions'])
            ->orderBy('exam_date', 'desc')
            ->get()
            ->map(function($exam) {
                $exam->course_name = $exam->course->name;
                $exam->course_code = $exam->course->code;
                return $exam;
            });
    }

    #[Computed]
    public function avgPassRate()
    {
        if (!$this->selectedCourse) {
            return 0;
        }

        // Get the latest analytics snapshot for each exam in the course
        $examIds = Exam::where('course_id', $this->selectedCourse)->pluck('id');
        
        if ($examIds->isEmpty()) {
            return 0;
        }

        $avg = DB::table('analytics_snapshots')
            ->whereIn('exam_id', $examIds)
            ->whereIn('snapshot_date', function($query) use ($examIds) {
                $query->select(DB::raw('MAX(snapshot_date)'))
                    ->from('analytics_snapshots')
                    ->whereIn('exam_id', $examIds)
                    ->groupBy('exam_id');
            })
            ->avg('pass_rate');

        return round($avg ?? 0, 0);
    }

    public function createExam()
    {
        $this->validate([
            'newExam.title' => 'required|string|max:255',
            'newExam.description' => 'nullable|string',
            'newExam.exam_date' => 'required|date|after:today',
            'newExam.duration' => 'nullable|integer|min:1',
            'newExam.total_marks' => 'nullable|integer|min:1',
            'newExam.passing_marks' => 'nullable|integer|min:1',
        ]);

        $exam = Exam::create([
            'course_id' => $this->selectedCourse,
            'lecturer_id' => Auth::id(),
            'title' => $this->newExam['title'],
            'description' => $this->newExam['description'],
            'exam_date' => $this->newExam['exam_date'],
            'duration' => $this->newExam['duration'],
            'total_marks' => $this->newExam['total_marks'],
            'passing_marks' => $this->newExam['passing_marks'],
            'questions' => $this->newExam['questions'],
            'status' => $this->newExam['status'],
            'randomize_questions' => $this->newExam['randomize_questions'] ?? true,
            'randomize_options' => $this->newExam['randomize_options'] ?? true,
            'category' => $this->newExam['category'] ?? 'exam',
        ]);

        if ($this->newExam['sync_to_calendar'] && $this->hasLinkedGoogle) {
            $syncService = new CalendarSyncService();
            $syncService->sync($exam);
        }

        $this->resetExamForm();
        unset($this->exams);

        session()->flash('message', 'Exam created successfully!');

        return redirect()->route('lecturer.exam-questions', $exam->id);
    }

    // ... (addQuestion, removeQuestion unchanged) ...

    public function addQuestion()
    {
        $this->validate([
            'newQuestion.question' => 'required|string',
            'newQuestion.correct_answer' => 'required|string',
            'newQuestion.marks' => 'required|integer|min:1',
        ]);

        $this->newExam['questions'][] = [
            'question' => $this->newQuestion['question'],
            'options' => $this->newQuestion['options'],
            'correct_answer' => $this->newQuestion['correct_answer'],
            'marks' => $this->newQuestion['marks'],
        ];

        $this->newQuestion = [
            'question' => '',
            'options' => ['', '', '', ''],
            'correct_answer' => '',
            'marks' => 1,
        ];
    }

    public function removeQuestion($index)
    {
        unset($this->newExam['questions'][$index]);
        $this->newExam['questions'] = array_values($this->newExam['questions']);
    }

    public function publishExam($examId)
    {
        $exam = Exam::find($examId);
        if ($exam && $exam->lecturer_id === Auth::id()) {
            $exam->update(['status' => 'published']);
            
            // Auto sync on publish if configured
            if ($this->hasLinkedGoogle && ($exam->google_event_id || $this->newExam['sync_to_calendar'])) {
                $syncService = new CalendarSyncService();
                $syncService->sync($exam);
            }

            session()->flash('message', 'Exam published successfully!');
        }
    }

    public function confirmDelete($examId)
    {
        \Log::info('Exam ID to delete set:', ['id' => $examId]);
        $this->examIdToDelete = $examId;
        $this->showDeleteModal = true;
    }

    public function deleteExam()
    {
        \Log::info('deleteExam called. ID to delete:', ['id' => $this->examIdToDelete]);
        if (!$this->examIdToDelete) {
            \Log::warning('No exam ID set for deletion.');
            return;
        }

        $exam = Exam::find($this->examIdToDelete);
        
        if ($exam && $exam->lecturer_id === Auth::id()) {
            \Log::info('Exam found and lecturer matches. Deleting...', ['exam_id' => $exam->id]);
            $exam->delete();
            unset($this->exams);
            \Log::info('Exam deleted successfully.');
            session()->flash('message', 'Exam deleted successfully!');
        } else {
            \Log::error('Exam not found or lecturer mismatch.', [
                'exam_id' => $this->examIdToDelete,
                'lecturer_id' => Auth::id(),
                'exam_lecturer_id' => $exam ? $exam->lecturer_id : 'n/a'
            ]);
        }

        $this->showDeleteModal = false;
        $this->examIdToDelete = null;
    }

    public function editExam($examId)
    {
        $exam = Exam::find($examId);
        if ($exam && $exam->lecturer_id === Auth::id()) {
            $this->editingExam = $exam;
            $this->newExam = [
                'title' => $exam->title,
                'description' => $exam->description,
                'exam_date' => $exam->exam_date->format('Y-m-d\TH:i'),
                'duration' => $exam->duration,
                'total_marks' => $exam->total_marks,
                'passing_marks' => $exam->passing_marks,
                'questions' => $exam->questions ?? [],
                'status' => $exam->status,
                'randomize_questions' => $exam->randomize_questions ?? true,
                'randomize_options' => $exam->randomize_options ?? true,
                'category' => $exam->category ?? 'exam',
                'sync_to_calendar' => (bool)$exam->google_event_id,
            ];
            $this->showCreateForm = true;
        }
    }

    public function updateExam()
    {
        $this->validate([
            'newExam.title' => 'required|string|max:255',
            'newExam.description' => 'nullable|string',
            'newExam.exam_date' => 'required|date',
            'newExam.duration' => 'nullable|integer|min:1',
            'newExam.total_marks' => 'nullable|integer|min:1',
            'newExam.passing_marks' => 'nullable|integer|min:1',
        ]);

        if ($this->editingExam) {
            $this->editingExam->update([
                'title' => $this->newExam['title'],
                'description' => $this->newExam['description'],
                'exam_date' => $this->newExam['exam_date'],
                'duration' => $this->newExam['duration'],
                'total_marks' => $this->newExam['total_marks'],
                'passing_marks' => $this->newExam['passing_marks'],
                'questions' => $this->newExam['questions'],
                'status' => $this->newExam['status'],
                'randomize_questions' => $this->newExam['randomize_questions'] ?? true,
                'randomize_options' => $this->newExam['randomize_options'] ?? true,
                'category' => $this->newExam['category'] ?? 'exam',
            ]);

            if ($this->newExam['sync_to_calendar'] && $this->hasLinkedGoogle) {
                $syncService = new CalendarSyncService();
                $syncService->sync($this->editingExam);
            }

            session()->flash('message', 'Exam updated successfully!');
        }

        $this->resetExamForm();
        // $this->loadExams();
    }

    public function viewResults($examId)
    {
        // Redirect to analytics dashboard to view exam results and grading trends
        return redirect()->route('lecturer.analytics.dashboard', $examId);
    }

    private function resetExamForm()
    {
        $this->editingExam = null;
        $this->newExam = [
            'title' => '',
            'description' => '',
            'exam_date' => '',
            'duration' => '',
            'total_marks' => '',
            'passing_marks' => '',
            'questions' => [],
            'status' => 'draft',
            'randomize_questions' => true,
            'randomize_options' => true,
        ];
        $this->newQuestion = [
            'question' => '',
            'options' => ['', '', '', ''],
            'correct_answer' => '',
            'marks' => 1,
        ];
        $this->showCreateForm = false;
    }

    public function render()
    {
        return view('livewire.lecturer-exams');
    }
}
