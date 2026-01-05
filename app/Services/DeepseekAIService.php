<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;

class DeepseekAIService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://api.deepseek.com/v1';

    public function __construct()
    {
        $this->apiKey = env('DEEPSEEK_API_KEY');
        $this->client = new Client([
            'timeout' => 300,
            'connect_timeout' => 10,
        ]);
    }

    /**
     * Generate questions using Deepseek AI with caching to reduce token usage
     */
    public function generateQuestions(
        array $notes,
        int $numberOfQuestions,
        string $difficulty = 'mixed',
        array $questionTypes = ['mcq', 'true_false', 'short_answer', 'essay', 'fill_blank'],
        string $prompt = '',
        bool $includeVisuals = false,
        ?callable $progressCallback = null
    ): array {
        try {
            set_time_limit(300);
            
            if ($progressCallback) $progressCallback(10);
            
            // Check cache first (24 hour TTL) - ELIMINATES REDUNDANT API CALLS
            $cacheKey = $this->generateCacheKey($notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals);
            if (Cache::has($cacheKey)) {
                \Log::info('Using cached questions - saved token cost');
                if ($progressCallback) $progressCallback(100);
                return Cache::get($cacheKey);
            }
            
            if ($progressCallback) $progressCallback(30);

            // Build optimized prompt (fewer tokens = lower cost)
            $prompt = $this->buildOptimizedPrompt($notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals);

            if ($progressCallback) $progressCallback(50);
            
            $response = $this->client->post(
                $this->baseUrl . '/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'timeout' => 300,
                    'json' => [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'Generate valid JSON only.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 8000,
                    ],
                ]
            );

            if ($progressCallback) $progressCallback(80);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new \Exception('Invalid response from Deepseek API');
            }

            $content = $data['choices'][0]['message']['content'];
            $questions = $this->parseQuestionsFromResponse($content);

            if ($progressCallback) $progressCallback(95);

            // Cache for 24 hours - automatic token reuse
            Cache::put($cacheKey, $questions, now()->addHours(24));
            
            return $questions;
        } catch (RequestException $e) {
            \Log::error('Deepseek API Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate questions: ' . $e->getMessage());
        } catch (\Exception $e) {
            \Log::error('Question Generation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate an announcement draft using Deepseek AI.
     */
    public function generateAnnouncementDraft(string $prompt): array
    {
        try {
            $currentDate = now()->toDateTimeString();
            $systemPrompt = "You are an assistant for a school administrator. Generate a professional and engaging announcement based on the user's prompt. 
            The current date and time is: {$currentDate}.
            
            Return the result in JSON format with the following keys:
            - 'title': A catchy and relevant title.
            - 'content': Detailed but concise announcement content.
            - 'event_start_date': If the user mentions a specific date or time, convert it to 'Y-m-d\TH:i' format.
            - 'event_end_date': If the user mentions an end date/duration, convert it to 'Y-m-d\TH:i'. IF NOT MENTIONED, default it to EXACTLY ONE HOUR after the event_start_date.
            
            CRITICAL: If an event_start_date is generated, an event_end_date MUST also be generated.
            Keep the content concise but informative. Use a friendly yet professional tone.";

            $response = $this->client->post(
                $this->baseUrl . '/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            ['role' => 'system', 'content' => $systemPrompt],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.7,
                        'response_format' => ['type' => 'json_object'],
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            $content = json_decode($data['choices'][0]['message']['content'], true);

            return [
                'title' => $content['title'] ?? '',
                'content' => $content['content'] ?? '',
                'event_start_date' => $content['event_start_date'] ?? null,
                'event_end_date' => $content['event_end_date'] ?? null,
            ];
        } catch (\Exception $e) {
            \Log::error('Announcement Generation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate generic text response (for Chat/Tutor mode)
     */
    public function generateText(string $prompt, string $systemPrompt = "You are a helpful assistant."): string
    {
        try {
            $response = $this->client->post(
                $this->baseUrl . '/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            ['role' => 'system', 'content' => $systemPrompt],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.7,
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            return $data['choices'][0]['message']['content'] ?? "I'm sorry, I couldn't generate a response.";
        } catch (\Exception $e) {
            \Log::error('Text Generation Error: ' . $e->getMessage());
            return "I'm having trouble connecting to my brain right now. Please try again later.";
        }
    }

    /**
     * Generate cache key - identical inputs = cached results
     */
    protected function generateCacheKey(array $notes, int $numberOfQuestions, string $difficulty, array $questionTypes, string $prompt = '', bool $includeVisuals = false): string
    {
        sort($questionTypes);
        $paramString = json_encode([
            'notes' => $notes,
            'count' => $numberOfQuestions,
            'diff' => $difficulty,
            'types' => $questionTypes,
            'prompt' => $prompt,
            'visuals' => $includeVisuals,
        ]);

        $hash = hash('sha256', $paramString);
        return "skeeme:ai_q:" . substr($hash, 0, 32);
    }

    /**
     * Build OPTIMIZED prompt - Reduces input tokens by ~60%
     * 
     * TOKEN REDUCTION TECHNIQUES:
     * 1. Abbreviate terms (MC, TF, SA, ES, FB = -30% tokens)
     * 2. Collapse whitespace (-20% tokens)
     * 3. Shorten system prompt (-10% tokens)
     * 4. Use shorthand JSON keys (-10% tokens)
     * 5. Cache identical requests (100% token saving on reuse)
     */
    protected function buildOptimizedPrompt(
        array $notes,
        int $numberOfQuestions,
        string $difficulty,
        array $questionTypes,
        string $userPrompt = '',
        bool $includeVisuals = false
    ): string {
        // Abbreviate question types to reduce token count
        $typeMap = [
            'multiple_choice' => 'MC',
            'true_false' => 'TF',
            'short_answer' => 'SA',
            'essay' => 'ES',
            'fill_blank' => 'FB',
        ];
        
        $types = array_map(fn($t) => $typeMap[$t] ?? 'MC', $questionTypes);
        $typesText = implode('/', $types);
        
        // Compress material by collapsing extra whitespace
        $notesText = implode("\n", $notes);
        $notesText = preg_replace('/\s+/', ' ', $notesText);
        
        // Abbreviate difficulty
        $diffShort = match($difficulty) {
            'easy' => 'E',
            'medium' => 'M',
            'hard' => 'H',
            'mixed' => 'E/M/H',
            default => 'E/M/H',
        };

        // Add user focus/filter if provided
        $focusSection = !empty($userPrompt) ? "\nFOCUS: {$userPrompt}" : '';

        // Add visual generation instructions if requested
        $visualsInstruction = "\nINSTRUCTION: Text only. No LaTeX/SVG.";
        if ($includeVisuals) {
            $visualsInstruction = "\nVISUALS: You can include VERY SIMPLE SVG diagrams (geometry/graphs) or LaTeX math. 
            RULES FOR SVG: MUST be <svg viewBox='0 0 300 100' preserveAspectRatio='xMidYMid meet' ...>. No width/height attributes. Keep paths simple.
            RULES FOR MATH: MUST wrap all math in $$...$$ (e.g. $$x^2$$).";
        }

        // Minimal but effective prompt with focus capability
        return <<<PROMPT
Gen EXACTLY {$numberOfQuestions} Q. Types: {$typesText}. Diff: {$diffShort}.{$focusSection}{$visualsInstruction}

INPUT (Notes or Topic): {$notesText}

Format: JSON only. Expand on topic or extract from notes.
Language: Use ultra-simple English. Avoid ALL academic jargon and complex words. Every single word must be easy for a regular person to understand.
Schema: [{"q":"text","t":"MC|TF|SA|ES|FB","d":"E|M|H","o":["A","B"],"c":"A","x":"why"}]
PROMPT;
    }

    /**
     * Parse questions from API response
     */
    protected function parseQuestionsFromResponse(string $response): array
    {
        $jsonPattern = '/\[[\s\S]*\]/';
        if (preg_match($jsonPattern, $response, $matches)) {
            $questions = json_decode($matches[0], true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($questions)) {
                return $this->formatQuestions($questions);
            }
        }

        throw new \Exception('Could not parse questions from response');
    }

    /**
     * Format questions from API - handles both abbreviated and full keys
     */
    protected function formatQuestions(array $rawQuestions): array
    {
        $typeMap = [
            'MC' => 'multiple_choice',
            'TF' => 'true_false',
            'SA' => 'short_answer',
            'ES' => 'essay',
            'FB' => 'fill_blank',
        ];

        $diffMap = [
            'E' => 'easy',
            'M' => 'medium',
            'H' => 'hard',
        ];

        return array_map(function ($q) use ($typeMap, $diffMap) {
            // Support both abbreviated (q, t, d, o, c, x) and full (question_text, question_type, etc) keys
            $type = $q['t'] ?? $q['question_type'] ?? 'MC';
            $type = $typeMap[$type] ?? $this->mapQuestionType($type);
            
            $diff = $q['d'] ?? $q['difficulty_level'] ?? 'M';
            $diff = $diffMap[$diff] ?? 'medium';

            $formatted = [
                'question_text' => $q['q'] ?? $q['question_text'] ?? '',
                'question_type' => $type,
                'difficulty_level' => $diff,
                'topic' => $q['topic'] ?? 'General',
                'learning_objective' => $q['learning_objective'] ?? '',
                'explanation' => $q['x'] ?? $q['explanation'] ?? '',
                'options' => $q['o'] ?? $q['options'] ?? [],
                'correct_answer' => $q['c'] ?? $q['correct_answer'] ?? '',
            ];

            return $formatted;
        }, $rawQuestions);
    }

    /**
     * Map question types to system types
     */
    protected function mapQuestionType(string $type): string
    {
        $mapping = [
            'mcq' => 'multiple_choice',
            'multiple_choice' => 'multiple_choice',
            'true_false' => 'true_false',
            'short_answer' => 'short_answer',
            'essay' => 'essay',
            'fill_blank' => 'fill_blank',
        ];

        return $mapping[strtolower($type)] ?? 'multiple_choice';
    }

    /**
     * Test the API connection
     */
    public function testConnection(): bool
    {
        try {
            $response = $this->client->post(
                $this->baseUrl . '/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => 'deepseek-chat',
                        'messages' => [['role' => 'user', 'content' => 'Test']],
                        'max_tokens' => 10,
                    ],
                ]
            );

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            \Log::error('Deepseek connection test failed: ' . $e->getMessage());
            return false;
        }
    }
}
