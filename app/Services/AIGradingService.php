<?php

namespace App\Services;

use App\Models\AIGrading;
use App\Models\ExamAnswer;
use App\Models\ExamSession;
use App\Models\Question;
use Illuminate\Support\Facades\Log;

class AIGradingService
{
    /**
     * Grade all answers in an exam session
     *
     * @param ExamSession $session
     * @return array Results of grading
     */
    public function gradeSession(ExamSession $session): array
    {
        if ($session->status !== 'submitted') {
            throw new \InvalidArgumentException('Can only grade submitted sessions');
        }

        $answers = $session->answers()->get();
        $results = [
            'total_answers' => 0,
            'auto_marked' => 0,
            'ai_graded' => 0,
            'requires_review' => 0,
            'total_marks' => 0,
            'session_score' => 0,
            'gradings' => [],
        ];

        foreach ($answers as $answer) {
            try {
                $grading = $this->gradeAnswer($answer);
                $results['total_answers']++;
                $results['total_marks'] += $grading->marks_awarded;

                if ($grading->grading_method === 'auto_mark') {
                    $results['auto_marked']++;
                } else {
                    $results['ai_graded']++;
                }

                if ($grading->requiresReview()) {
                    $results['requires_review']++;
                }

                $results['gradings'][] = $grading;
            } catch (\Exception $e) {
                Log::error("Failed to grade answer {$answer->id}: " . $e->getMessage());
            }
        }

        // Calculate session score
        if ($session->exam->total_marks > 0) {
            $results['session_score'] = ($results['total_marks'] / $session->exam->total_marks) * 100;
        }

        // Update session with score and grading status
        $session->update([
            'status' => 'graded',
            'score' => $results['total_marks'],
            'graded_at' => now(),
        ]);

        return $results;
    }

    /**
     * Grade a single answer
     */
    public function gradeAnswer(ExamAnswer $answer): AIGrading
    {
        // Check if already graded
        $existing = AIGrading::where('exam_answer_id', $answer->id)->first();
        if ($existing) {
            return $existing;
        }

        $question = $this->getQuestion($answer);
        $marks = $question->marks ?? 1;

        // Route to appropriate grading method
        if ($question->question_type === 'multiple_choice' || $question->question_type === 'true_false') {
            return $this->autoMarkMCQ($answer, $question, $marks);
        } else {
            return $this->gradeEssay($answer, $question, $marks);
        }
    }

    /**
     * Auto-mark multiple choice questions
     */
    private function autoMarkMCQ(ExamAnswer $answer, $question, float $marks): AIGrading
    {
        $isCorrect = false;
        $reasoning = '';

        if ($question->question_type === 'true_false') {
            // Simple true/false comparison
            $correctAnswer = $question->correct_answer;
            $studentAnswer = strtolower(trim($answer->student_answer));

            if (is_array($correctAnswer)) {
                $expectedAnswer = strtolower($correctAnswer[0] ?? '');
            } else {
                $expectedAnswer = strtolower($correctAnswer ?? '');
            }

            $isCorrect = $studentAnswer === $expectedAnswer;
            $reasoning = $isCorrect
                ? "Correct answer to true/false question"
                : "Incorrect answer. Expected: $expectedAnswer, Got: $studentAnswer";
        } else {
            // Multiple choice
            $correctOption = collect($question->options)->first(function ($option) {
                return $option['is_correct'] ?? false;
            });

            if ($correctOption) {
                $correctId = $correctOption['id'] ?? null;
                $isCorrect = ($answer->student_answer === $correctId);

                if ($isCorrect) {
                    $reasoning = "Correct: " . ($correctOption['text'] ?? 'Option selected correctly');
                } else {
                    $reasoning = "Incorrect: Selected option does not match correct answer: " . ($correctOption['text'] ?? 'the correct option');
                }
            }
        }

        $marksAwarded = $isCorrect ? $marks : 0;
        $confidence = 100; // MCQ auto-marking has 100% confidence

        $grading = AIGrading::create([
            'exam_answer_id' => $answer->id,
            'exam_session_id' => $answer->examSession->id,
            'grading_method' => 'auto_mark',
            'marks_awarded' => $marksAwarded,
            'confidence_score' => $confidence,
            'confidence_threshold' => 100,
            'reasoning' => $reasoning,
            'analysis_details' => [
                'question_type' => $question->question_type,
                'correct_answer' => $this->maskCorrectAnswer($question->correct_answer),
                'student_answer' => $answer->student_answer,
                'is_correct' => $isCorrect,
            ],
            'status' => 'approved', // Auto-marked MCQ is automatically approved
        ]);

        $answer->update([
            'marks_obtained' => $marksAwarded,
            'marking_status' => 'auto_marked',
            'grading_details' => [
                'confidence_score' => $confidence,
                'reasoning' => $reasoning,
            ],
        ]);

        return $grading;
    }

    /**
     * Grade essay using AI and rubric
     */
    private function gradeEssay(ExamAnswer $answer, $question, float $marks): AIGrading
    {
        $studentAnswer = $answer->student_answer;
        $rubric = $question->correct_answer['rubric'] ?? [];
        $modelAnswer = $question->correct_answer['model_answer'] ?? '';

        // Call comprehensive essay grading
        $gradingResult = $this->callAIEssayGrading(
            $studentAnswer,
            $modelAnswer,
            $rubric,
            (float) $marks,
            $answer->examSession->exam
        );

        $marksAwarded = $gradingResult['marks'] ?? 0;
        $confidence = $gradingResult['confidence'] ?? 60;
        $reasoning = $gradingResult['reasoning'] ?? 'AI essay grading analysis';
        $analysisDetails = $gradingResult['analysis'] ?? [];
        $aiGeneratedFeedback = $gradingResult['ai_feedback'] ?? '';
        $plagiarismScore = $gradingResult['plagiarism_score'] ?? 0;
        $consistencyScore = $gradingResult['consistency_score'] ?? 100;

        $grading = AIGrading::create([
            'exam_answer_id' => $answer->id,
            'exam_session_id' => $answer->examSession->id,
            'grading_method' => 'ai_essay',
            'marks_awarded' => $marksAwarded,
            'confidence_score' => $confidence,
            'confidence_threshold' => 75,
            'reasoning' => $reasoning,
            'analysis_details' => $analysisDetails,
            'ai_feedback' => $aiGeneratedFeedback,
            'plagiarism_score' => $plagiarismScore,
            'consistency_score' => $consistencyScore,
            'status' => 'pending_review', // All essays need review
        ]);

        $answer->update([
            'marks_obtained' => $marksAwarded,
            'marking_status' => 'ai_graded',
            'grading_details' => [
                'confidence_score' => $confidence,
                'reasoning' => $reasoning,
                'analysis' => $analysisDetails,
                'ai_feedback' => $aiGeneratedFeedback,
                'plagiarism_score' => $plagiarismScore,
            ],
        ]);

        return $grading;
    }

    /**
     * Call AI essay grading with enhanced analysis
     */
    private function callAIEssayGrading(
        string $studentAnswer,
        string $modelAnswer,
        array $rubric,
        float $totalMarks,
        $exam = null
    ): array {
        // Extract quality metrics
        $metrics = $this->analyzeAnswerQuality($studentAnswer, $modelAnswer);
        $contentSimilarity = $metrics['content_similarity'];
        $wordCount = $metrics['word_count'];
        $conceptMatches = $metrics['concept_matches'];
        $structureScore = $metrics['structure_score'];
        
        // Check for plagiarism (placeholder implementation)
        $plagiarismScore = $this->detectPlagiarism($studentAnswer);
        
        // Check consistency across exam (if multiple answers from same student)
        $consistencyScore = $this->checkAnswerConsistency($studentAnswer, $exam);
        
        // Calculate partial credit based on rubric
        $rubricScores = $this->scoreByRubric($studentAnswer, $modelAnswer, $rubric);
        $marksAwarded = min($totalMarks, array_sum($rubricScores));
        
        // Calculate confidence
        $baseConfidence = ($contentSimilarity * 0.4 + $conceptMatches * 0.3 + $structureScore * 0.3);
        $plagiarismPenalty = $plagiarismScore > 50 ? 20 : 0; // Reduce confidence if plagiarism suspected
        $confidence = max(0, $baseConfidence - $plagiarismPenalty);
        
        // Generate AI feedback
        $aiGeneratedFeedback = $this->generateAIFeedback(
            $studentAnswer,
            $metrics,
            $rubricScores,
            $rubric,
            $marksAwarded,
            $totalMarks
        );

        return [
            'marks' => $marksAwarded,
            'confidence' => round($confidence, 2),
            'reasoning' => "Content similarity: {$contentSimilarity}%. Key concepts found: {$conceptMatches}%. " .
                          "Structure quality: {$structureScore}%. Word count: {$wordCount}.",
            'analysis' => [
                'word_count' => $wordCount,
                'character_count' => strlen($studentAnswer),
                'content_similarity' => round($contentSimilarity, 2),
                'concept_matches' => round($conceptMatches, 2),
                'structure_score' => round($structureScore, 2),
                'rubric_scores' => $rubricScores,
                'key_concepts_found' => $metrics['matched_concepts'],
                'sentence_avg_length' => round($metrics['avg_sentence_length'], 2),
                'readability_score' => round($metrics['readability'], 2),
            ],
            'ai_feedback' => $aiGeneratedFeedback,
            'plagiarism_score' => round($plagiarismScore, 2),
            'consistency_score' => round($consistencyScore, 2),
        ];
    }

    /**
     * Analyze answer quality with multiple metrics
     */
    private function analyzeAnswerQuality(string $student, string $model): array
    {
        $studentWords = array_filter(preg_split('/\s+/', strtolower($student)));
        $modelWords = array_filter(preg_split('/\s+/', strtolower($model)));
        $studentSentences = preg_split('/[.!?]+/', $student, -1, PREG_SPLIT_NO_EMPTY);

        // Content similarity (word overlap)
        $matches = count(array_intersect($studentWords, $modelWords));
        $contentSimilarity = empty($modelWords) ? 50 : ($matches / max(count($studentWords), count($modelWords))) * 100;

        // Concept matching
        $concepts = $this->extractKeyConceptMatches($student, $model);
        $conceptScore = empty($concepts) ? 0 : min(100, (count($concepts) / 5) * 100);

        // Structure scoring (sentence count, paragraph structure)
        $studentSentenceCount = count($studentSentences);
        $structureScore = min(100, ($studentSentenceCount / 10) * 50 + 50); // 50-100 based on sentence count

        // Readability (average sentence length)
        $avgSentenceLength = empty($studentSentences) ? 0 : 
            array_sum(array_map(fn($s) => str_word_count($s), $studentSentences)) / count($studentSentences);
        $readabilityScore = min(100, abs(15 - $avgSentenceLength) < 20 ? 100 : 60); // Ideal 15 words/sentence

        return [
            'content_similarity' => min(100, $contentSimilarity),
            'word_count' => count($studentWords),
            'concept_matches' => min(100, $conceptScore),
            'structure_score' => $structureScore,
            'readability' => $readabilityScore,
            'matched_concepts' => $concepts,
            'avg_sentence_length' => $avgSentenceLength,
            'sentence_count' => $studentSentenceCount,
        ];
    }

    /**
     * Score answer against rubric criteria
     */
    private function scoreByRubric(string $studentAnswer, string $modelAnswer, array $rubric): array
    {
        $scores = [];
        
        foreach ($rubric as $criterion => $maxPoints) {
            $score = 0;
            
            switch ($criterion) {
                case 'completeness':
                    // Score based on word count (50+ words = full marks)
                    $wordCount = str_word_count($studentAnswer);
                    $score = min($maxPoints, ($wordCount / 50) * $maxPoints);
                    break;
                    
                case 'accuracy':
                    // Score based on content similarity
                    $similarity = $this->estimateContentSimilarity($studentAnswer, $modelAnswer);
                    $score = ($similarity / 100) * $maxPoints;
                    break;
                    
                case 'clarity':
                    // Score based on avg sentence length and structure
                    $sentences = preg_split('/[.!?]+/', $studentAnswer, -1, PREG_SPLIT_NO_EMPTY);
                    $avgLength = empty($sentences) ? 0 : 
                        array_sum(array_map(fn($s) => str_word_count($s), $sentences)) / count($sentences);
                    $clarity = abs(15 - $avgLength) < 20 ? 100 : 60;
                    $score = ($clarity / 100) * $maxPoints;
                    break;
                    
                case 'reasoning':
                    // Score based on keyword presence
                    $keywords = ['because', 'therefore', 'as a result', 'in conclusion', 'evidence'];
                    $keywordCount = count(array_filter($keywords, 
                        fn($k) => stripos($studentAnswer, $k) !== false));
                    $score = ($keywordCount / count($keywords)) * $maxPoints;
                    break;
                    
                default:
                    $score = $maxPoints * 0.75; // Default 75%
            }
            
            $scores[$criterion] = round(min($maxPoints, $score), 2);
        }
        
        return $scores;
    }

    /**
     * Detect potential plagiarism (placeholder)
     */
    private function detectPlagiarism(string $answer): float
    {
        // Placeholder: would integrate with plagiarism detection API
        // For now, check for suspicious patterns
        $suspiciousPatterns = [
            'copied from' => 5,
            'found online' => 5,
            'from wikipedia' => 10,
            'from textbook' => 3,
        ];
        
        $score = 0;
        foreach ($suspiciousPatterns as $pattern => $weight) {
            if (stripos($answer, $pattern) !== false) {
                $score += $weight;
            }
        }
        
        // Check for unusually high technical complexity (simple heuristic)
        $jargonWords = ['therefore', 'furthermore', 'moreover', 'notwithstanding', 'paradigm'];
        $jargonCount = count(array_filter($jargonWords, 
            fn($w) => stripos($answer, $w) !== false));
        
        // If lots of jargon in short answer, might be copied
        if ($jargonCount > 2 && str_word_count($answer) < 50) {
            $score += 10;
        }
        
        return min(100, $score);
    }

    /**
     * Check consistency of answers across exam
     */
    private function checkAnswerConsistency(string $currentAnswer, $exam = null): float
    {
        // This checks if answer maintains consistent writing style/quality across multiple answers
        // For now, return high score (would need to compare with other answers from same session)
        if (!$exam) {
            return 100;
        }
        
        // Placeholder: in real implementation, would compare with other answers
        return 100;
    }

    /**
     * Generate AI-powered feedback for student
     */
    private function generateAIFeedback(
        string $studentAnswer,
        array $metrics,
        array $rubricScores,
        array $rubric,
        float $marksAwarded,
        float $totalMarks
    ): string {
        $feedback = [];
        
        // Positive feedback
        if ($metrics['content_similarity'] > 75) {
            $feedback[] = "✓ Excellent content alignment with key concepts.";
        } else if ($metrics['content_similarity'] > 50) {
            $feedback[] = "✓ Good understanding of main concepts.";
        }
        
        if ($metrics['structure_score'] > 80) {
            $feedback[] = "✓ Well-structured response with clear organization.";
        }
        
        // Areas for improvement
        if ($metrics['concept_matches'] < 50) {
            $feedback[] = "→ Consider including more key concepts and terminology from the topic.";
        }
        
        if ($metrics['avg_sentence_length'] > 25) {
            $feedback[] = "→ Try breaking down longer sentences for better clarity.";
        } else if ($metrics['avg_sentence_length'] < 8) {
            $feedback[] = "→ Expand your sentences to provide more detail and explanation.";
        }
        
        // Rubric-specific feedback
        foreach ($rubricScores as $criterion => $score) {
            $maxPoints = $rubric[$criterion] ?? 5;
            if ($score < $maxPoints * 0.5) {
                $feedback[] = "→ {$criterion}: This could be stronger. Focus on being more [{$criterion}].";
            }
        }
        
        // Overall encouragement
        $percentage = ($marksAwarded / $totalMarks) * 100;
        if ($percentage >= 80) {
            $feedback[] = "🌟 Excellent work! Keep it up!";
        } else if ($percentage >= 60) {
            $feedback[] = "💡 Good effort. Review the weak areas and try again.";
        } else {
            $feedback[] = "📚 Review the material and focus on understanding the core concepts.";
        }
        
        return implode("\n", $feedback);
    }

    /**
     * Estimate content similarity between student and model answer
     */
    private function estimateContentSimilarity(string $student, string $model): float
    {
        // Simple implementation: compare word overlap
        $studentWords = array_map('strtolower', preg_split('/\W+/', $student, -1, PREG_SPLIT_NO_EMPTY));
        $modelWords = array_map('strtolower', preg_split('/\W+/', $model, -1, PREG_SPLIT_NO_EMPTY));

        if (empty($modelWords)) {
            return 50;
        }

        $matches = count(array_intersect($studentWords, $modelWords));
        return ($matches / max(count($studentWords), count($modelWords))) * 100;
    }

    /**
     * Extract key concepts found in student answer
     */
    private function extractKeyConceptMatches(string $studentAnswer, string $modelAnswer): array
    {
        // TODO: Implement actual concept extraction
        // For now, return simulated matches
        $concepts = [];
        $keyPhrases = ['important', 'key', 'concept', 'explain', 'define'];

        foreach ($keyPhrases as $phrase) {
            if (stripos($studentAnswer, $phrase) !== false && stripos($modelAnswer, $phrase) !== false) {
                $concepts[] = $phrase;
            }
        }

        return $concepts;
    }

    /**
     * Get question from answer (either embedded or from pool)
     */
    private function getQuestion(ExamAnswer $answer): ?object
    {
        $exam = $answer->examSession->exam;

        // If question from pool
        if (isset($exam->question_pool_id)) {
            $question = Question::where('question_pool_id', $exam->question_pool_id)
                ->get()
                ->get($answer->question_index);

            if ($question) {
                return $question;
            }
        }

        // If embedded question in exam
        if ($exam->questions && isset($exam->questions[$answer->question_index])) {
            $embeddedQ = $exam->questions[$answer->question_index];

            // Convert to object for consistent interface
            return (object) [
                'question_type' => $embeddedQ['type'] ?? 'multiple_choice',
                'marks' => $embeddedQ['marks'] ?? 1,
                'options' => $embeddedQ['options'] ?? [],
                'correct_answer' => $embeddedQ['correct_answer'] ?? $embeddedQ['expected'] ?? null,
            ];
        }

        return null;
    }

    /**
     * Mask correct answer for security (don't expose in details)
     */
    private function maskCorrectAnswer($answer): string
    {
        return '[REDACTED]';
    }

    /**
     * Get pending grades for lecturer review
     */
    public function getPendingReview(int $lecturerId, int $limit = 20)
    {
        return AIGrading::whereHas('examAnswer.examSession.exam', function ($q) use ($lecturerId) {
            $q->where('lecturer_id', $lecturerId);
        })
            ->where('status', 'pending_review')
            ->orWhere('status', 'rejected')
            ->orderBy('confidence_score', 'asc')
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get statistics for a session
     */
    public function getSessionStatistics(ExamSession $session): array
    {
        $gradings = AIGrading::where('exam_session_id', $session->id)->get();

        $stats = [
            'total_gradings' => $gradings->count(),
            'approved' => $gradings->where('status', 'approved')->count(),
            'pending_review' => $gradings->where('status', 'pending_review')->count(),
            'revised' => $gradings->where('status', 'revised')->count(),
            'rejected' => $gradings->where('status', 'rejected')->count(),
            'auto_marked' => $gradings->where('grading_method', 'auto_mark')->count(),
            'ai_graded' => $gradings->where('grading_method', 'ai_essay')->count(),
            'average_confidence' => $gradings->avg('confidence_score'),
            'total_marks' => $gradings->sum('marks_awarded'),
            'overridden_count' => $gradings->whereNotNull('lecturer_override_marks')->count(),
        ];

        return $stats;
    }
}
