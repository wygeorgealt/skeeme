<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\AdaptiveRoutingRule;
use App\Models\AdaptiveSessionPath;
use Illuminate\Support\Collection;

class AdaptiveExamService
{
    /**
     * Create a question pool for an exam
     */
    public function createPool(Exam $exam, string $name, string $difficulty = 'moderate', ?string $description = null): QuestionPool
    {
        return QuestionPool::create([
            'exam_id' => $exam->id,
            'name' => $name,
            'description' => $description,
            'difficulty' => $difficulty,
            'is_adaptive' => true,
        ]);
    }

    /**
     * Add questions to a pool
     */
    public function addQuestionsToPool(QuestionPool $pool, array $questionIds): void
    {
        $pool->questions()->syncWithoutDetaching($questionIds);
    }

    /**
     * Create a routing rule
     */
    public function createRoutingRule(
        Exam $exam,
        string $ruleName,
        int $questionSequence,
        float $performanceThreshold,
        string $operator,
        QuestionPool $targetPool,
        int $questionsToPresent = 1,
        ?string $description = null
    ): AdaptiveRoutingRule {
        return AdaptiveRoutingRule::create([
            'exam_id' => $exam->id,
            'rule_name' => $ruleName,
            'description' => $description,
            'question_sequence' => $questionSequence,
            'performance_threshold' => $performanceThreshold,
            'operator' => $operator,
            'target_pool_id' => $targetPool->id,
            'questions_to_present' => $questionsToPresent,
            'is_active' => true,
        ]);
    }

    /**
     * Get next questions for adaptive exam
     */
    public function getNextQuestions(ExamSession $examSession, int $questionCount = 1): Collection
    {
        $exam = $examSession->exam;

        // If not adaptive, return linear questions
        if (!$exam->is_adaptive) {
            return $exam->questions()->skip($examSession->questions_answered)->take($questionCount)->get();
        }

        // Get applicable routing rules
        $performance = $this->getSessionPerformance($examSession);
        $sequence = $examSession->questions_answered + 1;

        $applicableRule = AdaptiveRoutingRule::where('exam_id', $exam->id)
            ->where('question_sequence', '<=', $sequence)
            ->where('is_active', true)
            ->orderBy('question_sequence', 'desc')
            ->get()
            ->first(fn($rule) => $rule->appliesToPerformance($performance));

        if ($applicableRule) {
            // Route to specific pool
            $questions = $applicableRule->targetPool
                ->questions()
                ->limit($questionCount)
                ->get();

            // Log the routing
            AdaptiveSessionPath::create([
                'exam_session_id' => $examSession->id,
                'question_pool_id' => $applicableRule->target_pool_id,
                'sequence_number' => $sequence,
                'student_performance_at_point' => $performance,
                'routing_reason' => $applicableRule->rule_name,
                'presented_at' => now(),
            ]);

            return $questions;
        }

        // Fallback: return next linear question
        return $exam->questions()->skip($sequence - 1)->take($questionCount)->get();
    }

    /**
     * Get current session performance (0-1 scale)
     */
    public function getSessionPerformance(ExamSession $examSession): float
    {
        if ($examSession->questions_answered === 0) {
            return 0;
        }

        $totalMarks = $examSession->examAnswers()
            ->whereNotNull('marks_awarded')
            ->sum('marks_awarded');

        $possibleMarks = $examSession->examAnswers()
            ->whereNotNull('marks_awarded')
            ->count() * 1; // Assuming 1 mark per question

        if ($possibleMarks === 0) {
            return 0;
        }

        return $totalMarks / $possibleMarks;
    }

    /**
     * Enable adaptive mode for exam
     */
    public function enableAdaptiveMode(Exam $exam, string $type = 'branching', ?array $config = null): void
    {
        $exam->update([
            'is_adaptive' => true,
            'adaptive_type' => $type,
            'adaptive_config' => $config,
        ]);
    }

    /**
     * Disable adaptive mode
     */
    public function disableAdaptiveMode(Exam $exam): void
    {
        $exam->update([
            'is_adaptive' => false,
            'adaptive_type' => null,
            'adaptive_config' => null,
        ]);

        // Delete routing rules
        AdaptiveRoutingRule::where('exam_id', $exam->id)->delete();
    }

    /**
     * Get all pools for an exam
     */
    public function getExamPools(Exam $exam): Collection
    {
        return QuestionPool::where('exam_id', $exam->id)
            ->where('is_adaptive', true)
            ->orderBy('pool_order')
            ->get();
    }

    /**
     * Get all routing rules for an exam
     */
    public function getExamRoutingRules(Exam $exam): Collection
    {
        return AdaptiveRoutingRule::where('exam_id', $exam->id)
            ->where('is_active', true)
            ->orderBy('question_sequence')
            ->get();
    }

    /**
     * Get student's adaptive path
     */
    public function getSessionPath(ExamSession $examSession): Collection
    {
        return AdaptiveSessionPath::where('exam_session_id', $examSession->id)
            ->with('questionPool')
            ->orderBy('sequence_number')
            ->get();
    }

    /**
     * Get statistics for adaptive exam
     */
    public function getAdaptiveStatistics(Exam $exam): array
    {
        $pools = $this->getExamPools($exam);
        $rules = $this->getExamRoutingRules($exam);

        $poolStats = [];
        foreach ($pools as $pool) {
            $poolStats[] = [
                'pool_id' => $pool->id,
                'pool_name' => $pool->name,
                'difficulty' => $pool->difficulty,
                'question_count' => $pool->getQuestionCount(),
            ];
        }

        return [
            'is_adaptive' => $exam->is_adaptive,
            'adaptive_type' => $exam->adaptive_type,
            'pools_count' => $pools->count(),
            'rules_count' => $rules->count(),
            'pools' => $poolStats,
            'rules' => $rules->map(fn($rule) => [
                'rule_name' => $rule->rule_name,
                'sequence' => $rule->question_sequence,
                'threshold' => $rule->performance_threshold,
                'target_pool' => $rule->targetPool->name,
            ])->toArray(),
        ];
    }

    /**
     * Clone pools and rules to another exam
     */
    public function cloneAdaptiveConfig(Exam $sourceExam, Exam $targetExam): void
    {
        $sourcePools = $this->getExamPools($sourceExam);
        $poolMap = [];

        // Clone pools
        foreach ($sourcePools as $pool) {
            $newPool = $this->createPool(
                $targetExam,
                $pool->name,
                $pool->difficulty,
                $pool->description
            );
            $poolMap[$pool->id] = $newPool->id;

            // Add same questions
            $this->addQuestionsToPool($newPool, $pool->questions->pluck('id')->toArray());
        }

        // Clone routing rules with new pool IDs
        $sourceRules = $this->getExamRoutingRules($sourceExam);
        foreach ($sourceRules as $rule) {
            $newPoolId = $poolMap[$rule->target_pool_id] ?? null;
            if ($newPoolId) {
                $this->createRoutingRule(
                    $targetExam,
                    $rule->rule_name,
                    $rule->question_sequence,
                    $rule->performance_threshold,
                    $rule->operator,
                    QuestionPool::find($newPoolId),
                    $rule->questions_to_present,
                    $rule->description
                );
            }
        }

        // Copy adaptive config
        if ($sourceExam->is_adaptive) {
            $this->enableAdaptiveMode(
                $targetExam,
                $sourceExam->adaptive_type,
                $sourceExam->adaptive_config
            );
        }
    }

    /**
     * Get difficulty-based pools
     */
    public function getPoolsByDifficulty(Exam $exam, string $difficulty): Collection
    {
        return QuestionPool::where('exam_id', $exam->id)
            ->where('difficulty', $difficulty)
            ->where('is_adaptive', true)
            ->get();
    }

    /**
     * Reset adaptive configuration
     */
    public function resetAdaptiveConfig(Exam $exam): void
    {
        // Delete pools
        $pools = $this->getExamPools($exam);
        foreach ($pools as $pool) {
            $pool->delete();
        }

        // Delete routing rules
        AdaptiveRoutingRule::where('exam_id', $exam->id)->delete();

        // Disable adaptive mode
        $this->disableAdaptiveMode($exam);
    }
}
