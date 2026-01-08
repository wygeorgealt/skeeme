<?php

namespace App\Services;

use App\Models\Note;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\VectorStoreEntry;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AIQuestionGeneratorService
{
    /**
     * Generate questions from notes using AI
     *
     * @param array|Note|QuestionPool $source - Notes, note IDs, or question pool
     * @param QuestionPool $pool - Target question pool to add questions to
     * @param array $config - Configuration for generation
     *   - count: number of questions to generate (default: 5)
     *   - bloom_levels: array of Bloom's levels to target (default: all)
     *   - types: array of question types (default: ['multiple_choice', 'essay'])
     *   - difficulty: difficulty distribution (default: ['easy' => 0.3, 'medium' => 0.5, 'hard' => 0.2])
     *   - with_review: whether to return for lecturer review (default: true)
     *   - prompt: optional focus/filter for question generation (e.g., "Binary number conversion", "Chapter 3 only")
     * @return array Generated questions with metadata
     */
    public function generate($source, QuestionPool $pool, array $config = []): array
    {
        $config = array_merge([
            'count' => 5,
            'bloom_levels' => ['understand', 'apply', 'analyze', 'evaluate'],
            'types' => ['multiple_choice', 'essay'],
            'difficulty' => ['easy' => 0.3, 'medium' => 0.5, 'hard' => 0.2],
            'with_review' => true,
            'prompt' => '', // Optional focus/filter
        ], $config);

        try {
            // Extract text content from source
            $textContent = $this->extractTextFromSource($source);

            if (empty($textContent)) {
                Log::warning('No text content available for question generation in pool: ' . $pool->id);
                return [];
            }

            // Split content into chunks for better question generation
            $chunks = $this->chunkText($textContent, 500);

            // Generate questions for each chunk
            $generatedQuestions = [];
            $questionsNeeded = $config['count'];

            foreach ($chunks as $chunk) {
                if (count($generatedQuestions) >= $questionsNeeded) {
                    break;
                }

                $questionsForChunk = $this->generateQuestionsFromChunk(
                    $chunk,
                    min(3, $questionsNeeded - count($generatedQuestions)),
                    $config
                );

                $generatedQuestions = array_merge($generatedQuestions, $questionsForChunk);
            }

            // Distribute questions across question types and Bloom's levels
            $distributedQuestions = $this->distributeQuestions(
                array_slice($generatedQuestions, 0, $questionsNeeded),
                $config
            );

            // Save questions to pool
            $savedQuestions = [];
            foreach ($distributedQuestions as $questionData) {
                $question = $this->saveQuestion($pool, $questionData, $config['with_review']);
                $savedQuestions[] = $question;
            }

            Log::info("Generated " . count($savedQuestions) . " questions for pool: {$pool->id}");

            return $savedQuestions;
        } catch (\Exception $e) {
            Log::error("Question generation failed for pool {$pool->id}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate questions from a text chunk
     */
    private function generateQuestionsFromChunk(string $text, int $count, array $config): array
    {
        try {
            $deepseekService = new DeepseekAIService();
            
            // Map difficulty distribution to a single difficulty string if possible, 
            // otherwise use 'mixed' as DeepseekAIService supports it.
            $difficulty = 'mixed';
            
            // DeepseekAIService expects an array of notes/texts
            return $deepseekService->generateQuestions(
                [$text],
                $count,
                $difficulty,
                $config['types'],
                $config['prompt'] ?? ''
            );
        } catch (\Exception $e) {
            Log::error("DeepSeek generation failed for chunk: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate a single question with AI
     * @deprecated Use generateQuestionsFromChunk instead
     */
    private function generateSingleQuestion(string $text, string $bloomLevel, string $type, array $config): ?array
    {
        return null;
    }

    /**
     * Build prompt for DeepSeek API
     * @deprecated Handled by DeepseekAIService
     */
    private function buildPrompt(string $text, string $bloomLevel, string $type): string
    {
        return '';
    }

    /**
     * Call DeepSeek API (placeholder)
     * @deprecated Handled by DeepseekAIService
     */
    private function callDeepSeekAPI(string $prompt): ?array
    {
        return null;
    }


    /**
     * Extract text from various sources
     */
    private function extractTextFromSource($source): string
    {
        $text = '';

        if ($source instanceof QuestionPool) {
            // Get all notes related to this pool's course
            $notes = Note::where('course_id', $source->course_id)
                ->where('embedding_status', 'completed')
                ->get();

            foreach ($notes as $note) {
                $text .= $note->text_content ?? '';
                $text .= "\n\n";
            }
        } elseif ($source instanceof Note) {
            $text = $source->text_content ?? '';
        } elseif (is_array($source)) {
            // Array of notes or note IDs
            foreach ($source as $item) {
                if ($item instanceof Note) {
                    $text .= $item->text_content ?? '';
                } else {
                    $note = Note::find($item);
                    if ($note) {
                        $text .= $note->text_content ?? '';
                    }
                }
                $text .= "\n\n";
            }
        } elseif (is_string($source)) {
            $text = $source;
        }

        return trim($text);
    }

    /**
     * Split text into manageable chunks
     */
    private function chunkText(string $text, int $chunkSize = 500): array
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        $chunks = [];
        $currentChunk = '';
        $currentSize = 0;

        foreach ($sentences as $sentence) {
            $sentenceLength = strlen($sentence);

            if ($currentSize + $sentenceLength > $chunkSize && !empty($currentChunk)) {
                $chunks[] = trim($currentChunk);
                $currentChunk = $sentence;
                $currentSize = $sentenceLength;
            } else {
                $currentChunk .= ' ' . $sentence;
                $currentSize += $sentenceLength;
            }
        }

        if (!empty($currentChunk)) {
            $chunks[] = trim($currentChunk);
        }

        return array_filter($chunks);
    }

    /**
     * Distribute generated questions across types and Bloom's levels
     */
    private function distributeQuestions(array $questions, array $config): array
    {
        $distributed = [];
        $typeCount = count($config['types']);
        $bloomCount = count($config['bloom_levels']);

        foreach ($questions as $index => $question) {
            // Assign question type
            $question['question_type'] = $config['types'][$index % $typeCount];

            // Assign Bloom's level if not already set
            if (!isset($question['bloom_level'])) {
                $question['bloom_level'] = $config['bloom_levels'][$index % $bloomCount];
            }

            $distributed[] = $question;
        }

        return $distributed;
    }

    /**
     * Save generated question to database
     */
    private function saveQuestion(QuestionPool $pool, array $questionData, bool $forReview = true): Question
    {
        $marks = match ($questionData['bloom_level'] ?? 'understand') {
            'remember' => 1,
            'understand' => 2,
            'apply' => 3,
            'analyze' => 4,
            'evaluate' => 5,
            'create' => 6,
            default => 2,
        };

        $question = Question::create([
            'question_pool_id' => $pool->id,
            'uuid' => (string) Str::uuid(),
            'question_type' => $questionData['question_type'],
            'question_text' => $questionData['question_text'],
            'options' => $questionData['options'] ?? null,
            'correct_answer' => $questionData['correct_answer'] ?? null,
            'marks' => $marks,
            'bloom_level' => $questionData['bloom_level'],
            'metadata' => array_merge(
                $questionData['metadata'] ?? [],
                ['requires_review' => $forReview]
            ),
            'status' => $forReview ? 'draft' : 'published',
        ]);

        return $question;
    }

    /**
     * Regenerate a specific question (after lecturer review)
     */
    public function regenerate(Question $question, array $config = []): ?Question
    {
        $pool = $question->questionPool;
        $config = array_merge([
            'bloom_levels' => [$question->bloom_level],
            'types' => [$question->question_type],
        ], $config);

        $generated = $this->generate($pool, $pool, array_merge($config, ['count' => 1]));

        if (empty($generated)) {
            return null;
        }

        // Delete old question
        $question->delete();

        return $generated[0];
    }
}
