<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamPlagiarismSettings;
use App\Models\PlagiarismCheck;
use App\Models\PlagiarismPenalty;
use App\Models\Question;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * PlagiarismDetectionService
 * 
 * Handles plagiarism detection for exam answers.
 * Supports multiple services and configurable thresholds.
 */
class PlagiarismDetectionService
{
    private const CACHE_DURATION = 3600; // 1 hour

    /**
     * Check answer for plagiarism
     */
    public function checkAnswer(
        ExamSession $session,
        Question $question,
        string $answer,
        bool $async = true
    ): ?PlagiarismCheck {
        // Get plagiarism settings
        $settings = $this->getSettings($session->exam);
        
        if (!$settings || !$settings->plagiarism_check_enabled) {
            return null;
        }

        // Check if question type should be checked
        if (!$settings->shouldCheckQuestionType($question->question_type ?? 'essay')) {
            return null;
        }

        // Don't check very short answers
        if (strlen($answer) < 50) {
            return null;
        }

        // Create plagiarism check record
        $plagiarismCheck = PlagiarismCheck::create([
            'exam_session_id' => $session->id,
            'question_id' => $question->id,
            'student_answer' => $answer,
            'plagiarism_status' => 'pending',
        ]);

        // Run plagiarism check
        if ($async && $settings->check_mode === 'automatic') {
            // Queue for background processing
            dispatch(new \App\Jobs\CheckPlagiarism($plagiarismCheck, $settings));
        } else {
            // Run synchronously
            $this->performCheck($plagiarismCheck, $settings);
        }

        return $plagiarismCheck;
    }

    /**
     * Perform actual plagiarism check
     */
    public function performCheck(PlagiarismCheck $check, ExamPlagiarismSettings $settings): void
    {
        try {
            $check->update(['plagiarism_status' => 'checking']);

            // Get plagiarism score based on service
            $result = match ($settings->plagiarism_service) {
                'internal' => $this->checkInternal($check->student_answer, $settings),
                'turnitin' => $this->checkTurnitin($check->student_answer, $settings),
                'copyscape' => $this->checkCopyscape($check->student_answer, $settings),
                default => $this->checkInternal($check->student_answer, $settings),
            };

            // Update check record
            $check->update([
                'plagiarism_score' => $result['score'],
                'plagiarism_status' => 'checked',
                'similar_content' => $result['similar_content'] ?? [],
                'sources' => $result['sources'] ?? [],
                'metadata' => $result['metadata'] ?? [],
                'checked_at' => now(),
            ]);

            // Check if flagged
            if ($settings->isThresholdExceeded($result['score'])) {
                $this->flagAnswer($check, $settings);
            }

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Plagiarism check failed', [
                'check_id' => $check->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $check->update([
                'plagiarism_status' => 'checked',
                'metadata' => ['error' => $e->getMessage()],
            ]);
        }
    }

    /**
     * Internal plagiarism check (basic similarity matching)
     */
    private function checkInternal(string $answer, ExamPlagiarismSettings $settings): array
    {
        // Get all previous answers from this exam
        $previousAnswers = PlagiarismCheck::where('exam_id', $settings->exam_id)
            ->where('student_answer', '!=', $answer)
            ->pluck('student_answer')
            ->toArray();

        $score = 0;
        $similarContent = [];

        foreach ($previousAnswers as $prevAnswer) {
            $similarity = $this->calculateSimilarity($answer, $prevAnswer);
            if ($similarity > 0.3) {
                $score = max($score, $similarity);
                $similarContent[] = [
                    'content' => substr($prevAnswer, 0, 200),
                    'similarity' => $similarity,
                ];
            }
        }

        // Check against common patterns/templates
        $patternScore = $this->checkCommonPatterns($answer);
        if ($patternScore > $score) {
            $score = $patternScore;
        }

        return [
            'score' => min($score, 1.0),
            'similar_content' => array_slice($similarContent, 0, 5), // Top 5 similar
            'sources' => $patternScore > 0.3 ? ['Common Template/Pattern'] : [],
            'metadata' => ['method' => 'internal_similarity_matching'],
        ];
    }

    /**
     * Check with Turnitin API
     */
    private function checkTurnitin(string $answer, ExamPlagiarismSettings $settings): array
    {
        try {
            $config = $settings->service_config ?? [];
            $apiKey = $config['api_key'] ?? null;
            $apiUrl = $config['api_url'] ?? 'https://api.turnitin.com/v2/submissions';

            if (!$apiKey) {
                throw new \Exception('Turnitin API key not configured');
            }

            $response = Http::withHeaders([
                'X-Turnitin-Integration-Name' => 'Laravel-Exam-System',
                'X-Turnitin-Integration-Version' => '1.0',
            ])
            ->withToken($apiKey)
            ->post($apiUrl, [
                'submission_type' => 'text',
                'text_body' => $answer,
            ])
            ->throw()
            ->json();

            return [
                'score' => $response['similarity_score'] ?? 0,
                'similar_content' => $response['matched_content'] ?? [],
                'sources' => $response['sources'] ?? [],
                'metadata' => ['service' => 'turnitin', 'response' => $response],
            ];

        } catch (\Exception $e) {
            // Fallback to internal check
            return $this->checkInternal($answer, $settings);
        }
    }

    /**
     * Check with Copyscape API
     */
    private function checkCopyscape(string $answer, ExamPlagiarismSettings $settings): array
    {
        try {
            $config = $settings->service_config ?? [];
            $username = $config['username'] ?? null;
            $apiKey = $config['api_key'] ?? null;

            if (!$username || !$apiKey) {
                throw new \Exception('Copyscape credentials not configured');
            }

            // Copyscape API call (simplified)
            $response = Http::post('https://www.copyscape.com/api/', [
                'u' => $username,
                'k' => $apiKey,
                't' => $answer,
                'o' => 'csearch', // Comprehensive search
                'c' => 2, // Result count
            ])->throw()->json();

            $sources = [];
            $maxScore = 0;

            if (isset($response['result'])) {
                foreach ($response['result'] as $result) {
                    $sources[] = $result['url'] ?? 'Unknown Source';
                    $maxScore = max($maxScore, (float) ($result['percentmatched'] ?? 0) / 100);
                }
            }

            return [
                'score' => min($maxScore, 1.0),
                'similar_content' => [],
                'sources' => $sources,
                'metadata' => ['service' => 'copyscape', 'response' => $response],
            ];

        } catch (\Exception $e) {
            // Fallback to internal check
            return $this->checkInternal($answer, $settings);
        }
    }

    /**
     * Calculate similarity between two texts
     */
    private function calculateSimilarity(string $text1, string $text2): float
    {
        // Normalize texts
        $text1 = $this->normalizeText($text1);
        $text2 = $this->normalizeText($text2);

        // Calculate Levenshtein distance
        $distance = levenshtein($text1, $text2);
        $maxLength = max(strlen($text1), strlen($text2));

        if ($maxLength === 0) {
            return 1.0;
        }

        // Convert distance to similarity score (0-1)
        return 1 - ($distance / $maxLength);
    }

    /**
     * Normalize text for comparison
     */
    private function normalizeText(string $text): string
    {
        // Convert to lowercase
        $text = strtolower($text);
        
        // Remove extra whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Remove punctuation (except spaces)
        $text = preg_replace('/[^\w\s]/', '', $text);
        
        return trim($text);
    }

    /**
     * Check for common patterns/templates
     */
    private function checkCommonPatterns(string $answer): float
    {
        $patterns = [
            'In conclusion' => 0.1,
            'Furthermore' => 0.1,
            'However' => 0.05,
            'Therefore' => 0.05,
            'To summarize' => 0.1,
            'It is clear that' => 0.15,
            'Based on the evidence' => 0.15,
        ];

        $score = 0;
        foreach ($patterns as $pattern => $weight) {
            if (stripos($answer, $pattern) !== false) {
                $score += $weight;
            }
        }

        return min($score, 0.3); // Cap at 0.3
    }

    /**
     * Flag answer as plagiarism
     */
    private function flagAnswer(PlagiarismCheck $check, ExamPlagiarismSettings $settings): void
    {
        $check->update([
            'plagiarism_status' => 'flagged',
            'flagged_at' => now(),
        ]);

        // Apply penalty if configured
        if ($settings->penalty_for_flagged !== 'none') {
            $this->applyPenalty($check, $settings);
        }

        // Dispatch event for real-time notification
        dispatch(new \App\Jobs\NotifyPlagiarismFlag($check));
    }

    /**
     * Apply penalty for flagged plagiarism
     */
    public function applyPenalty(
        PlagiarismCheck $check,
        ExamPlagiarismSettings $settings,
        ?string $reason = null
    ): PlagiarismPenalty {
        $penaltyType = $settings->penalty_for_flagged;
        $marksDeducted = 0;

        if ($penaltyType === 'mark_deduction') {
            $marksDeducted = $settings->penalty_marks ?? 5;
        }

        $penalty = PlagiarismPenalty::create([
            'plagiarism_check_id' => $check->id,
            'exam_session_id' => $check->exam_session_id,
            'penalty_type' => $penaltyType,
            'marks_deducted' => $marksDeducted,
            'reason' => $reason ?? 'Plagiarism detected: ' . ($check->plagiarism_score * 100) . '% similarity',
            'applied_at' => now(),
        ]);

        // Update exam session if marks deducted
        if ($marksDeducted > 0) {
            $check->session->decrement('score', $marksDeducted);
        }

        return $penalty;
    }

    /**
     * Get plagiarism settings for exam
     */
    public function getSettings(Exam $exam): ?ExamPlagiarismSettings
    {
        return Cache::remember(
            "plagiarism_settings_{$exam->id}",
            self::CACHE_DURATION,
            fn () => ExamPlagiarismSettings::where('exam_id', $exam->id)->first()
        );
    }

    /**
     * Create default settings for exam
     */
    public function createDefaultSettings(Exam $exam): ExamPlagiarismSettings
    {
        return ExamPlagiarismSettings::create([
            'exam_id' => $exam->id,
            'plagiarism_check_enabled' => true,
            'plagiarism_threshold' => 0.5,
            'check_mode' => 'real_time',
            'checked_question_types' => ['essay', 'short_answer', 'long_answer'],
            'penalty_for_flagged' => 'warning',
            'plagiarism_service' => 'internal',
        ]);
    }

    /**
     * Get plagiarism report for exam
     */
    public function getExamReport(Exam $exam): array
    {
        $checks = PlagiarismCheck::where('exam_id', $exam->id)->get();
        $flagged = $checks->where('plagiarism_status', 'flagged');

        return [
            'total_checks' => $checks->count(),
            'flagged_count' => $flagged->count(),
            'average_score' => $checks->avg('plagiarism_score') ?? 0,
            'highest_score' => $checks->max('plagiarism_score') ?? 0,
            'flagged_percentage' => $checks->count() > 0 
                ? ($flagged->count() / $checks->count()) * 100 
                : 0,
            'by_severity' => [
                'critical' => $checks->where('plagiarism_score', '>=', 0.8)->count(),
                'high' => $checks->where('plagiarism_score', '>=', 0.6)->where('plagiarism_score', '<', 0.8)->count(),
                'medium' => $checks->where('plagiarism_score', '>=', 0.4)->where('plagiarism_score', '<', 0.6)->count(),
                'low' => $checks->where('plagiarism_score', '>=', 0.2)->where('plagiarism_score', '<', 0.4)->count(),
                'minimal' => $checks->where('plagiarism_score', '<', 0.2)->count(),
            ],
        ];
    }

    /**
     * Clear plagiarism cache for exam
     */
    public function clearCache(Exam $exam): void
    {
        Cache::forget("plagiarism_settings_{$exam->id}");
    }
}
