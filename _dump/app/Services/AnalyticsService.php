<?php

namespace App\Services;

use App\Models\AnalyticsSnapshot;
use App\Models\QuestionAnalytics;
use App\Models\StudentLearningProgress;
use App\Models\GradingTrend;
use App\Models\ClassComparisonData;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\AIGrading;
use App\Models\Question;
use App\Models\User;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Generate analytics snapshot for an exam
     */
    public function generateSnapshot(Exam $exam, string $period = 'daily'): AnalyticsSnapshot
    {
        // Eager load all required relationships
        $sessions = ExamSession::where('exam_id', $exam->id)
            ->whereIn('status', ['submitted', 'graded', 'published'])
            ->with(['examAnswers', 'student'])
            ->get();
        
        if ($sessions->isEmpty()) {
            return $this->createEmptySnapshot($exam, $period);
        }

        // Student performance metrics
        $scores = $sessions->mapWithKeys(fn($s) => [$s->id => $s->calculateTotalScore()]);
        $totalStudents = $sessions->count();
        $submittedCount = $sessions->whereIn('status', ['submitted', 'graded', 'published'])->count();
        
        $avgScore = $scores->average();
        $medianScore = $scores->median();
        $stdDev = $this->calculateStdDeviation($scores->values());
        
        // Questions analysis - eager load
        $questions = $exam->load('questions')->getRelation('questions') ?? collect();
        $avgDifficulty = $questions->avg('difficulty') ?? 0;
        $bloomDistribution = $questions->groupBy('bloom_level')->mapWithKeys(
            fn($group, $level) => [$level => $group->count()]
        );
        
        // Grading metrics - eager load with relationships
        $gradings = AIGrading::whereHas('examAnswer.examSession', fn($q) => $q->where('exam_id', $exam->id))
            ->with(['examAnswer.examSession'])
            ->get();
        $autoGraded = $gradings->where('grading_method', 'auto_mark')->count();
        $aiGraded = $gradings->where('grading_method', 'ai_essay')->count();
        $avgConfidence = $gradings->avg('confidence_score') ?? 0;
        
        // Engagement metrics
        $avgTimeSpent = $sessions->avg('time_spent_seconds') ?? 0;
        $earlySubmissions = $sessions->where('time_spent_seconds', '<', ($exam->duration * 60) * 0.8)->count();
        $lastMinuteSubmissions = $sessions->where('time_spent_seconds', '>', ($exam->duration * 60) * 0.95)->count();
        
        // Question performance - cache answers in memory
        $allAnswers = $sessions->flatMap(fn($s) => $s->examAnswers);
        $questionPerf = [];
        foreach ($questions->values() as $index => $question) {
            $answers = $allAnswers->where('question_id', $question->id);
            if ($answers->count() > 0) {
                // Count correct answers (those with marks_obtained > 0)
                $correctCount = $answers->filter(fn($a) => $a->marks_obtained > 0)->count();
                $questionPerf[$question->id] = [
                    'number' => $index + 1,
                    'text' => $question->question_text,
                    'correct' => $correctCount,
                    'total' => $answers->count(),
                    'difficulty' => $question->difficulty ?? 'unknown',
                    'type' => $question->type,
                    'bloom_level' => $question->bloom_level,
                ];
            }
        }
        
        // Skill mastery by Bloom's level
        $skillMastery = [];
        foreach ($questions->groupBy('bloom_level') as $level => $levelQuestions) {
            $levelAnswers = $allAnswers->whereIn('question_id', $levelQuestions->pluck('id'));
            if ($levelAnswers->count() > 0) {
                $correct = $levelAnswers->filter(fn($a) => $a->marks_obtained > 0)->count();
                $skillMastery[$level] = round($correct / $levelAnswers->count() * 100, 2);
            }
        }
        
        // Common mistakes
        $incorrectAnswers = $allAnswers->filter(fn($a) => !$a->marks_obtained || $a->marks_obtained === 0);
        $commonMistakes = $incorrectAnswers->groupBy('question_id')
            ->map->count()
            ->sortDesc()
            ->take(5)
            ->toArray();
        
        // Pass rate
        $passingScore = $exam->passing_marks ?? ($exam->total_marks ?? 100) * 0.6;
        $passRate = $totalStudents > 0 ? ($scores->filter(fn($s) => $s >= $passingScore)->count() / $totalStudents * 100) : 0;
        
        // Create snapshot
        $snapshot = AnalyticsSnapshot::create([
            'exam_id' => $exam->id,
            'course_id' => $exam->course_id,
            'lecturer_id' => $exam->lecturer_id,
            'snapshot_date' => now(),
            'period' => $period,
            'total_students' => $totalStudents,
            'students_submitted' => $submittedCount,
            'average_score' => round($avgScore, 2),
            'median_score' => round($medianScore, 2),
            'std_deviation' => round($stdDev, 2),
            'min_score' => round($scores->min(), 2),
            'max_score' => round($scores->max(), 2),
            'total_questions' => $questions->count(),
            'average_difficulty' => round($avgDifficulty, 2),
            'difficulty_distribution' => $this->getDifficultyDistribution($questions),
            'bloom_level_distribution' => $bloomDistribution->toArray(),
            'questions_auto_graded' => $autoGraded,
            'questions_ai_graded' => $aiGraded,
            'average_confidence' => round($avgConfidence, 2),
            'grades_pending_review' => $gradings->where('status', 'pending_review')->count(),
            'grades_approved' => $gradings->where('status', 'approved')->count(),
            'grades_overridden' => $gradings->where('status', 'revised')->count(),
            'average_time_spent' => round($avgTimeSpent, 2),
            'early_submissions' => $earlySubmissions,
            'last_minute_submissions' => $lastMinuteSubmissions,
            'average_autosave_frequency' => 0, // TODO: calculate from session history
            'question_performance' => $questionPerf,
            'skill_mastery' => $skillMastery,
            'common_mistakes' => $commonMistakes,
            'pass_rate' => round($passRate, 2),
        ]);

        return $snapshot;
    }

    /**
     * Analyze individual question performance
     */
    public function analyzeQuestion(Question $question, ?Exam $exam = null): QuestionAnalytics
    {
        $query = ExamSession::query();
        if ($exam) {
            $query->where('exam_id', $exam->id);
        }

        $sessions = $query->get();
        $answers = $sessions->flatMap(fn($s) => $s->examAnswers)->where('question_id', $question->id);
        
        if ($answers->isEmpty()) {
            return $this->createEmptyQuestionAnalytics($question, $exam);
        }

        $total = $answers->count();
        $correct = $answers->filter(fn($a) => $a->marks_obtained > 0)->count();
        $correctRate = $total > 0 ? round($correct / $total * 100, 2) : 0;

        // Discrimination index (how well it separates high from low performers)
        $topHalf = $sessions->sortByDesc(fn($s) => $s->calculateTotalScore())->take(ceil($total / 2));
        $bottomHalf = $sessions->sortBy(fn($s) => $s->calculateTotalScore())->take(ceil($total / 2));

        $topCorrect = $topHalf->flatMap(fn($s) => $s->examAnswers)->where('question_id', $question->id)->filter(fn($a) => $a->marks_obtained > 0)->count();
        $bottomCorrect = $bottomHalf->flatMap(fn($s) => $s->examAnswers)->where('question_id', $question->id)->filter(fn($a) => $a->marks_obtained > 0)->count();

        $discriminationIndex = ($topCorrect - $bottomCorrect) / max($topHalf->count(), $bottomHalf->count());

        // MCQ analysis - track option selections
        $optionCounts = null;
        if ($question->type === 'mcq' && $question->options) {
            $optionCounts = [];
            foreach ($question->options as $key => $option) {
                $count = $answers->filter(fn($a) => strpos($a->student_answer ?? '', $key) !== false)->count();
                $optionCounts[$key] = $count;
            }
        }

        // Common distractors
        $commonDistracts = $answers->filter(fn($a) => !$a->marks_obtained || $a->marks_obtained === 0)
            ->groupBy('student_answer')
            ->map->count()
            ->sortDesc()
            ->take(3)
            ->toArray();

        // Average time
        $avgTime = $answers->avg(fn($a) => $a->time_spent_seconds ?? 0) ?? 0;

        $analytics = QuestionAnalytics::updateOrCreate(
            ['question_id' => $question->id, 'exam_id' => $exam?->id],
            [
                'total_attempts' => $total,
                'correct_attempts' => $correct,
                'correct_rate' => $correctRate,
                'bloom_level' => $question->bloom_level,
                'difficulty_index' => $this->calculateDifficultyIndex($correctRate),
                'discrimination_index' => round($discriminationIndex, 3),
                'option_selection_count' => $optionCounts,
                'common_distractors' => $commonDistracts,
                'average_time_spent' => round($avgTime, 2),
                'last_used_at' => now(),
                'uses_count' => ($analytics->uses_count ?? 0) + 1,
            ]
        );

        return $analytics;
    }

    /**
     * Track student learning progress
     */
    public function updateStudentProgress(User $student, $course): StudentLearningProgress
    {
        // Eager load relationships
        $exams = Exam::where('course_id', $course->id)
            ->with('questions')
            ->get();
            
        $sessions = ExamSession::where('student_id', $student->id)
            ->whereIn('exam_id', $exams->pluck('id'))
            ->whereIn('status', ['submitted', 'graded', 'published'])
            ->with('examAnswers')
            ->get();

        if ($sessions->isEmpty()) {
            return StudentLearningProgress::firstOrCreate(
                ['student_id' => $student->id, 'course_id' => $course->id],
                ['overall_progress' => 0, 'mastery_level' => 0]
            );
        }

        // Score progression
        $scores = $sessions->map(fn($s) => $s->calculateTotalScore());
        $avgScore = round($scores->average(), 2);
        $currentScore = $scores->last();
        $previousScore = $scores->count() > 1 ? $scores->values()[$scores->count() - 2] : $scores->first();
        $scoreTrend = $currentScore - $previousScore;

        // Improvement streak
        $improvementStreak = 0;
        for ($i = $scores->count() - 1; $i > 0; $i--) {
            if ($scores[$i] > $scores[$i - 1]) {
                $improvementStreak++;
            } else {
                break;
            }
        }

        // Cache all answers
        $allAnswers = $sessions->flatMap(fn($s) => $s->examAnswers);

        // Skill levels by Bloom's level
        $skillLevels = [];
        foreach (range(1, 6) as $level) {
            $questions = $exams->flatMap(fn($e) => $e->questions()->get())->where('bloom_level', $level);

            if ($questions->isNotEmpty()) {
                $answers = $allAnswers->whereIn('question_id', $questions->pluck('id'));

                if ($answers->count() > 0) {
                    $correct = $answers->filter(fn($a) => $a->marks_obtained > 0)->count();
                    $skillLevels[$level] = round($correct / $answers->count() * 100, 2);
                }
            }
        }

        // Identify weaknesses
        $weaknesses = array_filter($skillLevels, fn($mastery) => $mastery < 60);
        $weaknessTitles = array_keys($weaknesses);

        // Recommended topics
        $recommendedTopics = array_slice($weaknessTitles, 0, 3);

        // Strengths
        $strengths = array_filter($skillLevels, fn($mastery) => $mastery >= 80);
        $strengthTitles = array_keys($strengths);

        // Overall mastery
        $overallMastery = !empty($skillLevels) ? round(array_sum($skillLevels) / count($skillLevels), 2) : 0;
        $overallProgress = round(($avgScore / (max($exams->pluck('total_marks') ?? [100]) ?? 100)) * 100, 2);

        return StudentLearningProgress::updateOrCreate(
            ['student_id' => $student->id, 'course_id' => $course->id],
            [
                'overall_progress' => $overallProgress,
                'mastery_level' => $overallMastery,
                'skill_levels' => $skillLevels,
                'average_score_trend' => round($scoreTrend, 2),
                'improvement_streak' => $improvementStreak,
                'struggle_areas' => count($weaknesses),
                'exams_completed' => $sessions->count(),
                'average_completion_time' => round($sessions->avg('time_spent_seconds') / 60 ?? 0, 2),
                'times_reviewed_feedback' => 0, // TODO: track feedback views
                'recommended_topics' => $recommendedTopics,
                'strengths' => $strengthTitles,
                'weaknesses' => $weaknessTitles,
                'last_exam_at' => $sessions->last()?->submitted_at,
            ]
        );
    }

    /**
     * Analyze grading trends
     */
    public function analyzeGradingTrend(Exam $exam, ?User $lecturer = null): GradingTrend
    {
        $gradings = AIGrading::whereHas('examAnswer.examSession', fn($q) => $q->where('exam_id', $exam->id));

        if ($lecturer) {
            $gradings->whereHas('examAnswer.examSession.exam', fn($q) => $q->where('lecturer_id', $lecturer->id));
        }

        $gradings = $gradings->get();

        $mcqGradings = $gradings->where('grading_method', 'auto_mcq');
        $essayGradings = $gradings->where('grading_method', 'ai_essay');

        $mcqAvg = $mcqGradings->avg('marks_awarded') ?? 0;
        $essayAvg = $essayGradings->avg('marks_awarded') ?? 0;
        $essayConfidence = $essayGradings->avg('confidence_score') ?? 0;

        $overrides = $gradings->where('status', 'revised')->count();
        $overrideRate = $gradings->count() > 0 ? round($overrides / $gradings->count() * 100, 2) : 0;

        return GradingTrend::updateOrCreate(
            ['exam_id' => $exam->id, 'lecturer_id' => $lecturer?->id, 'trend_date' => now()->startOfDay()],
            [
                'period' => 'daily',
                'mcq_graded_count' => $mcqGradings->count(),
                'mcq_average_score' => round($mcqAvg, 2),
                'essays_graded_count' => $essayGradings->count(),
                'essays_average_score' => round($essayAvg, 2),
                'essays_average_confidence' => round($essayConfidence, 2),
                'overrides_count' => $overrides,
                'override_rate' => $overrideRate,
                'consistency_score' => $this->calculateConsistencyScore($gradings),
            ]
        );
    }

    /**
     * Compare class performance to benchmark
     */
    public function compareToClass(Exam $exam, $comparisonType = 'course'): ClassComparisonData
    {
        $sessions = ExamSession::where('exam_id', $exam->id)
            ->whereIn('status', ['submitted', 'graded', 'published'])
            ->get();
        $scores = $sessions->map(fn($s) => $s->calculateTotalScore());

        $classAvg = round($scores->average(), 2);
        $classMedian = round($scores->median(), 2);
        $totalMarks = $exam->total_marks ?? 100;
        $passingScore = $totalMarks * 0.6;
        $passRate = round($scores->filter(fn($s) => $s >= $passingScore)->count() / max($scores->count(), 1) * 100, 2);
        $highAchievers = round($scores->filter(fn($s) => $s >= $totalMarks * 0.9)->count() / max($scores->count(), 1) * 100, 2);

        // Grade distribution
        $distribution = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'F' => 0];
        foreach ($scores as $score) {
            $percentage = ($score / $totalMarks) * 100;
            if ($percentage >= 90) $distribution['A']++;
            elseif ($percentage >= 80) $distribution['B']++;
            elseif ($percentage >= 70) $distribution['C']++;
            elseif ($percentage >= 60) $distribution['D']++;
            else $distribution['F']++;
        }

        // Benchmark comparison (TODO: implement actual benchmarking)
        $benchmarkAvg = $classAvg * 0.95; // Assume 95% of class avg as benchmark
        $benchmarkPassRate = $passRate * 0.98;
        $performanceGap = $classAvg - $benchmarkAvg;

        return ClassComparisonData::updateOrCreate(
            ['exam_id' => $exam->id, 'course_id' => $exam->course_id, 'comparison_date' => now()->startOfDay()],
            [
                'comparison_type' => $comparisonType,
                'class_average' => $classAvg,
                'median_score' => $classMedian,
                'pass_rate' => $passRate,
                'high_achiever_rate' => $highAchievers,
                'benchmark_average' => round($benchmarkAvg, 2),
                'benchmark_pass_rate' => round($benchmarkPassRate, 2),
                'performance_gap' => round($performanceGap, 2),
                'score_distribution' => $distribution,
            ]
        );
    }

    /**
     * Helper methods
     */
    
    private function calculateStdDeviation($values)
    {
        if ($values->isEmpty()) return 0;
        $avg = $values->average();
        $sum = $values->map(fn($v) => pow($v - $avg, 2))->sum();
        return sqrt($sum / $values->count());
    }

    private function getDifficultyDistribution($questions)
    {
        return $questions->groupBy('difficulty')->mapWithKeys(
            fn($group, $difficulty) => [$difficulty ?? 'medium' => $group->count()]
        )->toArray();
    }

    private function calculateDifficultyIndex($correctRate)
    {
        // Difficulty index: 0-100, where higher = easier
        return 100 - $correctRate;
    }

    private function calculateConsistencyScore($gradings)
    {
        if ($gradings->isEmpty()) return 100;

        // Check consistency of confidence scores and override patterns
        $confidences = $gradings->where('status', 'approved')->pluck('confidence_score');
        if ($confidences->isEmpty()) return 75;

        $avgConfidence = $confidences->average();
        $variance = $this->calculateStdDeviation($confidences);
        
        // Higher variance = less consistent
        return max(0, min(100, 100 - ($variance * 10)));
    }

    private function createEmptySnapshot(Exam $exam, $period)
    {
        return AnalyticsSnapshot::create([
            'exam_id' => $exam->id,
            'course_id' => $exam->course_id,
            'lecturer_id' => $exam->lecturer_id,
            'snapshot_date' => now(),
            'period' => $period,
            'total_students' => 0,
            'students_submitted' => 0,
        ]);
    }

    private function createEmptyQuestionAnalytics(Question $question, ?Exam $exam = null)
    {
        return QuestionAnalytics::firstOrCreate(
            ['question_id' => $question->id, 'exam_id' => $exam?->id],
            ['total_attempts' => 0, 'correct_attempts' => 0]
        );
    }
}
