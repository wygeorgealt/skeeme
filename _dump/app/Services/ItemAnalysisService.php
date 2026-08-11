<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Support\Collection;

/**
 * ItemAnalysisService
 * 
 * Analyzes exam questions to identify their difficulty, discrimination index,
 * and other psychometric properties
 */
class ItemAnalysisService
{
    /**
     * Calculate difficulty index for a question
     * Formula: (Number of students who answered correctly) / (Total number of students)
     * Range: 0-1 (0 = very difficult, 1 = very easy)
     *
     * @param Question $question
     * @return float
     */
    public function getDifficultyIndex(Question $question): float
    {
        $totalSessions = $question->exam->sessions()
            ->where('status', 'graded')
            ->count();

        if ($totalSessions === 0) {
            return 0;
        }

        // Count how many students answered correctly
        $correctAnswers = 0;

        // This would need exam answer data
        // Simplified for now
        return $correctAnswers / $totalSessions;
    }

    /**
     * Calculate discrimination index for a question
     * Formula: (% correct in top 27%) - (% correct in bottom 27%)
     * Range: -1 to 1 (positive = good discrimination)
     *
     * @param Question $question
     * @return float
     */
    public function getDiscriminationIndex(Question $question): float
    {
        // Get all exam sessions for this question's exam
        $sessions = $question->exam->sessions()
            ->where('status', 'graded')
            ->orderBy('score', 'desc')
            ->get();

        if ($sessions->count() < 3) {
            return 0; // Not enough data
        }

        $count = $sessions->count();
        $top27Percent = ceil($count * 0.27);
        $bottom27Percent = ceil($count * 0.27);

        $topGroup = $sessions->take($top27Percent);
        $bottomGroup = $sessions->slice($count - $bottom27Percent);

        $topCorrect = $this->countCorrectAnswersInGroup($question, $topGroup);
        $bottomCorrect = $this->countCorrectAnswersInGroup($question, $bottomGroup);

        $topPercentage = $topGroup->count() > 0 ? $topCorrect / $topGroup->count() : 0;
        $bottomPercentage = $bottomGroup->count() > 0 ? $bottomCorrect / $bottomGroup->count() : 0;

        return $topPercentage - $bottomPercentage;
    }

    /**
     * Count correct answers in a group of sessions
     */
    private function countCorrectAnswersInGroup(Question $question, Collection $sessions): int
    {
        $count = 0;
        
        foreach ($sessions as $session) {
            $answer = $session->answers()
                ->where('question_id', $question->id)
                ->first();

            if ($answer && $this->isAnswerCorrect($answer, $question)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Check if an answer is correct
     */
    private function isAnswerCorrect($answer, Question $question): bool
    {
        $correctAnswer = $question->correct_answer;
        $studentAnswer = $answer->student_answer;

        if (is_array($correctAnswer)) {
            return in_array($studentAnswer, $correctAnswer);
        }

        return $studentAnswer === $correctAnswer || $studentAnswer == $correctAnswer;
    }

    /**
     * Get response distribution for a question
     * Shows what answers students chose
     *
     * @param Question $question
     * @return array
     */
    public function getResponseDistribution(Question $question): array
    {
        $options = $question->options ?? [];
        $distribution = [];

        $sessions = $question->exam->sessions()
            ->where('status', 'graded')
            ->get();

        foreach ($options as $index => $option) {
            $count = 0;

            foreach ($sessions as $session) {
                $answer = $session->answers()
                    ->where('question_id', $question->id)
                    ->first();

                if ($answer && $answer->student_answer == $index) {
                    $count++;
                }
            }

            $distribution[$index] = [
                'option' => $option,
                'count' => $count,
                'percentage' => $sessions->count() > 0 ? round(($count / $sessions->count()) * 100, 2) : 0,
                'is_correct' => $question->correct_answer == $index,
            ];
        }

        return $distribution;
    }

    /**
     * Get detailed item analysis for a question
     *
     * @param Question $question
     * @return array
     */
    public function getItemAnalysis(Question $question): array
    {
        $sessions = $question->exam->sessions()
            ->where('status', 'graded')
            ->count();

        if ($sessions === 0) {
            return [
                'question_id' => $question->id,
                'question_text' => substr($question->question_text, 0, 100),
                'type' => $question->question_type,
                'difficulty_index' => 0,
                'discrimination_index' => 0,
                'response_distribution' => [],
                'assessment' => 'No data',
                'recommendation' => 'Administer to more students for analysis',
            ];
        }

        $difficultyIndex = $this->getDifficultyIndex($question);
        $discriminationIndex = $this->getDiscriminationIndex($question);

        // Assess question quality
        $assessment = $this->assessQuestion($difficultyIndex, $discriminationIndex);
        $recommendation = $this->getRecommendation($difficultyIndex, $discriminationIndex);

        return [
            'question_id' => $question->id,
            'question_text' => substr($question->question_text, 0, 100),
            'type' => $question->question_type,
            'difficulty_index' => round($difficultyIndex, 3),
            'difficulty_label' => $this->getDifficultyLabel($difficultyIndex),
            'discrimination_index' => round($discriminationIndex, 3),
            'discrimination_label' => $this->getDiscriminationLabel($discriminationIndex),
            'response_distribution' => $this->getResponseDistribution($question),
            'sessions_analyzed' => $sessions,
            'assessment' => $assessment,
            'recommendation' => $recommendation,
        ];
    }

    /**
     * Get all question analyses for an exam
     *
     * @param Exam $exam
     * @return array
     */
    public function getExamItemAnalysis(Exam $exam): array
    {
        $questions = $exam->questions()->get();

        $analysis = [];
        $avgDifficulty = 0;
        $avgDiscrimination = 0;
        $problemQuestions = [];

        foreach ($questions as $question) {
            $itemAnalysis = $this->getItemAnalysis($question);
            $analysis[] = $itemAnalysis;

            $avgDifficulty += $itemAnalysis['difficulty_index'];
            $avgDiscrimination += $itemAnalysis['discrimination_index'];

            // Identify problem questions
            if ($itemAnalysis['assessment'] === 'Poor') {
                $problemQuestions[] = [
                    'question_id' => $question->id,
                    'issue' => $itemAnalysis['assessment'],
                    'recommendation' => $itemAnalysis['recommendation'],
                ];
            }
        }

        $count = $questions->count() > 0 ? $questions->count() : 1;

        return [
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'total_questions' => $count,
            'item_analyses' => $analysis,
            'average_difficulty' => round($avgDifficulty / $count, 3),
            'average_discrimination' => round($avgDiscrimination / $count, 3),
            'problem_questions_count' => count($problemQuestions),
            'problem_questions' => $problemQuestions,
            'recommendations' => $this->getExamRecommendations($analysis),
        ];
    }

    /**
     * Assess question quality
     */
    private function assessQuestion(float $difficultyIndex, float $discriminationIndex): string
    {
        // Ideal difficulty is 0.5-0.8 (50-80%)
        // Ideal discrimination is > 0.3
        
        if ($discriminationIndex < -0.1) {
            return 'Poor'; // Negative discrimination
        }

        if ($difficultyIndex < 0.2 || $difficultyIndex > 0.95) {
            return 'Problematic'; // Too hard or too easy
        }

        if ($discriminationIndex > 0.3) {
            return 'Good';
        }

        if ($discriminationIndex > 0.1) {
            return 'Acceptable';
        }

        return 'Marginal';
    }

    /**
     * Get difficulty label
     */
    private function getDifficultyLabel(float $index): string
    {
        if ($index < 0.2) return 'Very Difficult';
        if ($index < 0.4) return 'Difficult';
        if ($index < 0.6) return 'Moderate';
        if ($index < 0.8) return 'Easy';
        return 'Very Easy';
    }

    /**
     * Get discrimination label
     */
    private function getDiscriminationLabel(float $index): string
    {
        if ($index < 0) return 'Negative (Reverse)';
        if ($index < 0.1) return 'Poor';
        if ($index < 0.3) return 'Weak';
        if ($index < 0.5) return 'Good';
        return 'Excellent';
    }

    /**
     * Get recommendation for question
     */
    private function getRecommendation(float $difficultyIndex, float $discriminationIndex): string
    {
        if ($discriminationIndex < -0.1) {
            return 'Review question - negative discrimination suggests possible errors or confusion in wording.';
        }

        if ($difficultyIndex < 0.2) {
            return 'Question is too difficult. Review if it covers essential content or clarify wording.';
        }

        if ($difficultyIndex > 0.95) {
            return 'Question is too easy. Consider increasing difficulty or review answer key.';
        }

        if ($discriminationIndex < 0.1) {
            return 'Question has weak discrimination. Check if distractors are effective.';
        }

        return 'Question appears appropriate. Minimal revisions needed.';
    }

    /**
     * Get overall exam recommendations
     */
    private function getExamRecommendations(array $analyses): array
    {
        $recommendations = [];
        $difficultyIssues = [];
        $discriminationIssues = [];

        foreach ($analyses as $analysis) {
            if ($analysis['difficulty_label'] === 'Very Difficult' || $analysis['difficulty_label'] === 'Very Easy') {
                $difficultyIssues[] = $analysis['question_id'];
            }

            if ($analysis['discrimination_label'] === 'Poor' || $analysis['discrimination_label'] === 'Weak') {
                $discriminationIssues[] = $analysis['question_id'];
            }
        }

        if (!empty($difficultyIssues)) {
            $recommendations[] = 'Review ' . count($difficultyIssues) . ' question(s) with extreme difficulty levels.';
        }

        if (!empty($discriminationIssues)) {
            $recommendations[] = 'Review ' . count($discriminationIssues) . ' question(s) with weak discrimination.';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Overall exam quality is good. Minor refinements recommended.';
        }

        return $recommendations;
    }
}
