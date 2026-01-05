<?php

namespace App\Services;

use App\Models\AnalyticsSnapshot;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\AIGrading;
use Carbon\Carbon;

class InsightsService
{
    /**
     * Generate AI insights from analytics snapshot
     */
    public function generateInsights(AnalyticsSnapshot $snapshot): array
    {
        try {
            return [
                'key_findings' => $this->extractKeyFindings($snapshot),
                'at_risk_students' => $this->identifyAtRiskStudents($snapshot),
                'topic_recommendations' => $this->generateTopicRecommendations($snapshot),
                'performance_anomalies' => $this->detectAnomalies($snapshot),
                'learning_groups' => $this->segmentLearners($snapshot),
                'improvement_areas' => $this->identifyImprovementAreas($snapshot),
            ];
        } catch (\Exception $e) {
            \Log::error('InsightsService error: ' . $e->getMessage());
            return [
                'key_findings' => [],
                'at_risk_students' => [],
                'topic_recommendations' => [],
                'performance_anomalies' => [],
                'learning_groups' => [],
                'improvement_areas' => [],
                'error' => 'Unable to generate insights at this time',
            ];
        }
    }

    /**
     * Extract key findings from the analytics data
     */
    private function extractKeyFindings(AnalyticsSnapshot $snapshot): array
    {
        $findings = [];

        // Class performance finding
        $passRate = $snapshot->pass_rate ?? 0;
        if ($passRate < 50) {
            $findings[] = [
                'severity' => 'critical',
                'title' => 'Low Overall Pass Rate',
                'description' => "Only {$passRate}% of students passed. Significant intervention needed.",
                'icon' => 'fa-exclamation-triangle',
                'color' => 'red',
            ];
        } elseif ($passRate < 70) {
            $findings[] = [
                'severity' => 'warning',
                'title' => 'Below Average Pass Rate',
                'description' => "{$passRate}% pass rate indicates curriculum challenges.",
                'icon' => 'fa-exclamation-circle',
                'color' => 'yellow',
            ];
        } else {
            $findings[] = [
                'severity' => 'success',
                'title' => 'Strong Class Performance',
                'description' => "{$passRate}% of students passed the exam.",
                'icon' => 'fa-check-circle',
                'color' => 'green',
            ];
        }

        // Engagement finding
        $avgTime = $snapshot->average_time_spent ?? 0;
        $examDuration = $snapshot->exam?->duration ?? 120;
        $timePercentage = ($avgTime / 60) / ($examDuration / 60) * 100;

        if ($timePercentage < 50) {
            $findings[] = [
                'severity' => 'warning',
                'title' => 'Low Time Utilization',
                'description' => "Students used only {$timePercentage}% of exam time. Rushed decisions likely.",
                'icon' => 'fa-clock',
                'color' => 'orange',
            ];
        }

        // Difficulty distribution
        $avgDifficulty = $snapshot->average_difficulty ?? 0;
        if ($avgDifficulty > 0.7) {
            $findings[] = [
                'severity' => 'info',
                'title' => 'High Difficulty Exam',
                'description' => 'Exam contains mostly difficult questions. Consider balancing difficulty.',
                'icon' => 'fa-dumbbell',
                'color' => 'blue',
            ];
        }

        // Bloom's level coverage
        $bloomDistribution = $snapshot->bloom_level_distribution ?? [];
        if (empty($bloomDistribution['remember']) || $bloomDistribution['remember'] < 2) {
            $findings[] = [
                'severity' => 'info',
                'title' => 'Limited Foundational Questions',
                'description' => 'Few basic recall questions. Consider adding more foundational items.',
                'icon' => 'fa-pyramid',
                'color' => 'blue',
            ];
        }

        // AI Confidence
        $avgConfidence = $snapshot->average_confidence ?? 0;
        if ($avgConfidence < 70 && $snapshot->questions_ai_graded > 0) {
            $findings[] = [
                'severity' => 'warning',
                'title' => 'Low AI Grading Confidence',
                'description' => "AI confidence at {$avgConfidence}%. Review auto-graded essays.",
                'icon' => 'fa-robot',
                'color' => 'orange',
            ];
        }

        return $findings;
    }

    /**
     * Identify students at risk of failing
     */
    private function identifyAtRiskStudents(AnalyticsSnapshot $snapshot): array
    {
        try {
            $exam = $snapshot->exam;
            if (!$exam) return [];

            $passingScore = $exam->passing_marks ?? ($exam->total_marks ?? 100) * 0.6;
            
            $sessions = ExamSession::where('exam_id', $exam->id)
                ->where('status', 'submitted')
                ->with(['student', 'answers'])
                ->get();

            if ($sessions->isEmpty()) {
                return [];
            }

            $atRiskStudents = [];
            
            foreach ($sessions as $session) {
                try {
                    $score = $session->calculateTotalScore() ?? 0;
                    $scorePercentage = (($score) / ($exam->total_marks ?? 100)) * 100;

                    if ($scorePercentage < 60) {
                        $riskLevel = $scorePercentage < 40 ? 'critical' : 'warning';
                        
                        $atRiskStudents[] = [
                            'student_id' => $session->student_id,
                            'student_name' => optional($session->student)->first_name . ' ' . optional($session->student)->last_name,
                            'score' => round($score, 2),
                            'percentage' => round($scorePercentage, 2),
                            'risk_level' => $riskLevel,
                            'time_spent' => ($session->time_spent_seconds ?? 0) / 60,
                            'questions_attempted' => $session->answers()->count(),
                            'total_questions' => $exam->load('questions')->getRelation('questions')->count() ?? 0,
                        ];
                    }
                } catch (\Exception $e) {
                    \Log::warning('Error processing exam session ' . $session->id . ': ' . $e->getMessage());
                    continue;
                }
            }

            return $atRiskStudents;
        } catch (\Exception $e) {
            \Log::error('Error in identifyAtRiskStudents: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate topic-specific recommendations
     */
    private function generateTopicRecommendations(AnalyticsSnapshot $snapshot): array
    {
        $recommendations = [];
        
        $skillMastery = $snapshot->skill_mastery ?? [];
        
        foreach ($skillMastery as $bloomLevel => $masteryPercent) {
            if ($masteryPercent < 60) {
                $recommendations[] = [
                    'bloom_level' => $bloomLevel,
                    'mastery_percent' => round($masteryPercent, 2),
                    'priority' => 'high',
                    'suggestion' => "Students struggle with {$bloomLevel} level thinking. Review teaching strategies.",
                    'action' => "Focus on {$bloomLevel} level activities in next lesson",
                ];
            } elseif ($masteryPercent < 75) {
                $recommendations[] = [
                    'bloom_level' => $bloomLevel,
                    'mastery_percent' => round($masteryPercent, 2),
                    'priority' => 'medium',
                    'suggestion' => "{$bloomLevel} level mastery is moderate. Additional practice recommended.",
                    'action' => "Include more {$bloomLevel} practice problems",
                ];
            }
        }

        return $recommendations;
    }

    /**
     * Detect anomalies in performance
     */
    private function detectAnomalies(AnalyticsSnapshot $snapshot): array
    {
        $anomalies = [];

        // Check for high variance
        $stdDev = $snapshot->std_deviation ?? 0;
        $avgScore = $snapshot->average_score ?? 0;
        
        if ($stdDev > $avgScore * 0.5) {
            $anomalies[] = [
                'type' => 'high_variance',
                'title' => 'Highly Variable Performance',
                'description' => 'Large performance gaps between students suggest mixed understanding.',
                'metric' => 'std_deviation',
                'value' => round($stdDev, 2),
            ];
        }

        // Check for questions with very low/high pass rates
        $questionPerf = $snapshot->question_performance ?? [];
        foreach ($questionPerf as $qId => $perf) {
            if (!empty($perf['total'])) {
                $correctRate = ($perf['correct'] / $perf['total']) * 100;
                
                if ($correctRate < 20) {
                    $anomalies[] = [
                        'type' => 'difficult_question',
                        'title' => 'Problematic Question',
                        'description' => "Question {$qId} has only {$correctRate}% correct rate. Review or revise.",
                        'question_id' => $qId,
                        'correct_rate' => round($correctRate, 2),
                    ];
                } elseif ($correctRate > 95) {
                    $anomalies[] = [
                        'type' => 'too_easy_question',
                        'title' => 'Over-Easy Question',
                        'description' => "Question {$qId} is answered correctly by {$correctRate}% of students. Consider removing.",
                        'question_id' => $qId,
                        'correct_rate' => round($correctRate, 2),
                    ];
                }
            }
        }

        return $anomalies;
    }

    /**
     * Segment learners into groups based on performance
     */
    private function segmentLearners(AnalyticsSnapshot $snapshot): array
    {
        try {
            $exam = $snapshot->exam;
            if (!$exam) return [];

            $sessions = ExamSession::where('exam_id', $exam->id)
                ->where('status', 'submitted')
                ->with('student')
                ->get();

            if ($sessions->isEmpty()) {
                return [];
            }

            $groups = [
                'advanced' => [],
                'proficient' => [],
                'developing' => [],
                'beginning' => [],
            ];

            foreach ($sessions as $session) {
                try {
                    $score = $session->calculateTotalScore() ?? 0;
                    $scorePercentage = (($score) / ($exam->total_marks ?? 100)) * 100;

                    $student = [
                        'student_id' => $session->student_id,
                        'name' => (optional($session->student)->first_name ?? 'Unknown') . ' ' . (optional($session->student)->last_name ?? ''),
                        'score' => round($scorePercentage, 2),
                    ];

                    if ($scorePercentage >= 85) {
                        $groups['advanced'][] = $student;
                    } elseif ($scorePercentage >= 70) {
                        $groups['proficient'][] = $student;
                    } elseif ($scorePercentage >= 50) {
                        $groups['developing'][] = $student;
                    } else {
                        $groups['beginning'][] = $student;
                    }
                } catch (\Exception $e) {
                    \Log::warning('Error processing student in segmentLearners: ' . $e->getMessage());
                    continue;
                }
            }

            $totalSessions = $sessions->count();

            return [
                'advanced' => [
                    'count' => count($groups['advanced']),
                    'percentage' => $totalSessions > 0 ? (count($groups['advanced']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['advanced'], 0, 10), // Limit to first 10
                    'suggestion' => 'Challenge these students with extension activities',
                ],
                'proficient' => [
                    'count' => count($groups['proficient']),
                    'percentage' => $totalSessions > 0 ? (count($groups['proficient']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['proficient'], 0, 10),
                    'suggestion' => 'These students are on track. Maintain current support.',
                ],
                'developing' => [
                    'count' => count($groups['developing']),
                    'percentage' => $totalSessions > 0 ? (count($groups['developing']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['developing'], 0, 10),
                    'suggestion' => 'Provide targeted remediation and additional practice.',
                ],
                'beginning' => [
                    'count' => count($groups['beginning']),
                    'percentage' => $totalSessions > 0 ? (count($groups['beginning']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['beginning'], 0, 10),
                    'suggestion' => 'Intensive support needed. Consider one-on-one intervention.',
                ],
            ];
        } catch (\Exception $e) {
            \Log::error('Error in segmentLearners: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Identify specific areas needing improvement
     */
    private function identifyImprovementAreas(AnalyticsSnapshot $snapshot): array
    {
        $improvements = [];

        // Question performance
        $questionPerf = $snapshot->question_performance ?? [];
        $lowPerformers = [];

        foreach ($questionPerf as $qId => $perf) {
            if (!empty($perf['total'])) {
                $correctRate = ($perf['correct'] / $perf['total']) * 100;
                if ($correctRate < 60) {
                    $lowPerformers[] = [
                        'question_id' => $qId,
                        'correct_rate' => round($correctRate, 2),
                        'difficulty' => $perf['difficulty'] ?? 'unknown',
                    ];
                }
            }
        }

        if (!empty($lowPerformers)) {
            $improvements[] = [
                'area' => 'Question Performance',
                'priority' => 'high',
                'description' => 'Some questions have low pass rates',
                'items_needing_work' => count($lowPerformers),
                'suggestions' => [
                    'Review teaching content related to these questions',
                    'Consider question clarity and wording',
                    'Provide additional practice materials',
                    'Conduct post-exam discussion of challenging questions',
                ],
            ];
        }

        // Bloom's levels
        $skillMastery = $snapshot->skill_mastery ?? [];
        $weaker_levels = [];
        
        foreach ($skillMastery as $level => $mastery) {
            if ($mastery < 70) {
                $weaker_levels[] = $level;
            }
        }

        if (!empty($weaker_levels)) {
            $improvements[] = [
                'area' => 'Cognitive Levels',
                'priority' => 'high',
                'description' => 'Students struggle with higher-order thinking',
                'weak_levels' => $weaker_levels,
                'suggestions' => [
                    'Increase activities at Bloom\'s ' . implode(', ', $weaker_levels) . ' levels',
                    'Use scaffolding to build toward higher-order thinking',
                    'Include more analysis, synthesis, and evaluation activities',
                ],
            ];
        }

        return $improvements;
    }

    /**
     * Compare performance with previous exams
     */
    public function compareWithPrevious(Exam $exam): array
    {
        try {
            $currentSnapshot = AnalyticsSnapshot::where('exam_id', $exam->id)->latest()->first();
            
            if (!$currentSnapshot) {
                return ['status' => 'no_data'];
            }

            // Get previous exam(s) in same course
            $previousExams = Exam::where('course_id', $exam->course_id)
                ->where('id', '!=', $exam->id)
                ->orderBy('created_at', 'desc')
                ->limit(1)
                ->get();

            if ($previousExams->isEmpty()) {
                return ['status' => 'no_previous_data'];
            }

            $previousSnapshot = AnalyticsSnapshot::where('exam_id', $previousExams->first()->id)
                ->latest()
                ->first();

            if (!$previousSnapshot) {
                return ['status' => 'no_previous_data'];
            }

            $currentScore = $currentSnapshot->average_score ?? 0;
            $previousScore = $previousSnapshot->average_score ?? 1; // Prevent division by zero
            $scoreChange = $currentScore - $previousScore;
            $scoreChangePercent = $previousScore > 0 ? (($scoreChange) / $previousScore) * 100 : 0;

            return [
                'status' => 'success',
                'comparison' => [
                    'average_score' => [
                        'previous' => round($previousScore, 2),
                        'current' => round($currentScore, 2),
                        'change' => round($scoreChange, 2),
                        'change_percent' => round($scoreChangePercent, 2),
                    ],
                    'pass_rate' => [
                        'previous' => $previousSnapshot->pass_rate ?? 0,
                        'current' => $currentSnapshot->pass_rate ?? 0,
                        'change' => ($currentSnapshot->pass_rate ?? 0) - ($previousSnapshot->pass_rate ?? 0),
                    ],
                    'std_deviation' => [
                        'previous' => round($previousSnapshot->std_deviation ?? 0, 2),
                        'current' => round($currentSnapshot->std_deviation ?? 0, 2),
                        'trend' => ($currentSnapshot->std_deviation ?? 0) > ($previousSnapshot->std_deviation ?? 0) ? 'increased' : 'decreased',
                    ],
                ],
            ];
        } catch (\Exception $e) {
            \Log::error('Error in compareWithPrevious: ' . $e->getMessage());
            return ['status' => 'error', 'message' => 'Unable to compare with previous exam'];
        }
    }
}
