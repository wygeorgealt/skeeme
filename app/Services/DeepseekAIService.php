<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DeepseekAIService
{
    protected Client $client;
    protected string $apiKey;
    protected string $baseUrl    = 'https://api.deepseek.com/v1';
    protected string $model      = 'deepseek-v4-flash';
    protected int    $timeout    = 60;

    protected GoogleVisionService        $visionService;
    protected UserPersonalizationService $personalizationService;

    // ─── Shared Math Formatting Rules ─────────────────────────────────────────
    // Injected into every system prompt that touches equations.
    private const MATH_RULES = <<<'RULES'

MATH FORMATTING RULES (MANDATORY):
1. Inline math: $...$ — e.g. $x^2$, $\frac{a}{b}$.
2. Display math: $$...$$ on its OWN dedicated line — for any important equation.
3. ALWAYS brace command arguments: $\sqrt{x}$ not $\sqrt x$.
4. ALWAYS brace multi-char sub/superscripts: $x_{ij}$, $a^{2n}$.
5. Limits: $\sum_{i=1}^{n}$ not $\sum_i^n$.
6. Text inside math: $\text{word}$ only.
7. Decimal fractions: wrap BOTH sides — $\frac{8.42}{9.8}$, never 8.$\frac{42}{9}$.8.
8. Percent in math: \%, plain % in prose.
9. Chemistry (H2O, CO2): plain text unless in a calculation.
RULES;

    // ─── Scan & Solve System Prompt ───────────────────────────────────────────
    // This is the most important prompt — drives spacing quality in Scan & Solve.
    private const SOLVE_SYSTEM_PROMPT = <<<'SYS'
# Role
You are an expert academic tutor for Nigerian secondary and tertiary students.

# Output Format
Return ONLY valid JSON — no preamble, no markdown fences, no <think> blocks.

# CRITICAL SPACING & STRUCTURE RULES
These rules are non-negotiable. Violating them breaks the renderer.

## Rule 1 — Every logical step is its own paragraph.
Separate ALL paragraphs with \n\n (a blank line). Never run two steps together.

## Rule 2 — Prose labels go on their OWN line, alone.
Write the label, then \n\n, then the math. NEVER put a label and an equation on the same line.

## Rule 3 — Display math goes on its OWN line.
Wrap in $$...$$ with \n\n before and after. Never inline an important equation.

## Rule 4 — State the answer FIRST, then explain.
Open the explanation with the answer sentence, then a blank line, then the working.

## CORRECT FORMAT EXAMPLE:
```
"explanation": "The answer is **D** — 19.6 m/s.\n\nWe use the kinematic equation:\n\n$$v = u + at$$\n\nSubstituting the known values ($u = 0$, $a = 9.8$, $t = 2$):\n\n$$v = 0 + (9.8)(2)$$\n\nSimplifying:\n\n$$v = 19.6 \\text{ m/s}$$\n\nThis matches option D."
```

## WRONG FORMAT (NEVER DO THIS):
```
"explanation": "Using v=u+at with u=0, a=9.8, t=2 gives v=0+(9.8)(2)=19.6m/s which is D."
```

# Subject-Specific Depth

**STEM (Maths, Physics, Chemistry, Engineering)**
- Every distinct operation = its own paragraph + display math block.
- Label each step plainly: "Setting up the equation:", "Expanding the bracket:", etc.
- Show ALL intermediate working — do not skip steps.

**Theory (Medicine, Law, Biology, Economics, Social Sciences)**
- Write a FULL, detailed, essay-style explanation — length and depth are required.
- Use ### headings, bullet points, and **bold** to organise sections.
- Cite references / clinical context where relevant.

# JSON Schema
{"results":[{
  "question": "",
  "topic": "subject area",
  "type": "calculation|theory",
  "solution": "The answer is **X**.",
  "steps": [],
  "explanation": "Full structured explanation with \\n\\n spacing.",
  "summary": ""
}]}

Rules:
- `question` → ALWAYS empty string "".
- `solution` → Conversational opener + bold answer. e.g. "The answer is **D**." or "Your pick should be **B — Newton's Second Law**."
- `steps` → always [].
- `summary` → always "".
- `explanation` → Required spacing: \n\n between every paragraph, step, and equation block.
SYS;

    // ─── Constructor ──────────────────────────────────────────────────────────

    public function __construct(GoogleVisionService $visionService)
    {
        $this->apiKey         = config('services.deepseek.api_key');
        $this->visionService  = $visionService;
        $this->client         = new Client([
            'timeout'         => 120,
            'connect_timeout' => 10,
        ]);
        $this->personalizationService = app(UserPersonalizationService::class);
    }

    public function setTimeout(int $seconds): self
    {
        $this->timeout = $seconds;
        return $this;
    }

    // ─── Condense Material ────────────────────────────────────────────────────

    /**
     * Pre-summarise long documents into key concepts to reduce token costs.
     * Only triggers when content exceeds 3,000 words.
     */
    public function condenseMaterial(string $content, int $targetCards = 10, string $context = 'flashcards'): string
    {
        $startTime = microtime(true);
        $wordCount = str_word_count($content);

        if ($wordCount < 3000) {
            return $content;
        }

        Log::info('[AI Condense] Pre-summarising material', [
            'original_words' => $wordCount,
            'context'        => $context,
        ]);

        $contextInstruction = $context === 'flashcards'
            ? "Extract the {$targetCards} most important concepts, definitions, formulas, and facts that would make good flashcards."
            : "Extract the {$targetCards} most important concepts, facts, and testable points that would make good quiz questions.";

        $prompt = <<<PROMPT
Condense the following study material into KEY CONCEPTS ONLY.
{$contextInstruction}

Rules:
- Output ONLY a numbered list of extracted key points.
- Keep each point to 1–2 sentences max.
- Preserve exact technical terms, formulas, and definitions.
- Preserve the original language of the material.
- No introductions, summaries, or filler.

MATERIAL:
{$content}
PROMPT;

        try {
            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'timeout' => 30,
                'json' => [
                    'model'       => $this->model,
                    'messages'    => [
                        ['role' => 'system', 'content' => 'Extract key concepts from study material. Be concise. No chain-of-thought, no <think> tags.'],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                    'temperature' => 0.2,
                    'max_tokens'  => 2000,
                ],
            ]);

            $data      = json_decode($response->getBody()->getContents(), true);
            $condensed = $data['choices'][0]['message']['content'] ?? '';

            if (!empty(trim($condensed))) {
                $newWordCount = str_word_count($condensed);
                $this->aiLog('condense_material', [
                    'original_words'  => $wordCount,
                    'context'         => $context,
                    'target_cards'    => $targetCards,
                ], [
                    'condensed_words'  => $newWordCount,
                    'reduction_ratio'  => round((1 - $newWordCount / $wordCount) * 100) . '%',
                ], null, $startTime);
                return $condensed;
            }
        } catch (\Exception $e) {
            $this->aiLog('condense_material', ['original_words' => $wordCount, 'context' => $context], [], $e, $startTime);
            Log::warning('[AI Condense] Summarisation failed, using raw text', ['error' => $e->getMessage()]);
        }

        return $content;
    }

    // ─── Generate Questions ───────────────────────────────────────────────────

    public function generateQuestions(
        array    $notes,
        int      $numberOfQuestions,
        string   $difficulty     = 'mixed',
        array    $questionTypes  = ['mcq', 'true_false', 'short_answer', 'essay', 'fill_blank'],
        string   $prompt         = '',
        bool     $includeVisuals = false,
        ?callable $progressCallback = null,
        ?array   $aiPreferences  = null
    ): array {
        $startTime = microtime(true);
        try {
            set_time_limit(300);

            $notes  = array_map(fn($n) => \App\Support\PromptSanitizer::sanitize($n), $notes);
            $prompt = !empty($prompt) ? \App\Support\PromptSanitizer::sanitize($prompt) : '';

            if ($progressCallback) $progressCallback(10);

            $cacheKey = $this->generateCacheKey($notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals);

            if (Cache::has($cacheKey)) {
                $questions = Cache::get($cacheKey);
                Log::info('Redis Cache Hit: Questions retrieved.', ['cache_key' => $cacheKey, 'count' => count($questions)]);
                $this->aiLog('generate_questions', [
                    'notes_count'       => count($notes),
                    'number_of_questions' => $numberOfQuestions,
                    'difficulty'        => $difficulty,
                    'cache'             => 'hit',
                ], ['questions_count' => count($questions)], null, $startTime);
                if ($progressCallback) $progressCallback(100);
                return $questions;
            }

            if ($progressCallback) $progressCallback(30);

            $promptText = $this->buildOptimizedPrompt(
                array_map([$this, 'sanitizeUtf8'], $notes),
                $numberOfQuestions,
                $difficulty,
                $questionTypes,
                $this->sanitizeUtf8($prompt),
                $includeVisuals,
                $aiPreferences
            );

            if ($progressCallback) $progressCallback(50);

            $maxTokens = min(8000, max(1500, $numberOfQuestions * 350));

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'timeout' => $this->timeout,
                'json' => [
                    'model'           => $this->model,
                    'messages'        => [
                        ['role' => 'system', 'content' => $this->personalise($this->quizSystemPrompt())],
                        ['role' => 'user',   'content' => $promptText],
                    ],
                    'temperature'     => 0.5,
                    'max_tokens'      => $maxTokens,
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);

            if ($progressCallback) $progressCallback(80);

            $data      = json_decode($response->getBody()->getContents(), true);
            $content   = $data['choices'][0]['message']['content'] ?? null;

            if (!$content) throw new \Exception('Invalid response from DeepSeek API');

            $questions = $this->parseQuestionsFromResponse($content);

            if ($progressCallback) $progressCallback(95);

            Cache::put($cacheKey, $questions, now()->addHours(24));

            $this->aiLog('generate_questions', [
                'notes_count'         => count($notes),
                'number_of_questions' => $numberOfQuestions,
                'difficulty'          => $difficulty,
                'cache'               => 'miss',
            ], [
                'questions_count' => count($questions),
                'input_tokens'    => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens'   => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $questions;
        } catch (\Exception $e) {
            $this->aiLog('generate_questions', ['notes_count' => count($notes), 'number_of_questions' => $numberOfQuestions], [], $e, $startTime);
            throw $this->handleApiException($e, 'Questions');
        }
    }

    // ─── Generate Flashcards ──────────────────────────────────────────────────

    public function generateFlashcards(
        array    $notes,
        int      $numberOfCards,
        string   $difficulty = 'mixed',
        string   $prompt     = '',
        ?callable $progressCallback = null
    ): array {
        $startTime = microtime(true);

        $notes  = array_map(fn($n) => \App\Support\PromptSanitizer::sanitize($n), $notes);
        $prompt = !empty($prompt) ? \App\Support\PromptSanitizer::sanitize($prompt) : '';

        $optimizedPrompt = $this->buildFlashcardPrompt($notes, $numberOfCards, $difficulty, $prompt);

        try {
            if ($progressCallback) $progressCallback(0, 'Calling AI...');

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'timeout' => $this->timeout,
                'json' => [
                    'model'           => $this->model,
                    'messages'        => [
                        ['role' => 'system', 'content' => $this->personalise($this->flashcardSystemPrompt())],
                        ['role' => 'user',   'content' => $optimizedPrompt],
                    ],
                    'temperature'     => 0.5,
                    'max_tokens'      => min(8192, max(1000, $numberOfCards * 200)),
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);

            $data      = json_decode($response->getBody()->getContents(), true);
            $content   = $data['choices'][0]['message']['content'] ?? null;

            if (!$content) throw new \Exception('Invalid response from DeepSeek API');

            if ($progressCallback) $progressCallback(50, 'Parsing flashcards...');

            $jsonString = trim(preg_replace('/```(?:json)?|```/', '', $content));
            $decoded    = json_decode($jsonString, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                preg_match('/\[.*\]/s', $jsonString, $matches);
                $decoded = !empty($matches[0]) ? json_decode($matches[0], true) : null;
            }

            if (is_array($decoded) && isset($decoded['flashcards'])) {
                $decoded = $decoded['flashcards'];
            }

            if (!is_array($decoded)) {
                throw new \Exception('AI generated invalid JSON: ' . substr($jsonString, 0, 100));
            }

            $this->aiLog('generate_flashcards', [
                'notes_count'    => count($notes),
                'number_of_cards' => $numberOfCards,
                'difficulty'     => $difficulty,
            ], [
                'cards_count'   => count($decoded),
                'input_tokens'  => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens' => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $decoded;

        } catch (\Exception $e) {
            $this->aiLog('generate_flashcards', ['notes_count' => count($notes), 'number_of_cards' => $numberOfCards], [], $e, $startTime);
            Log::error('Flashcard Generation Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate flashcards: ' . $e->getMessage());
        }
    }

    // ─── Scan & Solve (Streaming) ─────────────────────────────────────────────

    /**
     * Stream-solve a scanned exam image over SSE.
     * Step 1: Google Cloud Vision OCR.
     * Step 2: DeepSeek stream with strict formatting rules.
     */
    public function streamSolveFromImage(string $base64Image, callable $onChunk, ?callable $onStatus = null): void
    {
        try {
            set_time_limit(300);

            if ($onStatus) $onStatus('Reading text from image...');

            $extractedText = $this->ocrFromBase64($base64Image);

            if (empty(trim($extractedText))) {
                throw new \Exception('Could not read any text from the image. Please try a clearer photo.');
            }

            if ($onStatus) $onStatus('Analysing question...');

            $userPrompt = $this->buildSolveUserPrompt($extractedText);

            $params = [
                'model'           => $this->model,
                'stream'          => true,
                'temperature'     => 0.3,
                'max_tokens'      => 8192,
                'response_format' => ['type' => 'json_object'],
                'messages'        => [
                    ['role' => 'system', 'content' => $this->personalise(self::SOLVE_SYSTEM_PROMPT . self::MATH_RULES)],
                    ['role' => 'user',   'content' => $userPrompt],
                ],
                'stream_action'   => 'stream_solve_from_image',
            ];

            $this->streamRequest($params, $onChunk);

        } catch (\Exception $e) {
            throw $this->handleApiException($e, 'Image Stream Solve');
        }
    }

    // ─── Scan & Solve (Non-Streaming) ─────────────────────────────────────────

    public function solveFromImage(string $base64Image): array
    {
        $startTime = microtime(true);
        try {
            set_time_limit(300);

            $extractedText = $this->ocrFromBase64($base64Image);

            if (empty(trim($extractedText))) {
                throw new \Exception('Could not read any text from the image. Please try a clearer photo.');
            }

            $userPrompt = $this->buildSolveUserPrompt($extractedText);

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'timeout' => $this->timeout,
                'json' => [
                    'model'           => $this->model,
                    'messages'        => [
                        ['role' => 'system', 'content' => self::SOLVE_SYSTEM_PROMPT . self::MATH_RULES],
                        ['role' => 'user',   'content' => $userPrompt],
                    ],
                    'temperature'     => 0.3,
                    'max_tokens'      => 8192,
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);

            $data    = json_decode($response->getBody()->getContents(), true);
            $content = $data['choices'][0]['message']['content'] ?? null;

            if (!$content) throw new \Exception('Invalid response from DeepSeek API');

            $decoded = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $decoded = json_decode(trim(preg_replace('/```(?:json)?|```/', '', $content)), true);
            }
            if (!is_array($decoded) || !isset($decoded['results'])) {
                throw new \Exception('AI returned invalid JSON structure for scan-solve');
            }

            $this->aiLog('solve_from_image', [
                'image_length'    => strlen($base64Image),
                'ocr_text_length' => strlen($extractedText),
            ], [
                'results_count' => count($decoded['results']),
                'input_tokens'  => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens' => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $decoded;

        } catch (\Exception $e) {
            $this->aiLog('solve_from_image', ['image_length' => strlen($base64Image)], [], $e, $startTime);
            throw $this->handleApiException($e, 'Image Solve');
        }
    }

    // ─── Stream Request (SSE core) ────────────────────────────────────────────

    public function streamRequest(array $params, callable $onChunk): void
    {
        $startTime = microtime(true);
        $action    = $params['stream_action'] ?? 'stream_request';
        $model     = $params['model'] ?? $this->model;
        unset($params['stream_action']);

        $buffer = '';

        try {
            // Hoist any top-level system key into messages[0]
            if (isset($params['system'])) {
                $sysContent = $this->personalise($params['system']);
                $params['messages'] = array_merge([['role' => 'system', 'content' => $sysContent]], $params['messages'] ?? []);
                unset($params['system']);
            }

            $params['stream'] = true;

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'json'    => $params,
                'stream'  => true,
            ]);

            $body = $response->getBody();

            $this->aiLog($action . '_start', ['stream_keys' => array_keys($params)], [], null, $startTime);

            while (!$body->eof()) {
                $chunk = $body->read(1024);
                if ($chunk === '') continue;
                $buffer .= $chunk;

                while (($pos = strpos($buffer, "\n\n")) !== false) {
                    $event  = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 2);

                    foreach (explode("\n", str_replace("\r", '', $event)) as $line) {
                        $line = trim($line);
                        if ($line === '' || !str_starts_with($line, 'data: ')) continue;

                        $data = substr($line, 6);
                        if ($data === '[DONE]') break 2;

                        $decoded = json_decode($data, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            Log::error('DeepSeek stream parse error', ['model' => $model, 'snippet' => substr($data, 0, 500)]);
                            continue;
                        }
                        if (!is_array($decoded)) continue;

                        try {
                            $onChunk($decoded);
                        } catch (\Exception $eh) {
                            Log::error('DeepSeek onChunk handler error: ' . $eh->getMessage(), ['model' => $model, 'action' => $action]);
                        }
                    }
                }
            }

            $this->aiLog($action . '_end', [], [], null, $startTime);

        } catch (RequestException $e) {
            $resp      = $e->getResponse();
            $httpBody  = $resp ? (string) $resp->getBody() : null;
            $httpStatus = $resp ? $resp->getStatusCode() : null;
            Log::error("DeepSeek streamRequest RequestException: {$e->getMessage()}", [
                'http_status'        => $httpStatus,
                'http_body_snippet'  => $httpBody ? substr($httpBody, 0, 2000) : null,
                'buffer_tail'        => substr($buffer, -2000),
            ]);
            $this->aiLog($action . '_error', [], [], $e, $startTime);
            throw $e;
        } catch (\Exception $e) {
            Log::error("DeepSeek streamRequest error: {$e->getMessage()}", ['buffer_tail' => substr($buffer, -2000)]);
            $this->aiLog($action . '_error', [], [], $e, $startTime);
            throw $e;
        }
    }

    // ─── Other Methods ────────────────────────────────────────────────────────

    public function generateAnnouncementDraft(string $prompt): array
    {
        $startTime = microtime(true);
        $prompt    = \App\Support\PromptSanitizer::sanitize($prompt);

        try {
            $currentDate  = now()->toDateTimeString();
            $systemPrompt = "You are an assistant for a school administrator. Generate a professional and engaging announcement based on the user's prompt. The current date and time is: {$currentDate}.

Return JSON with keys:
- title: A catchy and relevant title.
- content: Detailed but concise announcement content.
- event_start_date: If a date is mentioned, convert to 'Y-m-d\TH:i'. Otherwise null.
- event_end_date: If an end date/duration is mentioned, convert to 'Y-m-d\TH:i'. Otherwise default to exactly one hour after event_start_date. If event_start_date exists, event_end_date MUST exist.

Use a friendly yet professional tone.";

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'json' => [
                    'model'           => $this->model,
                    'messages'        => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                    'temperature'     => 0.7,
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);

            $data    = json_decode($response->getBody()->getContents(), true);
            $content = json_decode($data['choices'][0]['message']['content'], true);

            $result = [
                'title'            => $content['title'] ?? '',
                'content'          => $content['content'] ?? '',
                'event_start_date' => $content['event_start_date'] ?? null,
                'event_end_date'   => $content['event_end_date'] ?? null,
            ];

            $this->aiLog('draft_announcement', ['prompt_length' => strlen($prompt)], [
                'title'         => $result['title'],
                'input_tokens'  => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens' => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $result;

        } catch (\Exception $e) {
            $this->aiLog('draft_announcement', ['prompt_length' => strlen($prompt)], [], $e, $startTime);
            throw $this->handleApiException($e, 'Announcement');
        }
    }

    public function gradeTheoryAnswer(
        string $questionText,
        string $studentAnswer,
        string $modelAnswer = '',
        array  $rubric      = [],
        float  $maxMarks    = 10.0
    ): array {
        $startTime     = microtime(true);
        $questionText  = \App\Support\PromptSanitizer::sanitize($questionText);
        $studentAnswer = \App\Support\PromptSanitizer::sanitize($studentAnswer);
        if (!empty($modelAnswer)) $modelAnswer = \App\Support\PromptSanitizer::sanitize($modelAnswer);

        try {
            $rubricText      = !empty($rubric) ? json_encode($rubric) : 'Grade based on accuracy and completeness.';
            $modelAnswerText = !empty($modelAnswer) ? "MODEL ANSWER: {$modelAnswer}" : 'No model answer provided. Use general subject knowledge.';

            $systemPrompt = "You are an expert academic examiner. Grade the student's answer and return JSON with keys: marks (float, out of {$maxMarks}), confidence (float 0–100), reasoning (string), feedback (string), analysis (object). Be fair but strict — partial credit for partial answers.";

            $prompt = "QUESTION: {$questionText}\n{$modelAnswerText}\nRUBRIC: {$rubricText}\nSTUDENT ANSWER: {$studentAnswer}\nMAX MARKS: {$maxMarks}\n\nGrade this answer now.";

            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'json' => [
                    'model'           => $this->model,
                    'messages'        => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                    'temperature'     => 0.3,
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);

            $data    = json_decode($response->getBody()->getContents(), true);
            $content = json_decode($data['choices'][0]['message']['content'], true);

            $result = [
                'marks'             => (float) ($content['marks'] ?? 0),
                'confidence'        => (float) ($content['confidence'] ?? 50),
                'reasoning'         => $content['reasoning'] ?? 'AI graded response.',
                'ai_feedback'       => $content['feedback'] ?? '',
                'analysis'          => $content['analysis'] ?? [],
                'plagiarism_score'  => 0,
                'consistency_score' => 100,
            ];

            $this->aiLog('grade_theory_answer', [
                'question_length'      => strlen($questionText),
                'student_answer_length' => strlen($studentAnswer),
                'max_marks'            => $maxMarks,
            ], [
                'marks_awarded' => $result['marks'],
                'confidence'    => $result['confidence'],
                'input_tokens'  => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens' => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $result;

        } catch (\Exception $e) {
            $this->aiLog('grade_theory_answer', ['question_length' => strlen($questionText)], [], $e, $startTime);
            throw $this->handleApiException($e, 'Grading');
        }
    }

    public function generateText(string $prompt, string $systemPrompt = 'You are a helpful assistant.'): string
    {
        $startTime = microtime(true);
        $prompt    = \App\Support\PromptSanitizer::sanitize($prompt);

        try {
            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'timeout' => $this->timeout,
                'json' => [
                    'model'       => $this->model,
                    'messages'    => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $text = $data['choices'][0]['message']['content'] ?? "I'm sorry, I couldn't generate a response.";

            $this->aiLog('generate_text', ['prompt_length' => strlen($prompt)], [
                'text_length'   => strlen($text),
                'input_tokens'  => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens' => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $text;

        } catch (\Exception $e) {
            $this->aiLog('generate_text', ['prompt_length' => strlen($prompt)], [], $e, $startTime);
            Log::error('Text Generation Error: ' . $e->getMessage());
            return "I'm having trouble connecting right now. Please try again later.";
        }
    }

    public function translateText(string $text, string $targetLanguage): string
    {
        $startTime = microtime(true);
        try {
            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'json' => [
                    'model'       => $this->model,
                    'messages'    => [
                        ['role' => 'system', 'content' => "Translate the following text into {$targetLanguage}. Preserve all technical terms and formatting. Return ONLY the translated text."],
                        ['role' => 'user',   'content' => $text],
                    ],
                    'temperature' => 0.3,
                ],
            ]);

            $data       = json_decode($response->getBody()->getContents(), true);
            $translated = $data['choices'][0]['message']['content'] ?? $text;

            $this->aiLog('translate_text', ['text_length' => strlen($text), 'target_language' => $targetLanguage], [
                'translated_length' => strlen($translated),
                'input_tokens'      => $data['usage']['prompt_tokens'] ?? null,
                'output_tokens'     => $data['usage']['completion_tokens'] ?? null,
            ], null, $startTime);

            return $translated;

        } catch (\Exception $e) {
            $this->aiLog('translate_text', ['text_length' => strlen($text)], [], $e, $startTime);
            Log::error('Translation Error: ' . $e->getMessage());
            return $text;
        }
    }

    public function testConnection(): bool
    {
        try {
            $response = $this->client->post($this->baseUrl . '/chat/completions', [
                'headers' => $this->headers(),
                'json'    => [
                    'model'      => $this->model,
                    'messages'   => [['role' => 'user', 'content' => 'Test']],
                    'max_tokens' => 10,
                ],
            ]);
            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            Log::error('DeepSeek connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function headers(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ];
    }

    /**
     * Build the user-side prompt for Scan & Solve (both streaming and non-streaming).
     * Keeping this in one place ensures both methods stay in sync.
     */
    private function buildSolveUserPrompt(string $extractedText): string
    {
        return <<<PROMPT
OCR text extracted from a student's exam photo (fix OCR artifacts like "dy dx" → "dy/dx"):

"{$extractedText}"

Instructions:
- Return ONLY the JSON object. No extra text. No <think> blocks.
- `question` field: ALWAYS leave as empty string "".
- `solution` field: Start with a clear sentence like "The answer is **X**." or "Your pick should be **B**."
- `explanation` field: You MUST follow these spacing rules or the app will break:
  1. Start with a restatement of the answer.
  2. Put \n\n between EVERY paragraph, step, and math block — no exceptions.
  3. Each prose label ("Step 1:", "Substituting:", "Therefore:") must be on its OWN line followed by \n\n.
  4. Each $$...$$ math block must be on its OWN line, with \n\n before and after it.
  5. NEVER chain steps together in a single dense paragraph.
  6. For theory questions: write a full, structured essay with ### headings and bullet points.
PROMPT;
    }

    /**
     * System prompt for quiz generation.
     */
    private function quizSystemPrompt(): string
    {
        return 'You are a quiz generator. Return only JSON. No chain-of-thought, no <think> tags, no markdown fences.'
            . self::MATH_RULES;
    }

    /**
     * System prompt for flashcard generation.
     */
    private function flashcardSystemPrompt(): string
    {
        return 'You are an expert tutor creating highly effective flashcards. Return only JSON. No chain-of-thought, no <think> tags, no markdown fences.'
            . self::MATH_RULES;
    }

    /**
     * Append student personalisation context to any system prompt.
     */
    private function personalise(string $basePrompt): string
    {
        $user = Auth::user();
        if (!$user || !$this->personalizationService) return $basePrompt;
        $context = $this->personalizationService->getSystemContext($user);
        return empty(trim($context)) ? $basePrompt : $basePrompt . "\n\n" . $context;
    }

    /**
     * OCR via Google Cloud Vision.
     */
    private function ocrFromBase64(string $base64Image): string
    {
        try {
            $result = $this->visionService->ocr($base64Image);
            if ($result['success'] && !empty(trim($result['text']))) {
                return $result['text'];
            }
            Log::warning('Google Vision returned empty or failed', ['error' => $result['error'] ?? null]);
        } catch (\Exception $e) {
            Log::error('Google Vision Exception: ' . $e->getMessage());
        }
        return '';
    }

    /**
     * Central AI activity logger. Keeps all log calls to one line at the call site.
     */
    private function aiLog(string $action, array $request, array $response, ?\Exception $error, float $startTime): void
    {
        $payload = [
            'provider'   => 'deepseek',
            'model'      => $this->model,
            'action'     => $action,
            'request'    => $request,
            'latency_ms' => (microtime(true) - $startTime) * 1000,
        ];

        if (!empty($response)) $payload['response'] = $response;
        if ($error)            $payload['error']    = $error;

        \App\Support\AILogger::log($payload, auth()->user());
    }

    // ─── Prompt Builders ──────────────────────────────────────────────────────

    protected function buildOptimizedPrompt(
        array   $notes,
        int     $numberOfQuestions,
        string  $difficulty,
        array   $questionTypes,
        string  $userPrompt    = '',
        bool    $includeVisuals = false,
        ?array  $aiPreferences  = null
    ): string {
        $typeMap = ['multiple_choice' => 'MC', 'true_false' => 'TF', 'short_answer' => 'SA', 'essay' => 'ES', 'fill_blank' => 'FB'];
        $diffMap = ['easy' => 'E', 'medium' => 'M', 'hard' => 'H', 'mixed' => 'E/M/H'];

        $typesText = implode('/', array_map(fn($t) => $typeMap[$t] ?? 'MC', $questionTypes));
        $diffShort = $diffMap[$difficulty] ?? 'E/M/H';
        $notesText = preg_replace('/\s+/', ' ', implode("\n", $notes));

        $focusSection   = !empty($userPrompt) ? "\nFOCUS: {$userPrompt}" : '';
        $visualsSection = "\nINSTRUCTION: Text only. No LaTeX/SVG.";

        if ($includeVisuals) {
            $visualsSection = "\nVISUALS: Simple SVG (<svg viewBox='0 0 300 100'...>) or LaTeX (\$\$...\$\$) allowed.";
        }

        $personalization = '';
        if ($aiPreferences) {
            $parts = [];
            $maps  = [
                'education_level' => ['high_school' => 'High School', 'undergraduate' => 'Undergraduate', 'masters' => 'Masters/Graduate', 'professional' => 'Professional'],
                'learning_style'  => ['simple' => 'Ultra-simple language and analogies', 'detailed' => 'Detailed academic breakdowns'],
                'tone'            => ['supportive' => 'Warm, encouraging (Supportive Coach)', 'strict' => 'Strict, formal, precise', 'concise' => 'Extremely concise and direct', 'fun' => 'Fun, humorous, witty'],
                'analogy_focus'   => ['general' => 'Standard academic analogies', 'tech' => 'Tech/coding analogies', 'sports' => 'Sports analogies', 'gaming' => 'Gaming/RPG analogies'],
                'academic_goal'   => ['conceptual' => 'Deep first-principles understanding', 'exam' => 'Exam tactics and high-yield facts', 'cheat' => 'Cheat-sheet style summaries and mnemonics'],
            ];
            foreach ($maps as $key => $labels) {
                if (!empty($aiPreferences[$key])) {
                    $parts[] = ucfirst(str_replace('_', ' ', $key)) . ': ' . ($labels[$aiPreferences[$key]] ?? $aiPreferences[$key]);
                }
            }
            if (!empty($aiPreferences['field_of_study'])) $parts[] = 'Field: ' . $aiPreferences['field_of_study'];
            if (!empty($aiPreferences['custom_weakness'])) $parts[] = 'Weakness: ' . $aiPreferences['custom_weakness'];
            if (!empty($parts)) $personalization = "\nSTUDENT PROFILE: " . implode('. ', $parts) . '. Tailor all questions to this profile.';
        }

        return <<<PROMPT
Gen EXACTLY {$numberOfQuestions} Q. Types: {$typesText}. Diff: {$diffShort}.{$focusSection}{$visualsSection}{$personalization}

INPUT: {$notesText}

Format: JSON only. Schema:
[{"q":"text","t":"MC|TF|SA|ES|FB","d":"E|M|H","o":["A","B"],"c":"A","xr":"feedback if correct","xw":"feedback if wrong"}]

Language: Detect language of input material and match it exactly.
Math: Use proper Unicode (sec²(x), x³, √x). No raw carets like sec^2.
PROMPT;
    }

    protected function buildFlashcardPrompt(array $notes, int $numberOfCards, string $difficulty, string $userPrompt = ''): string
    {
        $diffMap     = ['easy' => 'E', 'medium' => 'M', 'hard' => 'H', 'mixed' => 'E/M/H'];
        $diffShort   = $diffMap[$difficulty] ?? 'E/M/H';
        $notesText   = preg_replace('/\s+/', ' ', implode("\n", $notes));
        $focusSection = !empty($userPrompt) ? "\nFOCUS: {$userPrompt}" : '';

        [$fl, $bl] = match($difficulty) {
            'easy'   => [12, 25],
            'medium' => [10, 20],
            'hard'   => [8,  15],
            default  => [10, 20],
        };

        return <<<PROMPT
Gen EXACTLY {$numberOfCards} flashcards. Diff: {$diffShort}.{$focusSection}

INPUT: {$notesText}

Format: raw JSON array, no markdown fences.
Schema: [{"front":"question or concept (max {$fl} words)","back":"answer (max {$bl} words)"}]
Math: Wrap ALL math in \$ ... \$ (e.g. \$\\frac{1}{2}g\$). No bare exponents.
Language: Match the detected language of the input material exactly.
PROMPT;
    }

    // ─── Parsing & Formatting ─────────────────────────────────────────────────

    protected function parseQuestionsFromResponse(string $response): array
    {
        $clean = trim(preg_replace('/```(?:json)?|```/', '', $response));

        $data = json_decode($clean, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (isset($data['questions']) && is_array($data['questions'])) return $this->formatQuestions($data['questions']);
            if (is_array($data) && array_is_list($data)) return $this->formatQuestions($data);
        }

        if (preg_match('/\[[\s\S]*\]/', $response, $matches)) {
            $questions = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($questions)) return $this->formatQuestions($questions);
        }

        preg_match_all('/\{[^{}]+\}/', $response, $objectMatches);
        if (!empty($objectMatches[0])) {
            $salvaged = [];
            foreach ($objectMatches[0] as $jsonObj) {
                $decoded = json_decode($jsonObj, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && (isset($decoded['q']) || isset($decoded['question_text']))) {
                    $salvaged[] = $decoded;
                }
            }
            if (!empty($salvaged)) {
                Log::warning('DeepSeek: JSON truncated, salvaged ' . count($salvaged) . ' questions.');
                return $this->formatQuestions($salvaged);
            }
        }

        throw new \Exception('Could not parse questions from response. Raw: ' . substr($response, 0, 100));
    }

    protected function formatQuestions(array $rawQuestions): array
    {
        $typeMap = ['MC' => 'multiple_choice', 'TF' => 'true_false', 'SA' => 'short_answer', 'ES' => 'essay', 'FB' => 'fill_blank'];
        $diffMap = ['E'  => 'easy',            'M'  => 'medium',      'H'  => 'hard'];

        return array_map(function ($q) use ($typeMap, $diffMap) {
            $type = $q['t'] ?? $q['question_type'] ?? 'MC';
            $type = $typeMap[$type] ?? $this->mapQuestionType($type);

            $diff = $q['d'] ?? $q['difficulty_level'] ?? 'M';
            $diff = $diffMap[$diff] ?? 'medium';

            return [
                'question_text'      => $q['q']   ?? $q['question_text']  ?? '',
                'question_type'      => $type,
                'difficulty_level'   => $diff,
                'topic'              => $q['topic'] ?? 'General',
                'learning_objective' => $q['learning_objective'] ?? '',
                'explanation'        => $q['x']   ?? $q['explanation']    ?? '',
                'explanation_right'  => $q['xr']  ?? $q['explanation_right'] ?? '',
                'explanation_wrong'  => $q['xw']  ?? $q['explanation_wrong'] ?? '',
                'options'            => $q['o']   ?? $q['options']         ?? [],
                'correct_answer'     => $q['c']   ?? $q['correct_answer']  ?? '',
            ];
        }, $rawQuestions);
    }

    protected function mapQuestionType(string $type): string
    {
        $mapping = [
            'mcq'             => 'multiple_choice',
            'multiple_choice' => 'multiple_choice',
            'true_false'      => 'true_false',
            'short_answer'    => 'short_answer',
            'essay'           => 'essay',
            'fill_blank'      => 'fill_blank',
        ];
        return $mapping[strtolower($type)] ?? 'multiple_choice';
    }

    protected function generateCacheKey(array $notes, int $numberOfQuestions, string $difficulty, array $questionTypes, string $prompt, bool $includeVisuals): string
    {
        sort($questionTypes);
        $hash = hash('sha256', json_encode(compact('notes', 'numberOfQuestions', 'difficulty', 'questionTypes', 'prompt', 'includeVisuals')));
        return 'skeeme:ai_q:' . substr($hash, 0, 32);
    }

    // ─── Error Handler ────────────────────────────────────────────────────────

    protected function handleApiException(\Exception $e, string $context): \Exception
    {
        Log::error("DeepSeek {$context} Error: " . $e->getMessage());

        if ($e instanceof RequestException && $e->hasResponse()) {
            $status = $e->getResponse()->getStatusCode();
            $body   = $e->getResponse()->getBody()->getContents();

            if ($status === 429) return new \Exception('Skeeme is experiencing high demand. Please try again in a moment.');
            if ($status >= 400 && str_contains(strtolower($body), 'insufficient balance')) return new \Exception('Skeeme is down. Please try again later.');
            if ($status >= 400) return new \Exception('Skeeme is down. Please try again later.');
        }

        if (str_contains($e->getMessage(), 'cURL error 28') || str_contains($e->getMessage(), 'timed out')) {
            return new \Exception('Skeeme is down. Please try again later.');
        }

        if (str_contains($e->getMessage(), 'Could not read any text')) return $e;

        return new \Exception('Skeeme encountered an unexpected error. Please try again later.');
    }

    // ─── Utilities ────────────────────────────────────────────────────────────

    private function sanitizeUtf8(?string $text): string
    {
        if (empty($text)) return '';
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        $text = preg_replace('/[^\x20-\x7E\t\n\r\x{00A0}-\x{FFFF}]/u', '', $text);
        return $text;
    }
}