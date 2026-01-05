<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSession;
use Illuminate\Support\Facades\Cache;

/**
 * ExamRandomizationService
 * 
 * Handles question and answer option randomization for exams
 * Maintains consistency across exam session (same student always gets same order)
 */
class ExamRandomizationService
{
    /**
     * Randomize questions for an exam session
     * Uses session ID as seed to ensure consistency
     *
     * @param ExamSession $session
     * @return array Randomized questions with their original indices
     */
    public function getRandomizedQuestions(ExamSession $session): array
    {
        $cacheKey = "exam_randomization_{$session->id}_questions";
        
        // Check if already randomized for this session
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $exam = $session->exam;
        $questions = $exam->questions()->get();
        
        if ($questions->isEmpty()) {
            return [];
        }

        // Seed random with session ID for consistency
        mt_srand((int) crc32($session->id));
        
        // Randomize question order
        $randomized = $questions->shuffle();
        
        // Create mapping of new index to original order
        $result = [];
        foreach ($randomized as $newIndex => $question) {
            $originalIndex = $questions->search(function ($q) use ($question) {
                return $q->id === $question->id;
            });
            
            $result[] = [
                'question' => $question,
                'new_index' => $newIndex,
                'original_index' => $originalIndex,
                'randomized_options' => $this->getRandomizedOptions($question, $session),
            ];
        }

        // Cache for the session duration
        Cache::put($cacheKey, $result, now()->addHours(24));
        
        return $result;
    }

    /**
     * Get randomized answer options for a question
     * 
     * @param $question
     * @param ExamSession $session
     * @return array Randomized options with correct answer mapped
     */
    public function getRandomizedOptions($question, ExamSession $session): array
    {
        // Multiple choice and similar questions need option randomization
        if (!in_array($question->question_type, ['multiple_choice', 'true_false'])) {
            return $question->options ?? [];
        }

        $cacheKey = "exam_randomization_{$session->id}_question_{$question->id}_options";
        
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $options = $question->options ?? [];
        if (empty($options)) {
            return [];
        }

        // Seed with both session and question ID for consistency
        mt_srand((int) crc32($session->id . '_' . $question->id));
        
        // Create array with original indices
        $indexedOptions = [];
        foreach ($options as $index => $option) {
            $indexedOptions[$index] = [
                'value' => $option,
                'original_index' => $index,
                'is_correct' => $this->isCorrectAnswer($question, $index),
            ];
        }

        // Randomize while preserving metadata
        $randomized = collect($indexedOptions)->shuffle()->values()->toArray();
        
        // Update new indices
        $result = [];
        foreach ($randomized as $newIndex => $option) {
            $option['new_index'] = $newIndex;
            $result[$newIndex] = $option;
        }

        Cache::put($cacheKey, $result, now()->addHours(24));
        
        return $result;
    }

    /**
     * Check if an option is the correct answer
     * 
     * @param $question
     * @param int $optionIndex
     * @return bool
     */
    private function isCorrectAnswer($question, int $optionIndex): bool
    {
        $correctAnswer = $question->correct_answer;
        
        if (is_array($correctAnswer)) {
            return in_array($optionIndex, $correctAnswer);
        }
        
        return $optionIndex == $correctAnswer;
    }

    /**
     * Map randomized answer index back to original index
     * This is needed when saving student answers
     * 
     * @param int $randomizedIndex
     * @param ExamSession $session
     * @param $question
     * @return int|null
     */
    public function mapRandomizedToOriginalIndex(int $randomizedIndex, ExamSession $session, $question): ?int
    {
        $randomizedOptions = $this->getRandomizedOptions($question, $session);
        
        if (!isset($randomizedOptions[$randomizedIndex])) {
            return null;
        }
        
        return $randomizedOptions[$randomizedIndex]['original_index'] ?? null;
    }

    /**
     * Get original question order position for a randomized question
     * 
     * @param ExamSession $session
     * @param $question
     * @return int|null
     */
    public function getOriginalQuestionIndex(ExamSession $session, $question): ?int
    {
        $randomized = $this->getRandomizedQuestions($session);
        
        foreach ($randomized as $item) {
            if ($item['question']->id === $question->id) {
                return $item['original_index'];
            }
        }
        
        return null;
    }

    /**
     * Clear randomization cache (when exam needs to be reset)
     * 
     * @param ExamSession $session
     * @return void
     */
    public function clearCache(ExamSession $session): void
    {
        Cache::forget("exam_randomization_{$session->id}_questions");
        
        // Also clear option caches
        $questions = $session->exam->questions()->get();
        foreach ($questions as $question) {
            Cache::forget("exam_randomization_{$session->id}_question_{$question->id}_options");
        }
    }

    /**
     * Check if randomization is enabled for an exam
     * 
     * @param Exam $exam
     * @return bool
     */
    public function isRandomizationEnabled(Exam $exam): bool
    {
        $metadata = $exam->metadata ?? [];
        return $metadata['randomize_questions'] ?? true; // Default to true
    }

    /**
     * Check if option randomization is enabled
     * 
     * @param Exam $exam
     * @return bool
     */
    public function isOptionRandomizationEnabled(Exam $exam): bool
    {
        $metadata = $exam->metadata ?? [];
        return $metadata['randomize_options'] ?? true; // Default to true
    }

    /**
     * Get statistics about question randomization
     * Shows which questions appear most/least in exams
     * 
     * @param Exam $exam
     * @return array
     */
    public function getRandomizationStats(Exam $exam): array
    {
        $sessions = $exam->sessions()
            ->where('status', '!=', 'not_started')
            ->get();

        $questionStats = [];
        
        foreach ($exam->questions as $question) {
            $questionStats[$question->id] = [
                'question_id' => $question->id,
                'title' => substr($question->question_text, 0, 50) . '...',
                'sessions_where_randomized' => $sessions->count(),
                'randomized_positions' => [], // Would track position distribution
            ];
        }

        return $questionStats;
    }
}
