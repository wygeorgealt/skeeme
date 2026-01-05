<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Question;
use App\Models\QuestionWeight;
use App\Models\WeightedExamResult;
use Illuminate\Support\Collection;

class WeightedMarkingService
{
    /**
     * Set weight for a question in an exam
     */
    public function setQuestionWeight(Exam $exam, Question $question, float $weight, int $totalMarks, ?string $notes = null): QuestionWeight
    {
        return QuestionWeight::updateOrCreate(
            [
                'exam_id' => $exam->id,
                'question_id' => $question->id,
            ],
            [
                'weight' => $weight,
                'total_marks' => $totalMarks,
                'marking_notes' => $notes,
            ]
        );
    }

    /**
     * Get all weights for an exam
     */
    public function getExamWeights(Exam $exam): Collection
    {
        return QuestionWeight::where('exam_id', $exam->id)
            ->with('question')
            ->get();
    }

    /**
     * Get weight for a specific question in exam
     */
    public function getQuestionWeight(Exam $exam, Question $question): ?QuestionWeight
    {
        return QuestionWeight::where('exam_id', $exam->id)
            ->where('question_id', $question->id)
            ->first();
    }

    /**
     * Calculate total possible marks for an exam
     */
    public function getTotalPossibleMarks(Exam $exam): float
    {
        return QuestionWeight::where('exam_id', $exam->id)
            ->sum(\DB::raw('weight * total_marks'));
    }

    /**
     * Calculate weighted score for exam session
     */
    public function calculateSessionScore(ExamSession $examSession): array
    {
        $exam = $examSession->exam;
        $weights = $this->getExamWeights($exam);
        
        $totalWeightedMarks = 0;
        $totalPossibleMarks = 0;
        $questionResults = [];

        foreach ($weights as $weight) {
            // Get raw marks for this question from exam_answers or grading
            $rawMarks = $this->getRawMarksForQuestion($examSession, $weight->question);
            
            // Calculate weighted result
            $weightedMarks = $weight->calculateWeightedMarks($rawMarks);
            $totalPossible = $weight->getTotalPossibleMarks();

            // Store in database
            WeightedExamResult::updateOrCreate(
                [
                    'exam_session_id' => $examSession->id,
                    'question_id' => $weight->question_id,
                ],
                [
                    'raw_marks' => $rawMarks,
                    'weight' => $weight->weight,
                    'weighted_marks' => $weightedMarks,
                    'total_weighted_marks' => $totalPossible,
                    'calculated_at' => now(),
                ]
            );

            $totalWeightedMarks += $weightedMarks;
            $totalPossibleMarks += $totalPossible;

            $questionResults[] = [
                'question_id' => $weight->question_id,
                'question_text' => $weight->question->question_text,
                'raw_marks' => $rawMarks,
                'weight' => $weight->weight,
                'weighted_marks' => $weightedMarks,
                'total_possible' => $totalPossible,
                'percentage' => $totalPossible > 0 ? round(($weightedMarks / $totalPossible) * 100, 2) : 0,
            ];
        }

        $finalPercentage = $totalPossibleMarks > 0 
            ? round(($totalWeightedMarks / $totalPossibleMarks) * 100, 2) 
            : 0;

        return [
            'total_weighted_marks' => round($totalWeightedMarks, 2),
            'total_possible_marks' => round($totalPossibleMarks, 2),
            'final_percentage' => $finalPercentage,
            'final_grade' => $this->getGradeFromPercentage($finalPercentage),
            'question_results' => $questionResults,
        ];
    }

    /**
     * Get raw marks for a question from exam answers
     */
    private function getRawMarksForQuestion(ExamSession $examSession, Question $question): float
    {
        // Check if already graded
        $examAnswer = $examSession->examAnswers()
            ->where('question_id', $question->id)
            ->first();

        if ($examAnswer && $examAnswer->marks_awarded !== null) {
            return $examAnswer->marks_awarded;
        }

        // If not graded or auto-graded MCQ, calculate
        if ($question->question_type === 'multiple_choice' && $examAnswer) {
            return $examAnswer->marks_obtained > 0 ? $examAnswer->marks_obtained : 0;
        }

        return 0;
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
     * Get weighted results for exam session
     */
    public function getSessionResults(ExamSession $examSession): Collection
    {
        return WeightedExamResult::where('exam_session_id', $examSession->id)
            ->with('question')
            ->get();
    }

    /**
     * Check if exam has weights configured
     */
    public function hasWeightsConfigured(Exam $exam): bool
    {
        return QuestionWeight::where('exam_id', $exam->id)->exists();
    }

    /**
     * Get weight breakdown for display
     */
    public function getWeightBreakdown(Exam $exam): array
    {
        $weights = $this->getExamWeights($exam);
        $totalMarks = $this->getTotalPossibleMarks($exam);

        $breakdown = [];
        foreach ($weights as $weight) {
            $breakdown[] = [
                'question_id' => $weight->question_id,
                'question_text' => $weight->question->question_text,
                'question_type' => $weight->question->question_type,
                'weight' => $weight->weight,
                'total_marks' => $weight->total_marks,
                'total_possible' => $weight->getTotalPossibleMarks(),
                'percentage' => $weight->getWeightPercentage($totalMarks),
                'notes' => $weight->marking_notes,
            ];
        }

        return [
            'total_possible_marks' => $totalMarks,
            'questions' => $breakdown,
        ];
    }

    /**
     * Apply uniform weight to all questions (equal weighting)
     */
    public function applyUniformWeights(Exam $exam, int $totalMarks = 1): void
    {
        $questions = $exam->questions;
        
        foreach ($questions as $question) {
            $this->setQuestionWeight($exam, $question, 1.0, $totalMarks);
        }
    }

    /**
     * Apply weighted distribution (e.g., 50% for section 1, 50% for section 2)
     */
    public function applyWeightByTopic(Exam $exam, array $topicWeights): void
    {
        $questions = $exam->questions()->get();
        $totalMarks = count($questions);

        foreach ($questions as $question) {
            // Since topic column was removed, use learning_objective as alternative identifier
            $identifier = $question->learning_objective ?? 'default';
            $weight = $topicWeights[$identifier] ?? 1.0;
            
            $this->setQuestionWeight($exam, $question, $weight, $totalMarks);
        }
    }

    /**
     * Reset weights to default (1.0 each)
     */
    public function resetWeights(Exam $exam): void
    {
        QuestionWeight::where('exam_id', $exam->id)->delete();
    }
}
