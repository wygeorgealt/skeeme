<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSession;
use Illuminate\Support\Collection;

/**
 * StudentPerformanceService
 * 
 * Generates comprehensive performance reports for students and exams.
 */
class StudentPerformanceService
{
    /**
     * Get class-wide performance statistics
     */
    public function getClassPerformance(Exam $exam): array
    {
        $sessions = $exam->sessions()->where('status', 'graded')->get();

        if ($sessions->isEmpty()) {
            return [
                'total_students' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
                'statistics' => [],
            ];
        }

        $scores = $sessions->pluck('score')->toArray();
        $totalMarks = $exam->total_marks ?? 100;
        $passMarks = (int) ($totalMarks * 0.5); // 50% pass

        $passCount = collect($scores)->filter(fn($score) => $score >= $passMarks)->count();

        return [
            'total_students' => $sessions->count(),
            'average_score' => round(array_sum($scores) / count($scores), 2),
            'highest_score' => max($scores),
            'lowest_score' => min($scores),
            'pass_rate' => round(($passCount / count($scores)) * 100, 1),
            'statistics' => [
                'mean' => round(array_sum($scores) / count($scores), 2),
                'median' => $this->median($scores),
                'mode' => $this->mode($scores),
                'std_dev' => $this->standardDeviation($scores),
                'variance' => $this->variance($scores),
            ],
        ];
    }

    /**
     * Get top performers
     */
    public function getTopPerformers(Exam $exam, int $limit = 10): array
    {
        return ExamSession::where('exam_id', $exam->id)
            ->where('status', 'graded')
            ->with('student')
            ->orderByDesc('score')
            ->limit($limit)
            ->get()
            ->map(function ($session) use ($exam) {
                $percentage = ($session->score / ($exam->total_marks ?? 100)) * 100;
                return [
                    'student_id' => $session->student_id,
                    'student_name' => $session->student->name ?? 'Unknown',
                    'marks' => $session->score,
                    'percentage' => round($percentage, 1),
                    'rank' => 0, // Will be set in ranking
                ];
            })
            ->toArray();
    }

    /**
     * Get bottom performers
     */
    public function getBottomPerformers(Exam $exam, int $limit = 10): array
    {
        return ExamSession::where('exam_id', $exam->id)
            ->where('status', 'graded')
            ->with('student')
            ->orderBy('score')
            ->limit($limit)
            ->get()
            ->map(function ($session) use ($exam) {
                $percentage = ($session->score / ($exam->total_marks ?? 100)) * 100;
                return [
                    'student_id' => $session->student_id,
                    'student_name' => $session->student->name ?? 'Unknown',
                    'marks' => $session->score,
                    'percentage' => round($percentage, 1),
                ];
            })
            ->toArray();
    }

    /**
     * Get score distribution
     */
    public function getScoreDistribution(Exam $exam, int $buckets = 10): array
    {
        $sessions = ExamSession::where('exam_id', $exam->id)
            ->where('status', 'graded')
            ->pluck('score')
            ->toArray();

        if (empty($sessions)) {
            return [];
        }

        $maxScore = max($sessions);
        $bucketSize = max(1, $maxScore / $buckets);
        $distribution = [];

        for ($i = 0; $i < $buckets; $i++) {
            $min = $i * $bucketSize;
            $max = ($i + 1) * $bucketSize;
            
            $count = collect($sessions)
                ->filter(fn($score) => $score >= $min && $score < $max)
                ->count();

            $distribution[] = [
                'range' => round($min) . '-' . round($max),
                'min' => round($min),
                'max' => round($max),
                'count' => $count,
                'percentage' => round(($count / count($sessions)) * 100, 1),
            ];
        }

        return $distribution;
    }

    /**
     * Get grade distribution (A, B, C, D, F)
     */
    public function getGradeDistribution(Exam $exam): array
    {
        $sessions = ExamSession::where('exam_id', $exam->id)
            ->where('status', 'graded')
            ->get();

        if ($sessions->isEmpty()) {
            return [];
        }

        $totalMarks = $exam->total_marks ?? 100;
        $grades = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'F' => 0];

        foreach ($sessions as $session) {
            $percentage = ($session->score / $totalMarks) * 100;
            
            if ($percentage >= 90) $grades['A']++;
            elseif ($percentage >= 80) $grades['B']++;
            elseif ($percentage >= 70) $grades['C']++;
            elseif ($percentage >= 60) $grades['D']++;
            else $grades['F']++;
        }

        $total = $sessions->count();

        return [
            'A' => [
                'count' => $grades['A'],
                'percentage' => round(($grades['A'] / $total) * 100, 1),
                'label' => 'Excellent (90%+)',
            ],
            'B' => [
                'count' => $grades['B'],
                'percentage' => round(($grades['B'] / $total) * 100, 1),
                'label' => 'Good (80-89%)',
            ],
            'C' => [
                'count' => $grades['C'],
                'percentage' => round(($grades['C'] / $total) * 100, 1),
                'label' => 'Average (70-79%)',
            ],
            'D' => [
                'count' => $grades['D'],
                'percentage' => round(($grades['D'] / $total) * 100, 1),
                'label' => 'Below Average (60-69%)',
            ],
            'F' => [
                'count' => $grades['F'],
                'percentage' => round(($grades['F'] / $total) * 100, 1),
                'label' => 'Failed (<60%)',
            ],
        ];
    }

    /**
     * Get student-specific performance
     */
    public function getStudentPerformance($studentId, Exam $exam): array
    {
        $session = ExamSession::where('exam_id', $exam->id)
            ->where('student_id', $studentId)
            ->first();

        if (!$session) {
            return [];
        }

        $totalMarks = $exam->total_marks ?? 100;
        $percentage = ($session->score / $totalMarks) * 100;

        return [
            'student_id' => $studentId,
            'marks_obtained' => $session->score,
            'total_marks' => $totalMarks,
            'percentage' => round($percentage, 1),
            'grade' => $this->getGradeFromPercentage($percentage),
            'status' => $percentage >= 50 ? 'Passed' : 'Failed',
            'time_spent' => $session->time_spent_seconds ? $this->formatSeconds($session->time_spent_seconds) : 'N/A',
            'questions_answered' => $session->questions_answered ?? 0,
            'total_questions' => $exam->questions()->count(),
            'submission_time' => $session->submitted_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get question-wise performance
     */
    public function getQuestionPerformance(Exam $exam): array
    {
        return $exam->questions()
            ->with(['answers'])
            ->get()
            ->map(function ($question) {
                $totalAnswers = $question->answers()->count();
                
                if ($totalAnswers === 0) {
                    return [
                        'question_id' => $question->id,
                        'question_text' => substr($question->question_text ?? '', 0, 100),
                        'correct_count' => 0,
                        'correct_percentage' => 0,
                        'difficulty' => 'Unknown',
                    ];
                }

                $correctCount = $question->answers()
                    ->where('marks_obtained', '>', 0)
                    ->count();

                $percentage = ($correctCount / $totalAnswers) * 100;

                return [
                    'question_id' => $question->id,
                    'question_text' => substr($question->question_text ?? '', 0, 100),
                    'total_answers' => $totalAnswers,
                    'correct_count' => $correctCount,
                    'correct_percentage' => round($percentage, 1),
                    'difficulty' => $this->getQuestionDifficulty($percentage),
                ];
            })
            ->toArray();
    }

    /**
     * Get performance trends over time
     */
    public function getPerformanceTrends(Exam $exam, int $days = 30): array
    {
        $cutoff = now()->subDays($days);

        $trends = ExamSession::where('exam_id', $exam->id)
            ->where('status', 'graded')
            ->where('graded_at', '>=', $cutoff)
            ->get()
            ->groupBy(fn($session) => $session->graded_at->format('Y-m-d'))
            ->map(function ($sessions, $date) {
                $scores = $sessions->pluck('score');
                return [
                    'date' => $date,
                    'count' => $sessions->count(),
                    'average' => round($scores->avg(), 2),
                    'highest' => $scores->max(),
                    'lowest' => $scores->min(),
                ];
            })
            ->sortBy('date')
            ->values()
            ->toArray();

        return $trends;
    }

    /**
     * Calculate median
     */
    private function median(array $data): float
    {
        sort($data);
        $count = count($data);
        $mid = intdiv($count, 2);

        return $count % 2 === 0
            ? ($data[$mid - 1] + $data[$mid]) / 2
            : $data[$mid];
    }

    /**
     * Calculate mode
     */
    private function mode(array $data): float
    {
        $counts = array_count_values($data);
        arsort($counts);
        return (float) key($counts);
    }

    /**
     * Calculate standard deviation
     */
    private function standardDeviation(array $data): float
    {
        $mean = array_sum($data) / count($data);
        $variance = array_sum(array_map(
            fn($x) => pow($x - $mean, 2),
            $data
        )) / count($data);

        return sqrt($variance);
    }

    /**
     * Calculate variance
     */
    private function variance(array $data): float
    {
        $mean = array_sum($data) / count($data);
        return array_sum(array_map(
            fn($x) => pow($x - $mean, 2),
            $data
        )) / count($data);
    }

    /**
     * Get grade from percentage
     */
    private function getGradeFromPercentage(float $percentage): string
    {
        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * Get question difficulty from performance
     */
    private function getQuestionDifficulty(float $correctPercentage): string
    {
        if ($correctPercentage >= 80) return 'Easy';
        if ($correctPercentage >= 60) return 'Moderate';
        if ($correctPercentage >= 40) return 'Difficult';
        return 'Very Difficult';
    }

    /**
     * Format seconds to readable time
     */
    private function formatSeconds(int $seconds): string
    {
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        $secs = $seconds % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm %ds', $hours, $minutes, $secs);
        }
        return sprintf('%dm %ds', $minutes, $secs);
    }
}
