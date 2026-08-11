<?php

namespace App\Services;

use App\Models\AnalyticsSnapshot;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\AIGrading;
use Carbon\Carbon;

class InsightsService
{
    protected $deepseek;

    public function __construct(DeepseekAIService $deepseek)
    {
        $this->deepseek = $deepseek;
    }
    /**
     * Generate AI insights from analytics snapshot
     */
    public function generateInsights(AnalyticsSnapshot $snapshot): array
    {
        try {
            return [
                'key_findings' => $this->extractKeyFindings($snapshot),
                'at_risk_students' => $this->identifyAtRiskStudents($snapshot),
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
                ->whereIn('status', ['submitted', 'graded', 'published'])
                ->with(['student', 'examAnswers'])
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
                            'questions_attempted' => $session->examAnswers()->count(),
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
                    'suggestion' => "Students are finding " . $this->simplifyBloomLevel($bloomLevel) . " questions very difficult. Try explaining these concepts again.",
                    'action' => "Re-teach " . $this->simplifyBloomLevel($bloomLevel) . " concepts in the next class.",
                ];
            } elseif ($masteryPercent < 75) {
                $recommendations[] = [
                    'bloom_level' => $bloomLevel,
                    'mastery_percent' => round($masteryPercent, 2),
                    'priority' => 'medium',
                    'suggestion' => "Students have an average understanding of " . $this->simplifyBloomLevel($bloomLevel) . " topics, but could use more practice.",
                    'action' => "Give more practice problems for " . $this->simplifyBloomLevel($bloomLevel) . " skills.",
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
                'type' => 'mixed_results',
                'title' => 'Big Gaps in Student Scores',
                'description' => 'There is a wide range of scores. Some students did very well while others struggled significantly.',
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
                        'type' => 'hard_question',
                        'title' => 'Very Tough Question',
                        'description' => "Question {$qId} was only answered correctly by {$correctRate}% of students. You might want to review this question.",
                        'question_id' => $qId,
                        'correct_rate' => round($correctRate, 2),
                    ];
                } elseif ($correctRate > 95) {
                    $anomalies[] = [
                        'type' => 'easy_question',
                        'title' => 'Very Easy Question',
                        'description' => "Almost every student got Question {$qId} right ({$correctRate}%). It might be too easy for this level.",
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
                ->whereIn('status', ['submitted', 'graded', 'published'])
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
                    'suggestion' => 'These students are doing great! Give them more challenging work to keep them engaged.',
                ],
                'proficient' => [
                    'count' => count($groups['proficient']),
                    'percentage' => $totalSessions > 0 ? (count($groups['proficient']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['proficient'], 0, 10),
                    'suggestion' => 'These students understand the core material well.',
                ],
                'developing' => [
                    'count' => count($groups['developing']),
                    'percentage' => $totalSessions > 0 ? (count($groups['developing']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['developing'], 0, 10),
                    'suggestion' => 'These students need some extra help and more practice with the basics.',
                ],
                'beginning' => [
                    'count' => count($groups['beginning']),
                    'percentage' => $totalSessions > 0 ? (count($groups['beginning']) / $totalSessions * 100) : 0,
                    'students' => array_slice($groups['beginning'], 0, 10),
                    'suggestion' => 'These students are struggling significantly and need one-on-one attention.',
                ],
            ];
        } catch (\Exception $e) {
            \Log::error('Error in segmentLearners: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Identify specific areas needing improvement with detailed question analysis
     */
    private function identifyImprovementAreas(AnalyticsSnapshot $snapshot): array
    {
        $improvements = [];
        $exam = $snapshot->exam;
        if (!$exam) return [];

        // Question performance
        $questionPerf = $snapshot->question_performance ?? [];
        $lowPerformers = [];

        foreach ($questionPerf as $qId => $perf) {
            if (!empty($perf['total'])) {
                $correctRate = ($perf['correct'] / $perf['total']) * 100;
                if ($correctRate < 60) {
                    $question = null;
                    if (empty($perf['text'])) {
                        $question = \App\Models\Question::find($qId);
                    }
                    
                    $lowPerformers[] = [
                        'question_id' => $qId,
                        'question_number' => $perf['number'] ?? '-',
                        'text' => $perf['text'] ?? ($question->question_text ?? 'Unknown'),
                        'type' => $perf['type'] ?? ($question->type ?? 'mcq'),
                        'correct_rate' => round($correctRate, 2),
                        'difficulty' => $perf['difficulty'] ?? ($question->difficulty ?? 'medium'),
                        'bloom_level' => $perf['bloom_level'] ?? ($question->bloom_level ?? 'understand'),
                    ];
                }
            }
        }

        if (!empty($lowPerformers)) {
            foreach ($lowPerformers as $item) {
                $specificAdvice = $this->getDeepReasoningAdvice($item, $snapshot);
                $improvements[] = [
                    'area' => 'Question performance issue',
                    'priority' => $item['correct_rate'] < 40 ? 'high' : 'medium',
                    'question_id' => $item['question_id'],
                    'question_number' => $item['question_number'],
                    'question_text' => $item['text'],
                    'description' => "Only {$item['correct_rate']}% of students got this right.",
                    'suggestions' => $specificAdvice,
                    'is_ai_reasoned' => true,
                ];
            }
        }

        // Bloom's levels / Skill gaps
        $skillMastery = $snapshot->skill_mastery ?? [];
        foreach ($skillMastery as $level => $mastery) {
            if ($mastery < 60) {
                $improvements[] = [
                    'area' => 'Skill gap: ' . $this->simplifyBloomLevel($level),
                    'priority' => 'high',
                    'description' => "Students' " . $this->simplifyBloomLevel($level) . " skills are significantly below target ({$mastery}%).",
                    'suggestions' => [
                        "Divert more class time to " . $this->simplifyBloomLevel($level) . " activities.",
                        "Use step-by-step scaffolding for complex " . $this->simplifyBloomLevel($level) . " tasks.",
                        "Provide targeted homework focusing specifically on " . $level . " thinking."
                    ],
                ];
            }
        }

        return $improvements;
    }

    /**
     * Get deep reasoning advice using AI with caching
     */
    private function getDeepReasoningAdvice(array $item, AnalyticsSnapshot $snapshot): array
    {
        $cacheKey = "deep_reasoning_{$item['question_id']}_{$snapshot->snapshot_date->format('Ymd')}";
        
        return \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addDays(7), function() use ($item) {
            return $this->generateDeepReasoningAdvice($item);
        });
    }

    /**
     * Generate highly specific, AI-driven reasoning for a particular question
     */
    private function generateDeepReasoningAdvice(array $item): array
    {
        try {
            $questionText = $item['text'];
            $correctRate = $item['correct_rate'];
            $bloomLevel = $this->simplifyBloomLevel($item['bloom_level']);
            $difficulty = $item['difficulty'];
            
            // Fetch a few sample answers to provide context to the AI
            $sampleAnswers = \App\Models\ExamAnswer::whereHas('examSession', function($q) use ($item) {
                    $q->where('exam_id', \App\Models\Question::find($item['question_id'])->exam_id);
                })
                ->where('student_answer', '!=', '')
                ->orderBy('marks_obtained', 'asc') // Get some wrong ones
                ->limit(5)
                ->pluck('student_answer')
                ->toArray();

            $samplesText = !empty($sampleAnswers) ? "SAMPLE STUDENT ANSWERS:\n- " . implode("\n- ", $sampleAnswers) : "No sample answers available.";

            $systemPrompt = "You are an expert pedagogical consultant. Analyze the student performance data for a specific exam question and provide deep, actionable reasoning for why students might be struggling and how the teacher can improve their understanding. Avoid generic advice.";
            
            $userPrompt = "QUESTION: \"{$questionText}\"
            BLOOM LEVEL: {$bloomLevel}
            DIFFICULTY: {$difficulty}
            SUCCESS RATE: {$correctRate}%
            
            {$samplesText}
            
            Based on this, please provide 2-3 highly specific, deep-reasoning suggestions for the teacher. 
            Format: Return a JSON array of specific suggestion strings only. Each suggestion should be at most 2 sentences long and focus on the 'why' and 'how' of improving student understanding for this specific topic.";

            $response = $this->deepseek->generateText($userPrompt, $systemPrompt);
            
            // Clean response to ensure it's JSON
            $cleanJson = preg_replace('/^```json\s*|\s*```$/', '', trim($response));
            $advice = json_decode($cleanJson, true);
            
            if (is_array($advice) && !empty($advice)) {
                return $advice;
            }
            
            // Fallback if AI fails
            return [
                "The low success rate suggests a fundamental disconnect with {$bloomLevel} concepts in this topic.",
                "Observe the sample answers to see if students are consistently choosing a specific incorrect option or making a shared logical error."
            ];
        } catch (\Exception $e) {
            \Log::error("Deep Reasoning API Error: " . $e->getMessage());
            return ["Analysis temporarily unavailable. Please review the question manually."];
        }
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

    /**
     * Simplify Bloom's levels for teachers
     */
    private function simplifyBloomLevel($level): string
    {
        return match(strtolower($level)) {
            'remember' => 'Basic Facts',
            'understand' => 'Understanding',
            'apply' => 'Practical Application',
            'analyze' => 'Analyzing Problems',
            'evaluate' => 'Critical Evaluation',
            'create' => 'Creative Thinking',
            default => 'Core Skills'
        };
    }
}
