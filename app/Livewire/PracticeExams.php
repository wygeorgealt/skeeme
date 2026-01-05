<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

class PracticeExams extends Component
{
    use WithPagination;

    public User $student;
    public array $availablePracticeExams = [];
    public $selectedPracticeExam = null;
    public bool $showStartPracticeModal = false;
    public bool $showPracticeResults = false;
    public $lastPracticeSession = null;
    public array $practiceStats = [];

    public function mount(User $student)
    {
        $this->student = $student;
        $this->loadPracticeExams();
        $this->calculatePracticeStats();
    }

    public function render()
    {
        return view('livewire.practice-exams', [
            'availablePracticeExams' => $this->availablePracticeExams,
            'practiceStats' => $this->practiceStats,
        ]);
    }

    /**
     * Load available practice exams for student
     */
    public function loadPracticeExams()
    {
        // Get published exams with is_practice flag
        $exams = Exam::where('is_practice', true)
            ->where('status', 'published')
            ->whereHas('course', function ($q) {
                $q->whereHas('students', function ($subQ) {
                    $subQ->where('user_id', $this->student->id);
                });
            })
            ->with('course')
            ->get()
            ->map(function ($exam) {
                return [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'description' => $exam->description,
                    'duration' => $exam->duration,
                    'total_marks' => $exam->total_marks,
                    'difficulty' => $exam->metadata['difficulty'] ?? 'Medium',
                    'question_count' => count($exam->questions ?? []),
                    'attempts' => ExamSession::where('exam_id', $exam->id)
                        ->where('student_id', $this->student->id)
                        ->count(),
                    'best_score' => ExamSession::where('exam_id', $exam->id)
                        ->where('student_id', $this->student->id)
                        ->max('score'),
                ];
            });

        $this->availablePracticeExams = $exams->toArray();
    }

    /**
     * Calculate practice exam statistics
     */
    public function calculatePracticeStats()
    {
        $practiceSessions = ExamSession::whereHas('exam', function ($q) {
            $q->where('is_practice', true);
        })
            ->where('student_id', $this->student->id)
            ->get();

        $this->practiceStats = [
            'total_attempts' => $practiceSessions->count(),
            'avg_score' => $practiceSessions->avg('score') ?? 0,
            'best_score' => $practiceSessions->max('score') ?? 0,
            'total_time_spent' => $practiceSessions->sum('time_spent_seconds') ?? 0,
            'exams_practiced' => $practiceSessions->groupBy('exam_id')->count(),
            'improvement_trend' => $this->calculateImprovementTrend($practiceSessions),
        ];
    }

    /**
     * Calculate improvement trend
     */
    private function calculateImprovementTrend($sessions)
    {
        if ($sessions->count() < 2) {
            return 0;
        }

        $sorted = $sessions->sortBy('created_at');
        $firstHalf = $sorted->slice(0, intdiv($sorted->count(), 2))->avg('score') ?? 0;
        $secondHalf = $sorted->slice(intdiv($sorted->count(), 2))->avg('score') ?? 0;

        return round($secondHalf - $firstHalf, 2);
    }

    /**
     * Start practice exam
     */
    public function startPracticeExam()
    {
        if (!$this->selectedPracticeExam) {
            return;
        }

        $exam = Exam::find($this->selectedPracticeExam);
        if (!$exam) {
            return;
        }

        // Create exam session for practice
        $session = ExamSession::create([
            'exam_id' => $exam->id,
            'student_id' => auth()->id(),
            'status' => 'not_started',
            'is_practice' => true,
            'metadata' => [
                'practice_mode' => true,
                'show_answers' => true,
                'instant_feedback' => true,
            ],
        ]);

        // Redirect to exam delivery with practice mode enabled
        return redirect()->route('student.exam.delivery', $session);
    }

    /**
     * Get recommended next practice exam based on performance
     */
    public function getRecommendedExam()
    {
        if (empty($this->availablePracticeExams)) {
            return null;
        }

        // Find exam with lowest score or haven't attempted
        $recommended = collect($this->availablePracticeExams)
            ->sortBy(fn($exam) => $exam['best_score'] ?? 0)
            ->first();

        return $recommended;
    }

    /**
     * Get performance metrics for each difficulty level
     */
    public function getDifficultyMetrics()
    {
        $sessions = ExamSession::whereHas('exam', function ($q) {
            $q->where('is_practice', true);
        })
            ->where('student_id', $this->student->id)
            ->with('exam')
            ->get();

        $metrics = [];
        $difficulties = ['Easy', 'Medium', 'Hard'];

        foreach ($difficulties as $difficulty) {
            $sessionsForDifficulty = $sessions->filter(function ($session) use ($difficulty) {
                return ($session->exam->metadata['difficulty'] ?? 'Medium') === $difficulty;
            });

            $metrics[$difficulty] = [
                'attempts' => $sessionsForDifficulty->count(),
                'avg_score' => round($sessionsForDifficulty->avg('score') ?? 0, 2),
                'best_score' => $sessionsForDifficulty->max('score'),
                'improvement' => 'tracking',
            ];
        }

        return $metrics;
    }

    /**
     * Get learning insights from practice history
     */
    public function getLearningInsights()
    {
        $sessions = ExamSession::whereHas('exam', function ($q) {
            $q->where('is_practice', true);
        })
            ->where('student_id', $this->student->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $insights = [];

        // Analyze patterns
        $avgTime = $sessions->avg('time_spent_seconds') ?? 0;
        $avgScore = $sessions->avg('score') ?? 0;

        if ($avgScore >= 80) {
            $insights[] = [
                'type' => 'strength',
                'message' => '🌟 Excellent performance! You\'re scoring above 80% on practice exams.',
            ];
        } else if ($avgScore >= 60) {
            $insights[] = [
                'type' => 'attention',
                'message' => '💡 You\'re progressing well. Focus on improving weak areas.',
            ];
        } else {
            $insights[] = [
                'type' => 'improvement',
                'message' => '📚 Keep practicing! Review the material and try more practice exams.',
            ];
        }

        if ($avgTime < 30 * 60) { // Less than 30 minutes
            $insights[] = [
                'type' => 'tip',
                'message' => '⏱️ You\'re completing exams quickly. Take time to review your answers carefully.',
            ];
        }

        // Improvement tracking
        if ($sessions->count() >= 2) {
            $sorted = $sessions->sortBy('created_at');
            $latestScore = $sorted->last()->score;
            $earliestScore = $sorted->first()->score;
            $improvement = $latestScore - $earliestScore;

            if ($improvement > 10) {
                $insights[] = [
                    'type' => 'progress',
                    'message' => "📈 Great improvement! You've gained {$improvement} points since starting.",
                ];
            }
        }

        return $insights;
    }

    /**
     * View detailed practice results
     */
    public function viewPracticeResults($sessionId)
    {
        $session = ExamSession::find($sessionId);
        if ($session && $session->student_id === auth()->id()) {
            $this->lastPracticeSession = $session;
            $this->showPracticeResults = true;
        }
    }

    /**
     * Retry practice exam
     */
    public function retryPracticeExam($examId)
    {
        $this->selectedPracticeExam = $examId;
        $this->startPracticeExam();
    }
}
