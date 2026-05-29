<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AnthropicAIService
{
    protected $client;
    protected $apiKey;
    protected $version = '2023-06-01';
    protected $baseUrl = 'https://api.anthropic.com/v1/messages';
    protected $timeout = 60; // Default 60s for backend generation

    // Model constants
    const MODEL_SONNET = 'claude-sonnet-4-6';
    const MODEL_HAIKU = 'claude-haiku-4-5-20251001';

    protected $personalizationService;

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
        $this->client = new Client([
            'timeout' => 120,
            'connect_timeout' => 10,
        ]);
        $this->personalizationService = app(UserPersonalizationService::class);
    }

    /**
     * Calculate max tokens based on task type and count
     */
    public function calculateMaxTokens(string $type, int $count = 0, string $difficulty = 'medium'): int
    {
        return match(true) {
            // ── SCAN ─────────────────────────────────────────────────────────
            $type === 'scan'                           => 9000,

            // ── FLASHCARDS (min:5, max:50, step:5) ───────────────────────────
            // ~150 tokens per card (including formatting/explanation)
            $type === 'flashcard' && $count <= 5       => 1000,
            $type === 'flashcard' && $count <= 10      => 1800,
            $type === 'flashcard' && $count <= 15      => 2500,
            $type === 'flashcard' && $count <= 20      => 3200,
            $type === 'flashcard' && $count <= 25      => 4000,
            $type === 'flashcard' && $count <= 30      => 4800,
            $type === 'flashcard' && $count <= 35      => 5500,
            $type === 'flashcard' && $count <= 40      => 6200,
            $type === 'flashcard' && $count <= 45      => 7000,
            $type === 'flashcard'                      => 8000,

            // ── MCQ EASY (min:10, max:30, step:5) ────────────────────────────
            // ~250 tokens per question
            $type === 'mcq_easy' && $count <= 10       => 2500,
            $type === 'mcq_easy' && $count <= 15       => 3800,
            $type === 'mcq_easy' && $count <= 20       => 5000,
            $type === 'mcq_easy' && $count <= 25       => 6200,
            $type === 'mcq_easy'                       => 7500,

            // ── MCQ MEDIUM (min:10, max:30, step:5) ──────────────────────────
            // ~300 tokens per question
            $type === 'mcq_medium' && $count <= 10     => 3000,
            $type === 'mcq_medium' && $count <= 15     => 4500,
            $type === 'mcq_medium' && $count <= 20     => 6000,
            $type === 'mcq_medium' && $count <= 25     => 7500,
            $type === 'mcq_medium'                     => 8192,

            // ── MCQ HARD (min:10, max:30, step:5) ────────────────────────────
            // ~350 tokens per question
            $type === 'mcq_hard' && $count <= 10       => 3500,
            $type === 'mcq_hard' && $count <= 15       => 5000,
            $type === 'mcq_hard' && $count <= 20       => 6500,
            $type === 'mcq_hard' && $count <= 25       => 8000,
            $type === 'mcq_hard'                       => 8192,

            default                                    => 4096,
        };
    }

    public function setTimeout(int $seconds): self
    {
        $this->timeout = $seconds;
        return $this;
    }

    /**
     * Generate questions using Claude 4.5 Sonnet
     * Production-hardened: dynamic tokens, personalization, language detection, cache logging
     */
    public function generateQuestions(
        array $notes,
        int $numberOfQuestions,
        string $difficulty = 'mixed',
        array $questionTypes = ['mcq', 'true_false', 'short_answer', 'essay', 'fill_blank'],
        string $prompt = '',
        bool $includeVisuals = false,
        ?callable $progressCallback = null,
        ?array $aiPreferences = null
    ): array {
        $startTime = microtime(true);
        try {
            set_time_limit(300);

            // Sanitize user inputs to protect against prompt injection
            $notes = array_map(fn($note) => \App\Support\PromptSanitizer::sanitize($note), $notes);
            if (!empty($prompt)) {
                $prompt = \App\Support\PromptSanitizer::sanitize($prompt);
            }

            if ($progressCallback) $progressCallback(10);

            // Check cache first (24 hour TTL) - ELIMINATES REDUNDANT API CALLS
            $cacheKey = $this->generateCacheKey('q', $notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals);
            if (Cache::has($cacheKey)) {
                $questions = Cache::get($cacheKey);
                Log::info('Claude Cache Hit: Questions retrieved from cache.', [
                    'cache_key' => $cacheKey,
                    'questions_count' => count($questions),
                    'estimated_time_saved' => '15-30s (AI API Bypass)'
                ]);

                \App\Support\AILogger::log([
                    'provider' => 'anthropic',
                    'model' => self::MODEL_HAIKU,
                    'action' => 'generate_questions',
                    'cache' => ['status' => 'hit', 'key' => $cacheKey],
                    'request' => [
                        'notes_count' => count($notes),
                        'notes_char_length' => strlen(implode('', $notes)),
                        'number_of_questions' => $numberOfQuestions,
                        'difficulty' => $difficulty,
                        'question_types' => $questionTypes,
                        'prompt' => $prompt,
                    ],
                    'response' => [
                        'questions_count' => count($questions),
                    ],
                    'latency_ms' => (microtime(true) - $startTime) * 1000,
                ], auth()->user());

                if ($progressCallback) $progressCallback(100);
                return $questions;
            }

            if ($progressCallback) $progressCallback(30);

            // Sanitize inputs for UTF-8
            $sanitizedNotes = array_map([$this, 'sanitizeUtf8'], $notes);
            $sanitizedPrompt = $this->sanitizeUtf8($prompt);

            $optimizedPrompt = $this->buildOptimizedPrompt(
                $sanitizedNotes,
                $numberOfQuestions,
                $difficulty,
                $questionTypes,
                $sanitizedPrompt,
                $includeVisuals,
                $aiPreferences
            );

            if ($progressCallback) $progressCallback(50);

            $maxTokens = $this->calculateMaxTokens("mcq_{$difficulty}", $numberOfQuestions);

            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => [
                    'model' => self::MODEL_HAIKU,
                    'max_tokens' => $maxTokens,
                    // MATH FORMATTING RULES added
                    'system' => $this->getPersonalizedSystemPrompt('You are a quiz generator. Return ONLY raw JSON matching the requested schema. Wrap all math/formulas in dollar signs. No conversational text.

MATH FORMATTING RULES:
1. Inline math: Use $...$ delimiters. Inline fractions should be compact, e.g., $\frac{a}{b}$.
2. Display math: Use $$...$$ delimiters on separate lines for important equations, limits, or complex expressions.
3. Structured lists: Use enumerate environments or numbered lists with math expressions where needed.
4. Align environments: For multiple equations, use $$\begin{align}...\\end{align}$$ with proper line breaks.
5. Braces: Always wrap command arguments in braces, e.g., $\sqrt{x}$ not $\sqrt x$.
6. Command groups: Commands like \sin, \cos, \lim must be followed by argument braces or left/right delimiters.
7. Limits: Use underscore and caret with braces for limits, e.g., $\sum_{i=1}^{n}$ not $\sum_i^n$.
8. Subscripts/superscripts: Always brace multicharacter subscripts/superscripts, e.g., $x_{ij}$ or $a^{2n}$.
9. Text within math: Use $\text{word}$ for text inside math mode, never mix plain text.
10. Percent signs: Escape as \\% inside math mode; use plain % in prose.
11. Chemistry notation: Use element symbols directly (e.g., H2O, CO2) without math mode unless in calculation contexts.'),
                    'messages' => [
                        [
                            'role' => 'user', 
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $optimizedPrompt,
                                    'cache_control' => ['type' => 'ephemeral']
                                ]
                            ]
                        ]
                    ],
                    'temperature' => 0.5,
                ],
                'timeout' => $this->timeout,
            ]);

            if ($progressCallback) $progressCallback(80);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '';

            $questions = $this->parseQuestionsFromResponse($content);

            if ($progressCallback) $progressCallback(95);

            Cache::put($cacheKey, $questions, now()->addHours(24));

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'generate_questions',
                'cache' => ['status' => 'miss', 'key' => $cacheKey],
                'request' => [
                    'notes_count' => count($notes),
                    'notes_char_length' => strlen(implode('', $notes)),
                    'number_of_questions' => $numberOfQuestions,
                    'difficulty' => $difficulty,
                    'question_types' => $questionTypes,
                    'prompt' => $prompt,
                ],
                'response' => [
                    'questions_count' => count($questions),
                    'input_tokens' => $data['usage']['input_tokens'] ?? null,
                    'output_tokens' => $data['usage']['output_tokens'] ?? null,
                ],
                'latency_ms' => $latencyMs,
            ], auth()->user());

            return $questions;
        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'generate_questions',
                'cache' => ['status' => 'miss', 'key' => $cacheKey ?? null],
                'request' => [
                    'notes_count' => count($notes),
                    'notes_char_length' => strlen(implode('', $notes)),
                    'number_of_questions' => $numberOfQuestions,
                    'difficulty' => $difficulty,
                    'question_types' => $questionTypes,
                    'prompt' => $prompt,
                ],
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            throw $this->handleApiException($e, 'Questions');
        }
    }

    /**
     * Generate Flashcards — production-hardened with detailed prompts and dynamic tokens
     */
    public function generateFlashcards(
        array $notes,
        int $numberOfCards,
        string $difficulty = 'mixed',
        string $prompt = '',
        ?callable $progressCallback = null
    ): array {
        $startTime = microtime(true);
        try {
            set_time_limit(300);

            // Sanitize user inputs to protect against prompt injection
            $notes = array_map(fn($note) => \App\Support\PromptSanitizer::sanitize($note), $notes);
            if (!empty($prompt)) {
                $prompt = \App\Support\PromptSanitizer::sanitize($prompt);
            }

            if ($progressCallback) $progressCallback(10);

            $sanitizedNotes = array_map([$this, 'sanitizeUtf8'], $notes);
            $optimizedPrompt = $this->buildFlashcardPrompt($sanitizedNotes, $numberOfCards, $difficulty, $prompt);

            $maxTokens = $this->calculateMaxTokens('flashcard', $numberOfCards);

            if ($progressCallback) $progressCallback(30);

            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => [
                    'model' => self::MODEL_HAIKU,
                    'max_tokens' => $maxTokens,
                    // MATH FORMATTING RULES added
                    'system' => $this->getPersonalizedSystemPrompt('You are an expert tutor creating highly effective flashcards. Return only JSON. Wrap all math/formulas in dollar signs.

MATH FORMATTING RULES:
1. Inline math: Use $...$ delimiters. Inline fractions should be compact, e.g., $\frac{a}{b}$.
2. Display math: Use $$...$$ delimiters on separate lines for important equations, limits, or complex expressions.
3. Structured lists: Use enumerate environments or numbered lists with math expressions where needed.
4. Align environments: For multiple equations, use $$\begin{align}...\\end{align}$$ with proper line breaks.
5. Braces: Always wrap command arguments in braces, e.g., $\sqrt{x}$ not $\sqrt x$.
6. Command groups: Commands like \sin, \cos, \lim must be followed by argument braces or left/right delimiters.
7. Limits: Use underscore and caret with braces for limits, e.g., $\sum_{i=1}^{n}$ not $\sum_i^n$.
8. Subscripts/superscripts: Always brace multicharacter subscripts/superscripts, e.g., $x_{ij}$ or $a^{2n}$.
9. Text within math: Use $\text{word}$ for text inside math mode, never mix plain text.
10. Percent signs: Escape as \\% inside math mode; use plain % in prose.
11. Chemistry notation: Use element symbols directly (e.g., H2O, CO2) without math mode unless in calculation contexts.'),
                    'messages' => [
                        [
                            'role' => 'user', 
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $optimizedPrompt,
                                    'cache_control' => ['type' => 'ephemeral']
                                ]
                            ]
                        ]
                    ],
                    'temperature' => 0.5,
                ],
                'timeout' => $this->timeout,
            ]);

            if ($progressCallback) $progressCallback(70);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '[]';

            // Robust JSON parsing (same as DeepSeek)
            $content = preg_replace('/```(?:json)?|```/', '', $content);
            $decoded = json_decode(trim($content), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                // Fallback: extract JSON array via regex
                preg_match('/\[.*\]/s', $content, $matches);
                if (!empty($matches[0])) {
                    $decoded = json_decode($matches[0], true);
                }
            }

            // Handle {flashcards: [...]} wrapper
            if (is_array($decoded) && isset($decoded['flashcards']) && is_array($decoded['flashcards'])) {
                $decoded = $decoded['flashcards'];
            }

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'generate_flashcards',
                'request' => [
                    'notes_count' => count($notes),
                    'notes_char_length' => strlen(implode('', $notes)),
                    'number_of_cards' => $numberOfCards,
                    'difficulty' => $difficulty,
                    'prompt' => $prompt,
                ],
                'response' => [
                    'cards_count' => is_array($decoded) ? count($decoded) : 0,
                    'input_tokens' => $data['usage']['input_tokens'] ?? null,
                    'output_tokens' => $data['usage']['output_tokens'] ?? null,
                ],
                'latency_ms' => $latencyMs,
            ], auth()->user());

            return is_array($decoded) ? $decoded : [];
        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'generate_flashcards',
                'request' => [
                    'notes_count' => count($notes),
                    'notes_char_length' => strlen(implode('', $notes)),
                    'number_of_cards' => $numberOfCards,
                    'difficulty' => $difficulty,
                    'prompt' => $prompt,
                ],
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            throw $this->handleApiException($e, 'Flashcards');
        }
    }

    /**
     * Generate generic text
     */
    public function generateText(string $prompt, string $systemPrompt = "You are a helpful assistant."): string
    {
        $startTime = microtime(true);
        try {
            $prompt = \App\Support\PromptSanitizer::sanitize($prompt);
            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => [
                    'model' => self::MODEL_HAIKU,
                    'max_tokens' => 1024,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'temperature' => 0.7,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $text = $data['content'][0]['text'] ?? "Error generating response.";

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'generate_text',
                'request' => [
                    'prompt_length' => strlen($prompt),
                    'system_prompt_length' => strlen($systemPrompt),
                ],
                'response' => [
                    'text_length' => strlen($text),
                    'input_tokens' => $data['usage']['input_tokens'] ?? null,
                    'output_tokens' => $data['usage']['output_tokens'] ?? null,
                ],
                'latency_ms' => $latencyMs,
            ], auth()->user());

            return $text;
        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'generate_text',
                'request' => [
                    'prompt_length' => strlen($prompt),
                    'system_prompt_length' => strlen($systemPrompt),
                ],
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            $msg = $this->handleApiException($e, 'Text')->getMessage();
            return $msg;
        }
    }

    /**
     * Translate text using y
     */
    public function translateText(string $text, string $targetLanguage): string
    {
        $startTime = microtime(true);
        try {
            $text = \App\Support\PromptSanitizer::sanitize($text);
            $systemPrompt = "You are a professional translator. Translate the provided text to {$targetLanguage}. Return ONLY the translated text.";

            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => [
                    'model' => self::MODEL_HAIKU,
                    'max_tokens' => 1024,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $text]],
                    'temperature' => 0.3,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $translated = $data['content'][0]['text'] ?? $text;

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'translate_text',
                'request' => [
                    'text_length' => strlen($text),
                    'target_language' => $targetLanguage,
                ],
                'response' => [
                    'translated_length' => strlen($translated),
                    'input_tokens' => $data['usage']['input_tokens'] ?? null,
                    'output_tokens' => $data['usage']['output_tokens'] ?? null,
                ],
                'latency_ms' => $latencyMs,
            ], auth()->user());

            return $translated;
        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_HAIKU,
                'action' => 'translate_text',
                'request' => [
                    'text_length' => strlen($text),
                    'target_language' => $targetLanguage,
                ],
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            Log::error('Claude Translation Error: ' . $e->getMessage());
            return $text; // Fallback to original text
        }
    }

    /**
     * Grade a theory/essay answer using Claude 4.5 Sonnet
     * Enhanced with rubric support and detailed analysis (parity with DeepSeek)
     */
    public function gradeTheoryAnswer(
        string $questionText,
        string $studentAnswer,
        string $modelAnswer = '',
        array $rubric = [],
        float $maxMarks = 10.0
    ): array {
        $startTime = microtime(true);
        try {
            $questionText = \App\Support\PromptSanitizer::sanitize($questionText);
            $studentAnswer = \App\Support\PromptSanitizer::sanitize($studentAnswer);
            if (!empty($modelAnswer)) {
                $modelAnswer = \App\Support\PromptSanitizer::sanitize($modelAnswer);
            }
            $rubricText = !empty($rubric) ? json_encode($rubric) : 'Grade based on accuracy and completeness.';
            $modelAnswerText = !empty($modelAnswer) ? "MODEL ANSWER: {$modelAnswer}" : "No model answer provided. Use general knowledge of the topic.";

            $systemPrompt = "You are an expert academic examiner. Grade the student's answer based on the question and criteria provided.
            
            Return the result in JSON format with the following keys:
            - 'marks': (float) Marks awarded out of {$maxMarks}.
            - 'confidence': (float) Your confidence in this grade (0-100).
            - 'reasoning': (string) Brief explanation of why you gave this grade.
            - 'feedback': (string) Constructive feedback for the student.
            - 'analysis': (string) Breakdown of the grade.
            
            Be fair but strict. A partially correct answer should get partial marks.";

            $prompt = "QUESTION: {$questionText}
            {$modelAnswerText}
            RUBRIC/CRITERIA: {$rubricText}
            STUDENT ANSWER: {$studentAnswer}
            MAX MARKS: {$maxMarks}
            
            Grade this answer now.";

            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => [
                    'model' => self::MODEL_SONNET,
                    'max_tokens' => 1024,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'temperature' => 0.3,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '{}';
            $decoded = json_decode(trim(preg_replace('/```(?:json)?|```/', '', $content)), true);

            $result = [
                'marks' => (float) ($decoded['marks'] ?? 0),
                'confidence' => (float) ($decoded['confidence'] ?? 50),
                'reasoning' => $decoded['reasoning'] ?? 'AI graded response.',
                'ai_feedback' => $decoded['feedback'] ?? '',
                'analysis' => $decoded['analysis'] ?? '',
            ];

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_SONNET,
                'action' => 'grade_theory_answer',
                'request' => [
                    'question_length' => strlen($questionText),
                    'student_answer_length' => strlen($studentAnswer),
                    'model_answer_length' => strlen($modelAnswer),
                    'rubric_provided' => !empty($rubric),
                    'max_marks' => $maxMarks,
                ],
                'response' => [
                    'marks_awarded' => $result['marks'],
                    'confidence' => $result['confidence'],
                    'input_tokens' => $data['usage']['input_tokens'] ?? null,
                    'output_tokens' => $data['usage']['output_tokens'] ?? null,
                ],
                'latency_ms' => $latencyMs,
            ], auth()->user());

            return $result;
        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_SONNET,
                'action' => 'grade_theory_answer',
                'request' => [
                    'question_length' => strlen($questionText),
                    'student_answer_length' => strlen($studentAnswer),
                    'model_answer_length' => strlen($modelAnswer),
                    'rubric_provided' => !empty($rubric),
                    'max_marks' => $maxMarks,
                ],
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            throw $this->handleApiException($e, 'Grading');
        }
    }

    /**
     * Solve questions from a scanned image using Claude's native vision (no external OCR needed)
     * Claude 4.5 Sonnet natively reads images — superior to OCR.space/Google Vision pipeline
     */
    public function solveFromImage(string $base64Image): array
    {
        $startTime = microtime(true);
        try {
            set_time_limit(300);

            Log::info('Claude Vision: Processing image directly (native OCR)...');

            $solvePrompt = <<<'PROMPT'
You are a world-class tutor. Look at the image and solve every question you see.

1. Identify ALL questions and sub-parts (1a, 1b, 2, etc.) — each is a separate result item.
2. For MCQs: determine the correct option FIRST, then explain why it's right.
3. For calculations/theory: solve completely, then explain.

Return ONLY a raw JSON object matching this schema. NO Conversational text. NO Thought blocks. NO code blocks.
{"results":[{"question":"","topic":"subject area","type":"calculation|theory","solution":"**The answer is...**","steps":[],"explanation":"concise but complete explanation","summary":""}]}

Rules:
- `question`: leave this string completely EMPTY (""). DO NOT output the original question or options.
- `solution`: Start with a conversational phrase like "The answer is..." or "Your pick should be..." followed by the final answer. e.g. "The answer is **D**".
- `steps`: always `[]`
- `summary`: always `""`
- `explanation`: State the answer upfront, then justify it. You MUST structure the explanation into clear, step-by-step paragraphs separated by double newlines (\n\n) to ensure high readability. Do NOT merge multiple equations and steps into a single dense block of text.
- `Math Formatting`: Always format ALL mathematical expressions, equations, formulas, fractions, variables, and exponents in proper LaTeX and wrap them inside standard inline dollar signs `$ ... $` (e.g. `$\frac{1}{2}g$` or `$2^5$` or `$x^2$`). Never output bare exponents (like 2^5) or un-delimited fractions (like 1/2) in plain text, as the KaTeX renderer will not parse them.
- `Decimal Fractions Rule`: When writing fractions with decimal numbers (e.g. 8.42 / 9.8), always wrap the entire decimal numbers in the numerator and denominator (e.g. `$\frac{8.42}{9.8}$`). Never split inside a decimal point (do NOT write 8.`\frac{42}{9}`.8 under any circumstances).
- Never skip a question.
PROMPT;
            $systemPrompt = <<<'SYSTEM'
# Role
You are an expert academic tutor skilled at explaining concepts, solving problems, and designing assessments across all subjects and academic levels.

# Task
Respond to tutoring requests by providing clear, structured learning support in valid JSON format only.

# Context
Students at mixed academic levels need reliable, consistent tutoring. They expect authoritative answers formatted predictably.

# Instructions

**Core Behaviors:**
- Return only valid JSON with no additional text, preamble, or meta-commentary.
- Use Markdown formatting (headings, lists, bolding) **INSIDE** the JSON strings for better structure.
- Do NOT wrap the entire JSON response in markdown code blocks (e.g. ```json).
- No internal reasoning, self-corrections, or scratchpads.

**Subject-Specific Rules:**
1. **Mathematical/Problem Solving (Math, Physics, Engineering):** Focus on step-by-step logic. **Each step must be a separate block**.
   - **Prose Labels**: Labels like "Inner integral:" or "Simplifying:" must be on their own line, followed by a newline.
   - **Math Blocks**: Use dedicated lines for math expressions. Wrap important equations in `$$` for display-mode rendering (centered, large).
   - **Spacing**: Use double newlines (\n\n) between logical steps.
2. **Theoretical/Descriptive (Medicine, Law, Psychology, Social Sciences):** Provide **lengthy, detailed, and comprehensive notes**. Psychology, Medicine, and Law depend on **depth and length**, not brevity. Use rich Markdown formatting: **### Headings**, **bullet points**, and **bold text** to organize information. (Note: These Markdown elements ARE supported by the renderer). If appropriate or requested, include academic or clinical references/citations at the end of the explanation.

**For Problem Solutions:**
Structure as: `{"results": [{"question": "", "topic": "", "type": "", "solution": "", "steps": [], "explanation": "", "summary": ""}]}`
- **Crucial**: The `question` field must be left completely empty (""). Do not transcribe the question.
- For theoretical questions, use the "Detailed Note" approach in the `explanation` field.
- Use double newlines (\n\n) to create distinct paragraphs.
- `solution`: Start with a conversational phrase like "The answer is..." or "Your pick should be..." followed by the final answer. e.g. "The answer is **D**".
- `steps`: always `[]`
- `summary`: always `""`

# Tone and Approach
- Be direct and authoritative.
- **For Theoretical Subjects:** Adopt a "Deep Dive" mentality. Length and detail are required.
- Don't seek clarification; deliver the response.
SYSTEM;
            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => [
                    'model' => self::MODEL_SONNET,
                    'max_tokens' => $this->calculateMaxTokens('scan'),
                    'system' => $this->getPersonalizedSystemPrompt($systemPrompt),
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'image',
                                    'source' => [
                                        'type' => 'base64',
                                        'media_type' => $this->detectImageType($base64Image),
                                        'data' => $this->cleanBase64($base64Image),
                                    ],
                                    'cache_control' => ['type' => 'ephemeral']
                                ],
                                [
                                    'type' => 'text',
                                    'text' => $solvePrompt,
                                ],
                            ],
                        ],
                    ],
                    'temperature' => 0.3,
                ],
                'timeout' => $this->timeout,
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '{}';
            
            // Robust JSON extraction to ignore conversational text
            $cleanContent = preg_replace('/```(?:json)?|```/', '', $content);
            $decoded = json_decode(trim($cleanContent), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                // Fallback 1: Extract anything between the first { and last }
                if (preg_match('/\{[\s\S]*\}/', $content, $matches)) {
                    $decoded = json_decode($matches[0], true);
                }
            }

            if (json_last_error() !== JSON_ERROR_NONE) {
                // Fallback 2: Extract anything between the first [ and last ] (if it returned a list directly)
                if (preg_match('/\[[\s\S]*\]/', $content, $matches)) {
                    $list = json_decode($matches[0], true);
                    if (is_array($list)) {
                        $decoded = ['results' => $list];
                    }
                }
            }
            
            if (!is_array($decoded) || (!isset($decoded['results']) && !isset($decoded[0]))) {
                Log::error('Claude Vision Parse Failure', ['raw_content' => $content]);
                throw new \Exception('AI returned invalid JSON structure for scan solve');
            }

            // Handle root level array
            if (is_array($decoded) && !isset($decoded['results']) && array_is_list($decoded)) {
                $decoded = ['results' => $decoded];
            }

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_SONNET,
                'action' => 'solve_from_image',
                'request' => [
                    'image_length' => strlen($base64Image),
                ],
                'response' => [
                    'results_count' => isset($decoded['results']) ? count($decoded['results']) : 0,
                    'input_tokens' => $data['usage']['input_tokens'] ?? null,
                    'output_tokens' => $data['usage']['output_tokens'] ?? null,
                ],
                'latency_ms' => $latencyMs,
            ], auth()->user());

            return $decoded;
        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => self::MODEL_SONNET,
                'action' => 'solve_from_image',
                'request' => [
                    'image_length' => strlen($base64Image),
                ],
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            throw $this->handleApiException($e, 'Image Solve');
        }
    }

    /**
     * Stream questions from a scanned image using Claude's native vision
     */
    public function streamSolveFromImage(string $base64Image, callable $onChunk, ?callable $onStatus = null): void
    {
        try {
            set_time_limit(300);

            if ($onStatus) $onStatus('Reading image...');
            Log::info('Claude Vision: Streaming image directly...');

            $solvePrompt = <<<'PROMPT'
You are a world-class tutor. Look at the image and solve every question you see.

1. Identify ALL questions and sub-parts (1a, 1b, 2, etc.) — each is a separate result item.
2. For MCQs: determine the correct option FIRST, then explain why it's right.
3. For calculations/theory: solve completely, then explain.

Return ONLY a raw JSON object matching this schema. NO Conversational text. NO Thought blocks. NO code blocks.
{"results":[{"question":"","topic":"subject area","type":"calculation|theory","solution":"**The answer is...**","steps":[],"explanation":"concise but complete explanation","summary":""}]}

Rules:
- `question`: leave this string completely EMPTY (""). DO NOT output the original question or options.
- `solution`: Start with a conversational phrase like "The answer is..." or "Your pick should be..." followed by the final answer. e.g. "The answer is **D**".
- `steps`: always `[]`
- `summary`: always `""`
- `explanation`: State the answer upfront, then justify it. You MUST structure the explanation into clear, step-by-step paragraphs separated by double newlines (\n\n) to ensure high readability. Do NOT merge multiple equations and steps into a single dense block of text.
- `Math Formatting`: Always format ALL mathematical expressions, equations, formulas, fractions, variables, and exponents in proper LaTeX and wrap them inside standard inline dollar signs `$ ... $` (e.g. `$\frac{1}{2}g$` or `$2^5$` or `$x^2$`). Never output bare exponents (like 2^5) or un-delimited fractions (like 1/2) in plain text, as the KaTeX renderer will not parse them.
- `Decimal Fractions Rule`: When writing fractions with decimal numbers (e.g. 8.42 / 9.8), always wrap the entire decimal numbers in the numerator and denominator (e.g. `$\frac{8.42}{9.8}$`). Never split inside a decimal point (do NOT write 8.`\frac{42}{9}`.8 under any circumstances).
- Never skip a question.
PROMPT;

            if ($onStatus) $onStatus('Analyzing question...');

            $systemPrompt = <<<'SYSTEM'
# Role
You are an expert academic tutor skilled at explaining concepts, solving problems, and designing assessments across all subjects and academic levels.

# Task
Respond to tutoring requests by providing clear, structured learning support in valid JSON format only. Your primary focus is delivering step-by-step problem solutions with detailed breakdowns, though you also handle explanations, study guides, and assessments as needed.

# Context
Students at mixed academic levels need reliable, consistent tutoring across any subject. They expect authoritative answers formatted predictably so they can parse and use the output programmatically or integrate it into their study systems.

# Instructions

**Core Behaviors:**
- Return only valid JSON with no additional text, preamble, or meta-commentary.
- Use Markdown formatting (headings, lists, bolding) **INSIDE** the JSON strings for better structure.
- Do NOT wrap the entire JSON response in markdown code blocks (e.g. ```json).
- No internal reasoning, self-corrections, or scratchpads.

**Subject-Specific Rules:**
1. **Mathematical/Problem Solving (Math, Physics, Engineering):** Focus on step-by-step logic. **Each step must be a separate block**.
   - **Prose Labels**: Labels like "Inner integral:" or "Simplifying:" must be on their own line, followed by a newline.
   - **Math Blocks**: Use dedicated lines for math expressions. Wrap important equations in `$$` for display-mode rendering (centered, large).
   - **Spacing**: Use double newlines (\n\n) between logical steps.
2. **Theoretical/Descriptive (Medicine, Law, Psychology, Social Sciences):** Provide **lengthy, detailed, and comprehensive notes**. Psychology, Medicine, and Law depend on **depth and length**, not brevity. Use rich Markdown formatting: **### Headings**, **bullet points**, and **bold text** to organize information. (Note: These Markdown elements ARE supported by the renderer). If appropriate or requested, include academic or clinical references/citations at the end of the explanation.

**For Problem Solutions:**
Structure as: `{"results": [{"question": "", "topic": "", "type": "", "solution": "", "steps": [], "explanation": "", "summary": ""}]}`
- **Crucial**: The `question` field must be left completely empty (""). Do not transcribe the question.
- For theoretical questions, use the "Detailed Note" approach in the `explanation` field.
- Use double newlines (\n\n) to create distinct paragraphs.
- `solution`: Start with a conversational phrase like "The answer is..." or "Your pick should be..." followed by the final answer. e.g. "The answer is **D**".
- `steps`: always `[]`
- `summary`: always `""`

**Tone and Approach:**
- Be direct and authoritative.
- **For Theoretical Subjects:** Adopt a "Deep Dive" mentality. Length and detail are required.
- Don't seek clarification; deliver the response.
SYSTEM;

            $params = [
                'model' => self::MODEL_SONNET,
                'max_tokens' => $this->calculateMaxTokens('scan'),
                'system' => $this->getPersonalizedSystemPrompt($systemPrompt),
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image',
                                'source' => [
                                    'type' => 'base64',
                                    'media_type' => $this->detectImageType($base64Image),
                                    'data' => $this->cleanBase64($base64Image),
                                ],
                                'cache_control' => ['type' => 'ephemeral']
                            ],
                            [
                                'type' => 'text',
                                'text' => $solvePrompt,
                            ],
                        ],
                    ],
                ],
                'temperature' => 0.3,
                'stream_action' => 'stream_solve_from_image',
            ];

            $this->streamRequest($params, $onChunk);
        } catch (\Exception $e) {
            throw $this->handleApiException($e, 'Image Stream Solve');
        }
    }

    /**
     * Stream a request to Anthropic (SSE)
     */
    public function streamRequest(array $params, callable $onChunk)
    {
        $startTime = microtime(true);
        $action = $params['stream_action'] ?? 'stream_request';
        $model = $params['model'] ?? self::MODEL_HAIKU;
        unset($params['stream_action']);

        try {
            if (isset($params['system'])) {
                $systemContent = $this->getPersonalizedSystemPrompt($params['system']);
                if (!isset($params['messages'])) {
                    $params['messages'] = [];
                }
                array_unshift($params['messages'], ['role' => 'system', 'content' => $systemContent]);
                unset($params['system']);
            }
            $params['stream'] = true;

            $response = $this->client->post($this->baseUrl, [
                'headers' => $this->buildHeaders(),
                'json' => $params,
                'stream' => true,
            ]);

            $body = $response->getBody();
            $buffer = '';

            // Log stream initiation
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => $model,
                'action' => $action . '_start',
                'request' => [
                    'stream_params_keys' => array_keys($params),
                ],
            ], auth()->user());

            while (!$body->eof()) {
                $chunk = $body->read(1024);
                if ($chunk === '') continue;
                $buffer .= $chunk;

                while (($pos = strpos($buffer, "\n\n")) !== false) {
                    $event = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 2);

                    if (str_starts_with($event, 'data: ')) {
                        $data = substr($event, 6);
                        if ($data === '[DONE]') break;

                        $decoded = json_decode($data, true);
                        if ($decoded && isset($decoded['type'])) {
                            $onChunk($decoded);
                        }
                    }
                }
            }

            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => $model,
                'action' => $action . '_end',
                'latency_ms' => $latencyMs,
            ], auth()->user());

        } catch (\Exception $e) {
            $latencyMs = (microtime(true) - $startTime) * 1000;
            \App\Support\AILogger::log([
                'provider' => 'anthropic',
                'model' => $model,
                'action' => $action . '_error',
                'error' => $e,
                'latency_ms' => $latencyMs,
            ], auth()->user());
            throw $e;
        }
    }

    /**
     * Get a personalized system prompt by appending student context.
     */
    protected function getPersonalizedSystemPrompt(string $basePrompt): string
    {
        $user = auth()->user();
        if (!$user) return $basePrompt;

        $context = $this->personalizationService ? $this->personalizationService->getSystemContext($user) : '';
        
        return $basePrompt . "\n\n" . $context;
    }

    // ─── SHARED HELPERS ─────────────────────────────────────────────────

    /**
     * Build standard Anthropic API headers
     */
    protected function buildHeaders(): array
    {
        return [
            'x-api-key' => $this->apiKey,
            'anthropic-version' => $this->version,
            'anthropic-beta' => 'prompt-caching-2024-07-31',
            'content-type' => 'application/json',
        ];
    }

    /**
     * Centralized error handler — returns user-friendly messages
     */
    protected function handleApiException(\Exception $e, string $context): \Exception
    {
        Log::error("Anthropic {$context} Error: " . $e->getMessage());

        if ($e instanceof RequestException && $e->hasResponse()) {
            $statusCode = $e->getResponse()->getStatusCode();
            $body = $e->getResponse()->getBody()->getContents();

            if ($statusCode === 429) {
                return new \Exception("Skeeme is currently experiencing high demand. Please try again in a few moments.");
            }
            if ($statusCode >= 400 && str_contains(strtolower($body), 'credit balance')) {
                return new \Exception("Skeeme is down, Please try again later.");
            }
            if ($statusCode >= 500 || $statusCode >= 400) {
                return new \Exception("Skeeme is down, Please try again later.");
            }
        }

        if (str_contains($e->getMessage(), 'cURL error 28')) {
            return new \Exception("The AI took too long to respond. Please try again or break down your request into smaller parts.");
        }

        return new \Exception("Skeeme encountered an unexpected error. Please try again later.");
    }

    /**
     * Sanitize strings for UTF-8 compatibility (prevents API errors from bad encoding)
     */
    protected function sanitizeUtf8(string $text): string
    {
        return mb_convert_encoding($text, 'UTF-8', 'UTF-8');
    }

    /**
     * Clean base64 image data (remove data URI prefix)
     */
    protected function cleanBase64(string $base64): string
    {
        return preg_replace('/^data:image\/(png|jpeg|jpg|gif|webp);base64,/', '', $base64);
    }

    /**
     * Detect image MIME type from base64 header
     */
    protected function detectImageType(string $base64): string
    {
        if (str_starts_with($base64, 'data:image/png')) return 'image/png';
        if (str_starts_with($base64, 'data:image/gif')) return 'image/gif';
        if (str_starts_with($base64, 'data:image/webp')) return 'image/webp';
        return 'image/jpeg'; // Default for camera captures
    }

    /**
     * Generate cache key — identical inputs = cached results
     */
    protected function generateCacheKey(string $type, ...$params): string
    {
        $hash = hash('sha256', json_encode($params));
        return "skeeme:claude:{$type}:" . substr($hash, 0, 32);
    }

    // ─── PROMPT BUILDERS ────────────────────────────────────────────────

    /**
     * Build OPTIMIZED prompt for questions — Reduces input tokens by ~60%
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
        int $count,
        string $diff,
        array $types,
        string $userPrompt,
        bool $visuals,
        ?array $prefs
    ): string {
        // Abbreviate question types
        $typeMap = [
            'multiple_choice' => 'MC',
            'true_false' => 'TF',
            'short_answer' => 'SA',
            'essay' => 'ES',
            'fill_blank' => 'FB',
        ];
        $typesText = implode('/', array_map(fn($t) => $typeMap[$t] ?? 'MC', $types));

        // Compress material
        $notesText = preg_replace('/\s+/', ' ', implode("\n", $notes));

        // Abbreviate difficulty
        $diffShort = match ($diff) {
            'easy' => 'E',
            'medium' => 'M',
            'hard' => 'H',
            default => 'E/M/H',
        };

        $focusSection = !empty($userPrompt) ? "\nFOCUS: {$userPrompt}" : '';

        // Visual instructions
        $visualsInstruction = "\nINSTRUCTION: Text only. No LaTeX/SVG.";
        if ($visuals) {
            $visualsInstruction = "\nVISUALS: Include SIMPLE SVG diagrams or $$...$$ wrapped math where appropriate.";
        }

        // Build personalization from user preferences
        $personalization = '';
        if ($prefs) {
            $parts = [];
            $levelMap = ['high_school' => 'High School', 'undergraduate' => 'Undergraduate', 'masters' => 'Masters/Graduate', 'professional' => 'Professional'];
            $styleMap = ['simple' => 'Use ultra-simple language and simplified analogies', 'detailed' => 'Give detailed academic breakdowns'];
            $toneMap = [
                'supportive' => 'Be extremely warm, encouraging, and motivational (Supportive Coach)',
                'strict' => 'Be strict, formal, and precise (Strict Academic Coach)',
                'concise' => 'Be extremely concise and direct',
                'fun' => 'Be fun, humorous, witty, and use pop-culture references'
            ];
            $analogyMap = [
                'general' => 'Standard academic analogies',
                'tech' => 'Explain abstract concepts using software, coding, hardware, or tech analogies',
                'sports' => 'Explain abstract concepts using athletic dynamics, training, or sports analogies',
                'gaming' => 'Explain abstract concepts using video games, levels, RPG mechanics, anime, or gaming analogies',
                'pop_culture' => 'Explain abstract concepts using grocery store dynamics, coffee shops, or business model analogies'
            ];
            $goalMap = [
                'conceptual' => 'Focus heavily on deep conceptual, first-principles understanding',
                'exam' => 'Focus heavily on exam preparation tactics, high-yield facts, and test traps',
                'cheat' => 'Focus heavily on cheat-sheet style summaries, mnemonics, and active recall elements'
            ];

            if (!empty($prefs['education_level'])) {
                $parts[] = 'Level: ' . ($levelMap[$prefs['education_level']] ?? $prefs['education_level']);
            }
            if (!empty($prefs['field_of_study'])) {
                $parts[] = 'Field: ' . $prefs['field_of_study'];
            }
            if (!empty($prefs['learning_style'])) {
                $parts[] = 'Style: ' . ($styleMap[$prefs['learning_style']] ?? $prefs['learning_style']);
            }
            if (!empty($prefs['tone'])) {
                $parts[] = 'Tone: ' . ($toneMap[$prefs['tone']] ?? $prefs['tone']);
            }
            if (!empty($prefs['analogy_focus'])) {
                $parts[] = 'Analogies: ' . ($analogyMap[$prefs['analogy_focus']] ?? $analogyMap[$prefs['analogy_focus']]);
            }
            if (!empty($prefs['academic_goal'])) {
                $parts[] = 'Goal: ' . ($goalMap[$prefs['academic_goal']] ?? $goalMap[$prefs['academic_goal']]);
            }
            if (!empty($prefs['custom_weakness'])) {
                $parts[] = 'Custom Weakness: ' . $prefs['custom_weakness'];
            }

            if (!empty($parts)) {
                $personalization = "\nSTUDENT PROFILE: " . implode('. ', $parts) . ". Tailor ALL questions and explanations to this profile.";
            }
        }

        return <<<PROMPT
Gen EXACTLY {$count} Q. Types: {$typesText}. Diff: {$diffShort}.{$focusSection}{$visualsInstruction}{$personalization}

INPUT (Notes or Topic): {$notesText}

Format: JSON only. Expand on topic or extract from notes.
Language: YOU MUST detect the language of the provided material and generate the entire output in that EXACT same language. Use simple, natural language appropriate for the detected tongue.
Math: Use proper Unicode characters for math (e.g. sec²(x), x³, √x). Do NOT use raw caret signs like sec^2.
Schema: [{"q":"text","t":"MC|TF|SA|ES|FB","d":"E|M|H","o":["A","B"],"c":"A","xr":"targeted feedback if correct","xw":"targeted feedback if wrong"}]
PROMPT;
    }

    /**
     * Build OPTIMIZED prompt for flashcards (ported from DeepSeek)
     */
    protected function buildFlashcardPrompt(array $notes, int $numberOfCards, string $difficulty, string $userPrompt = ''): string
    {
        $notesText = preg_replace('/\s+/', ' ', implode("\n", $notes));

        $diffShort = match ($difficulty) {
            'easy' => 'E',
            'medium' => 'M',
            'hard' => 'H',
            default => 'E/M/H',
        };

        // Word limits based on difficulty to keep cards concise
        switch ($difficulty) {
            case 'easy':
                $frontLimit = 12; $backLimit = 25; break;
            case 'medium':
                $frontLimit = 10; $backLimit = 20; break;
            case 'hard':
                $frontLimit = 8;  $backLimit = 15; break;
            default:
                $frontLimit = 10; $backLimit = 20; break;
        }

        $focusSection = !empty($userPrompt) ? "\nFOCUS: {$userPrompt}" : '';

        return <<<PROMPT
Gen EXACTLY {$numberOfCards} Flashcards. Diff: {$diffShort}.{$focusSection}

INPUT: {$notesText}

Format: JSON strictly. No markdown wrappers. Just a raw array.
Language: YOU MUST detect the language of the provided material and generate in that EXACT same language.
Schema: [{"front": "Question or concept (short)", "back": "Answer or definition"}]

Rules:
1. The 'front' should be a clear, concise question, term, or concept. Keep it under {$frontLimit} words.
2. The 'back' must be the direct answer or definition. Keep it concise and under {$backLimit} words (no more than {$backLimit} words). If the answer requires more detail, shorten to a precise summary.
3. Output ONLY valid JSON.
4. MATH/SCIENCE: Always format ALL mathematical expressions, equations, formulas, fractions, variables, and exponents in proper LaTeX and wrap them inside standard inline dollar signs \$ ... \$ (e.g. \$\\frac{1}{2}g\$ or \$2^5\$ or \$x^2\$). Never output bare exponents (like 2^5) or un-delimited fractions (like 1/2) in plain text.
PROMPT;
    }

    // ─── RESPONSE PARSERS ───────────────────────────────────────────────

    /**
     * Parse questions from API response — 3-tier fallback (ported from DeepSeek)
     * Attempt 1: Direct JSON decode
     * Attempt 2: Regex array extraction
     * Attempt 3: Truncated JSON salvage (individual object extraction)
     */
    protected function parseQuestionsFromResponse(string $response): array
    {
        // Clean markdown code blocks
        $cleanResponse = preg_replace('/```(?:json)?|```/', '', $response);
        $cleanResponse = trim($cleanResponse);

        // Attempt 1: Direct JSON Decode
        $data = json_decode($cleanResponse, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (isset($data['questions']) && is_array($data['questions'])) {
                return $this->formatQuestions($data['questions']);
            }
            if (is_array($data) && array_is_list($data)) {
                return $this->formatQuestions($data);
            }
        }

        // Attempt 2: Fallback Regex Extraction
        if (preg_match('/\[[\s\S]*\]/', $response, $matches)) {
            $questions = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($questions)) {
                return $this->formatQuestions($questions);
            }
        }

        // Attempt 3: Truncated JSON Salvage (if max_tokens cut it off)
        preg_match_all('/\{[^{}]+\}/', $response, $objectMatches);
        if (!empty($objectMatches[0])) {
            $salvagedData = [];
            foreach ($objectMatches[0] as $jsonObj) {
                $decoded = json_decode($jsonObj, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && (isset($decoded['q']) || isset($decoded['question_text']))) {
                    $salvagedData[] = $decoded;
                }
            }
            if (!empty($salvagedData)) {
                Log::warning('AnthropicAIService: JSON was truncated, but salvaged ' . count($salvagedData) . ' valid questions.');
                return $this->formatQuestions($salvagedData);
            }
        }

        throw new \Exception('Could not parse questions from response. Raw: ' . substr($response, 0, 100));
    }

    /**
     * Format questions — handles both abbreviated (q, t, d) and full (question_text, etc) keys
     */
    protected function formatQuestions(array $rawQuestions): array
    {
        $typeMap = ['MC' => 'multiple_choice', 'TF' => 'true_false', 'SA' => 'short_answer', 'ES' => 'essay', 'FB' => 'fill_blank'];
        $diffMap = ['E' => 'easy', 'M' => 'medium', 'H' => 'hard'];

        return array_map(function ($q) use ($typeMap, $diffMap) {
            $type = $q['t'] ?? $q['question_type'] ?? 'MC';
            $type = $typeMap[$type] ?? $this->mapQuestionType($type);

            $diff = $q['d'] ?? $q['difficulty_level'] ?? 'M';
            $diff = $diffMap[$diff] ?? 'medium';

            return [
                'question_text' => $q['q'] ?? $q['question_text'] ?? '',
                'question_type' => $type,
                'difficulty_level' => $diff,
                'topic' => $q['topic'] ?? 'General',
                'learning_objective' => $q['learning_objective'] ?? '',
                'explanation' => $q['x'] ?? $q['explanation'] ?? '',
                'explanation_right' => $q['xr'] ?? $q['explanation_right'] ?? '',
                'explanation_wrong' => $q['xw'] ?? $q['explanation_wrong'] ?? '',
                'options' => $q['o'] ?? $q['options'] ?? [],
                'correct_answer' => $q['c'] ?? $q['correct_answer'] ?? '',
            ];
        }, $rawQuestions);
    }

    /**
     * Map question type strings to system types
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
}
