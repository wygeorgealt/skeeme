<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamAnswer;
use App\Models\ExamSession;
use App\Models\Question;
use Illuminate\Support\Facades\Log;

class GradingService
{
    protected $aiService;

    public function __construct(DeepseekAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Grade an entire exam session
     */
    public function gradeSession(ExamSession $session): void
    {
        if ($session->status === 'graded') {
            return;
        }

        $session->load(['exam.questions', 'examAnswers']);
        $totalReceivedMarks = 0;
        $questionsAnswered = 0;

        foreach ($session->exam->questions as $question) {
            // Find student's answer for this question
            // We need to handle potential index mismatches if randomization was used
            // But ExamAnswer stores 'question_id' ideally? 
            // Currently ExamAnswer uses 'question_index' and 'question_pool_id' isn't fully clear 
            // but let's assume we map by index or we should rely on question_id if available.
            // Looking at StudentExamDelivery, we save by `question_index`. 
            // We should ensure we can map back to the actual Question model.
            
            // For now, let's look up the answer by the index in the question list
            // NOTE: This assumes the exam questions order in DB matches the 'question_index' 
            // stored in ExamAnswer. Randomization logic in StudentExamDelivery 
            // saves the *original* index, so this should match $session->exam->questions order.

            // Try to find answer by question_id (more robust)
            $answer = $session->getRelation('examAnswers')->firstWhere('question_id', $question->id);

            // Fallback to index if question_id lookup fails (backwards compatibility)
            if (!$answer) {
                $questionIndex = $this->getQuestionIndex($session->exam, $question);
                $answer = $session->getRelation('examAnswers')->firstWhere('question_index', $questionIndex);
            } else {
                 $questionIndex = $this->getQuestionIndex($session->exam, $question);
            }

            if (!$answer) {
                // Create a blank answer entry if not found
                $answer = $session->examAnswers()->create([
                    'question_index' => $questionIndex,
                    'question_id' => $question->id,
                    'student_answer' => null,
                    'marks_obtained' => 0,
                    'marking_status' => 'not_attempted',
                ]);
            } else {
                // Ensure question_id is set if it wasn't
                if (!$answer->question_id) {
                    $answer->update(['question_id' => $question->id]);
                }
            }

            // Grade the question
            $this->gradeQuestion($question, $answer);

            $totalReceivedMarks += $answer->marks_obtained;
            if ($answer->student_answer) {
                $questionsAnswered++;
            }
        }

        // Update session status
        $session->update([
            'status' => 'graded',
            'graded_at' => now(),
            'score' => $totalReceivedMarks,
            'questions_answered' => $questionsAnswered, // Update accurate count
        ]);
    }

    /**
     * Grade a single question/answer
     */
    public function gradeQuestion(Question $question, ExamAnswer $answer): void
    {
        // Skip if already manually marked (optional, depending on policy)
        if ($answer->marking_status === 'pending_review') {
            return;
        }

        if (empty($answer->student_answer)) {
            $answer->update([
                'marks_obtained' => 0,
                'marking_status' => 'not_attempted',
                'feedback' => 'Not answered.',
            ]);
            return;
        }

        if ($question->isMultipleChoice()) {
            $this->gradeMCQ($question, $answer);
        } else {
            // Essay / Theory -> AI Grading
            $this->gradeEssayWithAI($question, $answer);
        }
    }

    /**
     * Auto-grade MCQ
     */
    protected function gradeMCQ(Question $question, ExamAnswer $answer): void
    {
        $isCorrect = $question->isAnswerCorrect($answer->student_answer);
        
        $answer->update([
            'marks_obtained' => $isCorrect ? $question->marks : 0,
            'marking_status' => 'auto_marked',
            'feedback' => $isCorrect ? 'Correct' : 'Incorrect',
        ]);
    }

    /**
     * AI-grade Essay/Theory
     */
    protected function gradeEssayWithAI(Question $question, ExamAnswer $answer): void
    {
        try {
            // Construct prompt for AI
            $prompt = $this->buildGradingPrompt($question, $answer);
            
            // Call AI Service
            // Expecting JSON response: { "score": number, "feedback": string, "confidence": number, "reasoning": string }
            $result = $this->aiService->generateResponse($prompt, true); 

            if (!$result || !isset($result['score'])) {
                throw new \Exception("Invalid AI response");
            }

            // Validate score range
            $score = min($question->marks, max(0, floatval($result['score'])));

            $answer->update([
                'marks_obtained' => $score,
                'marking_status' => 'ai_graded',
                'feedback' => $result['feedback'] ?? null,
                'grading_details' => [
                    'confidence_score' => $result['confidence'] ?? 0,
                    'reasoning' => $result['reasoning'] ?? null,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("AI Grading failed for Answer {$answer->id}: " . $e->getMessage());
            
            // Fallback to unmarked so lecturer sees it needs attention
            $answer->update([
                'marking_status' => 'pending_review', // Or 'failed_grading'
                'feedback' => 'AI Grading failed. Please review manually.',
            ]);
        }
    }

    /**
     * Build prompt for AI grading
     */
    protected function buildGradingPrompt(Question $question, ExamAnswer $answer): string
    {
        return <<<EOT
You are an expert academic grader. Grade the following student answer based on the question and correct answer/marking scheme provided.

**Question:**
{$question->question_text}

**Max Marks:** {$question->marks}

**Correct Answer / Marking Guide:**
{$question->correct_answer} (Note: This might be a model answer or key points)

**Student Answer:**
{$answer->student_answer}

**Instructions:**
1. Evaluate the student's answer against the correct answer/key points.
2. Assign a score between 0 and {$question->marks}. Partial marks are allowed.
3. Provide brief, constructive feedback for the student.
4. Explain your reasoning for the score (for the lecturer).
5. Provide a confidence score (0-1) in your grading.

Return ONLY a JSON object with this structure:
{
    "score": <float>,
    "feedback": "<string_for_student>",
    "reasoning": "<string_for_lecturer>",
    "confidence": <float>
}
EOT;
    }

    /**
     * Synchronize session results with the Grade model and update GPA.
     * This is the core logic for the autosave functionality.
     */
    public function syncSessionResults(ExamSession $session): void
    {
        // 1. Recalculate total score for the session
        $totalScore = $session->examAnswers()->sum('marks_obtained');
        
        // 2. Update session
        // Only move to 'graded' if it's currently 'submitted'. 
        // If it's already 'published', keep it 'published'.
        $newStatus = $session->status === 'submitted' ? 'graded' : $session->status;

        $session->update([
            'score' => $totalScore,
            'status' => $newStatus,
            'graded_at' => $session->graded_at ?? now()
        ]);

        // 3. Update or Create Grade record
        $student = $session->student;
        $exam = $session->exam;
        
        // Calculate Grade Letter
        $percentage = ($totalScore / ($exam->total_marks ?: 100)) * 100;
        $gradeLetter = app(\App\Services\GPACalculationService::class)->calculateLetterGrade($percentage);

        \App\Models\Grade::updateOrCreate(
            [
                'student_id' => $student->id,
                'course_id' => $exam->course_id,
                'exam_id' => $exam->id,
            ],
            [
                'score' => $totalScore,
                'grade' => $gradeLetter,
                'credit_units' => $exam->course->credit_units ?? 3,
                'graded_at' => now(),
            ]
        );

        // 4. Update Student GPA
        app(\App\Services\GPACalculationService::class)->updateStudentGPA($student);

        // 5. Check if exam should transition to 'ended'
        if ($session->status === 'published') {
            $exam->checkAndEndStatus();
        }
    }

    /**
     * Helper to find the index of a question in the exam's collection
     */
    protected function getQuestionIndex(Exam $exam, Question $question)
    {
        // This relies on the collection being in the same order as 'exam_questions.order'
        // which calls to $exam->questions should honor if set up with orderBy pivot.
        
        // We iterate to find the index. 
        foreach ($exam->questions as $index => $q) {
            if ($q->id === $question->id) {
                return $index;
            }
        }
        return -1;
    }
}
