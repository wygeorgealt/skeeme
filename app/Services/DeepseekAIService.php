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
        $this->apiKey = config('services.deepseek.api_key');
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
        ?callable $progressCallback = null,
        ?array $aiPreferences = null
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
            $prompt = $this->buildOptimizedPrompt($notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals, $aiPreferences);

            if ($progressCallback) $progressCallback(50);
            
            // Dynamic max_tokens based on count (roughly 350 tokens per question to prevent truncation)
            $calculatedMaxTokens = min(8000, max(1500, $numberOfQuestions * 350));

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
                                'content' => 'You are a quiz generator. Return only JSON.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],
                        'temperature' => 0.5,
                        'max_tokens' => $calculatedMaxTokens,
                        'response_format' => ['type' => 'json_object']
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
     * Grade a theory/essay answer using Deepseek AI
     */
    public function gradeTheoryAnswer(
        string $questionText,
        string $studentAnswer,
        string $modelAnswer = '',
        array $rubric = [],
        float $maxMarks = 10.0
    ): array {
        try {
            $rubricText = !empty($rubric) ? json_encode($rubric) : 'Grade based on accuracy and completeness.';
            $modelAnswerText = !empty($modelAnswer) ? "MODEL ANSWER: {$modelAnswer}" : "No model answer provided. Use general knowledge of the topic.";

            $systemPrompt = "You are an expert academic examiner. Grade the student's answer based on the question and criteria provided.
            
            Return the result in JSON format with the following keys:
            - 'marks': (float) Marks awarded out of {$maxMarks}.
            - 'confidence': (float) Your confidence in this grade (0-100).
            - 'reasoning': (string) Brief explanation of Why you gave this grade.
            - 'feedback': (string) Constructive feedback for the student.
            - 'analysis': (object) Breakdown of the grade (e.g. content, structure, grammar).
            
            Be fair but strict. A partially correct answer should get partial marks.";

            $prompt = "QUESTION: {$questionText}
            {$modelAnswerText}
            RUBRIC/CRITERIA: {$rubricText}
            STUDENT ANSWER: {$studentAnswer}
            MAX MARKS: {$maxMarks}
            
            Grade this answer now.";

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
                        'temperature' => 0.3, // Lower temperature for more consistent grading
                        'response_format' => ['type' => 'json_object'],
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            $content = json_decode($data['choices'][0]['message']['content'], true);

            return [
                'marks' => (float) ($content['marks'] ?? 0),
                'confidence' => (float) ($content['confidence'] ?? 50),
                'reasoning' => $content['reasoning'] ?? 'AI graded response.',
                'ai_feedback' => $content['feedback'] ?? '',
                'analysis' => $content['analysis'] ?? [],
                'plagiarism_score' => 0, // Deepseek doesn't natively provide this yet
                'consistency_score' => 100,
            ];
        } catch (\Exception $e) {
            \Log::error('Deepseek Grading Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate Flashcards from notes or a topic
     */
    public function generateFlashcards(
        array $notes,
        int $numberOfCards,
        string $difficulty = 'mixed',
        string $prompt = '',
        ?callable $progressCallback = null
    ): array {
        $optimizedPrompt = $this->buildFlashcardPrompt(
            $notes,
            $numberOfCards,
            $difficulty,
            $prompt
        );

        try {
            if ($progressCallback) $progressCallback(0, 'Calling AI...');

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
                                'content' => 'You are an expert tutor creating highly effective flashcards. Return only JSON.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $optimizedPrompt,
                            ],
                        ],
                        'temperature' => 0.5,
                        'max_tokens' => max(1000, $numberOfCards * 200),
                        'response_format' => ['type' => 'json_object'],
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new \Exception('Invalid response from Deepseek API');
            }

            $jsonString = $data['choices'][0]['message']['content'];
            
            if ($progressCallback) $progressCallback(50, 'Parsing Flashcards...');

            // Clean up markdown code blocks if present
            $jsonString = preg_replace('/```(?:json)?|```/', '', $jsonString);
            $jsonString = trim($jsonString);

            $decoded = json_decode($jsonString, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                // Fallback attempt: Try to extract JSON array using regex if raw decode fails
                preg_match('/\[.*\]/s', $jsonString, $matches);
                if (!empty($matches[0])) {
                    $decoded = json_decode($matches[0], true);
                }
            }

            // Handle {flashcards: [...]} wrapper from JSON object mode
            if (is_array($decoded) && isset($decoded['flashcards']) && is_array($decoded['flashcards'])) {
                $decoded = $decoded['flashcards'];
            }

            if (!is_array($decoded)) {
                throw new \Exception("AI generated invalid JSON: " . substr($jsonString, 0, 100));
            }

            return $decoded;

        } catch (\Exception $e) {
            \Log::error('Flashcard Generation Error: ' . $e->getMessage(), [
                'prompt_preview' => substr($optimizedPrompt, 0, 200),
                'error' => $e->getMessage()
            ]);
            throw new \Exception("Failed to generate flashcards: " . $e->getMessage());
        }
    }

    /**
     * Build OPTIMIZED prompt for flashcards
     */
    protected function buildFlashcardPrompt(
        array $notes,
        int $numberOfCards,
        string $difficulty,
        string $userPrompt = ''
    ): string {
        $notesText = implode("\n", $notes);
        $notesText = preg_replace('/\s+/', ' ', $notesText);
        
        $diffShort = match($difficulty) {
            'easy' => 'E',
            'medium' => 'M',
            'hard' => 'H',
            'mixed' => 'E/M/H',
            default => 'E/M/H',
        };

        $focusSection = !empty($userPrompt) ? "\nFOCUS: {$userPrompt}" : '';

        return <<<PROMPT
Gen EXACTLY {$numberOfCards} Flashcards. Diff: {$diffShort}.{$focusSection}

INPUT: {$notesText}

Format: JSON strictly. No markdown wrappers. Just a raw array.
Language: Ultra-simple English.
Schema: [{"front": "Question or concept (short)", "back": "Answer or definition"}]

Rules:
1. The 'front' should be a clear, concise question, term, or concept.
2. The 'back' must be the direct answer or definition. Keep it under 3 sentences.
3. Output ONLY valid JSON.
4. MATH/SCIENCE: Use proper Unicode characters for math (e.g. sec²(x), x³, √x). Do NOT use raw caret signs like sec^2.
PROMPT;
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
            \Log::error('Text Generation Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
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
        bool $includeVisuals = false,
        ?array $aiPreferences = null
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

        // Build personalization instructions from user preferences
        $personalization = '';
        if ($aiPreferences) {
            $parts = [];
            $levelMap = ['high_school' => 'High School', 'undergraduate' => 'Undergraduate', 'masters' => 'Masters/Graduate', 'professional' => 'Professional'];
            $styleMap = ['simple' => 'Use ultra-simple language and everyday analogies', 'detailed' => 'Give detailed academic breakdowns', 'analogies' => 'Explain with real-world analogies and examples'];
            $toneMap = ['encouraging' => 'Be warm and encouraging', 'strict' => 'Be strict and formal', 'concise' => 'Be very concise and direct'];

            if (!empty($aiPreferences['education_level'])) {
                $parts[] = 'Level: ' . ($levelMap[$aiPreferences['education_level']] ?? $aiPreferences['education_level']);
            }
            if (!empty($aiPreferences['field_of_study'])) {
                $parts[] = 'Field: ' . $aiPreferences['field_of_study'];
            }
            if (!empty($aiPreferences['learning_style'])) {
                $parts[] = 'Style: ' . ($styleMap[$aiPreferences['learning_style']] ?? $aiPreferences['learning_style']);
            }
            if (!empty($aiPreferences['tone'])) {
                $parts[] = 'Tone: ' . ($toneMap[$aiPreferences['tone']] ?? $aiPreferences['tone']);
            }

            if (!empty($parts)) {
                $personalization = "\nSTUDENT PROFILE: " . implode('. ', $parts) . ". Tailor ALL questions and explanations to this profile.";
            }
        }

        // Minimal but effective prompt with focus capability
        return <<<PROMPT
Gen EXACTLY {$numberOfQuestions} Q. Types: {$typesText}. Diff: {$diffShort}.{$focusSection}{$visualsInstruction}{$personalization}

INPUT (Notes or Topic): {$notesText}

Format: JSON only. Expand on topic or extract from notes.
Language: Use ultra-simple English. Avoid ALL academic jargon and complex words. Every single word must be easy for a regular person to understand.
Math: Use proper Unicode characters for math (e.g. sec²(x), x³, √x). Do NOT use raw caret signs like sec^2.
Schema: [{"q":"text","t":"MC|TF|SA|ES|FB","d":"E|M|H","o":["A","B"],"c":"A","x":"why"}]
PROMPT;
    }

    /**
     * Parse questions from API response
     */
    protected function parseQuestionsFromResponse(string $response): array
    {
        // Clean up markdown code blocks if the AI decided to wrap the JSON
        $cleanResponse = preg_replace('/```(?:json)?|```/', '', $response);
        $cleanResponse = trim($cleanResponse);

        // Attempt 1: Direct JSON Decode (Best for JSON Object mode)
        $data = json_decode($cleanResponse, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (isset($data['questions']) && is_array($data['questions'])) {
                return $this->formatQuestions($data['questions']);
            }
            if (is_array($data) && array_is_list($data)) {
                return $this->formatQuestions($data);
            }
        }

        // Attempt 2: Fallback Regex Extraction (In case there's surrounding text)
        $jsonPattern = '/\[[\s\S]*\]/';
        if (preg_match($jsonPattern, $response, $matches)) {
            $questions = json_decode($matches[0], true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($questions)) {
                return $this->formatQuestions($questions);
            }
        }

        // Attempt 3: Truncated JSON Salvage (If max_tokens cut it off)
        // Extract all complete { ... } objects from the broken array
        preg_match_all('/\{[^{}]+\}/', $response, $objectMatches);
        if (!empty($objectMatches[0])) {
            $salvagedData = [];
            foreach ($objectMatches[0] as $jsonObj) {
                $decoded = json_decode($jsonObj, true);
                // Ensure it has at least 'q' or 'question_text' to be considered a valid question
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && (isset($decoded['q']) || isset($decoded['question_text']))) {
                    $salvagedData[] = $decoded;
                }
            }
            if (!empty($salvagedData)) {
                \Log::warning('DeepseekAIService: JSON was truncated, but salvaged ' . count($salvagedData) . ' valid questions.');
                return $this->formatQuestions($salvagedData);
            }
        }

        throw new \Exception('Could not parse questions from response. Raw: ' . substr($response, 0, 100));
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
     * Solve a question (or multiple questions) from a scanned image.
     * Step 1: OCR the image to extract text (via OCR.space free API)
     * Step 2: Send extracted text to DeepSeek for solving
     */
    public function solveFromImage(string $base64Image): array
    {
        try {
            set_time_limit(120);

            // ── Step 1: OCR the image ──
            \Log::info('Step 1: Running OCR on image...');
            $extractedText = $this->ocrFromBase64($base64Image);

            if (empty(trim($extractedText))) {
                throw new \Exception('Could not read any text from the image. Please try a clearer photo.');
            }

            \Log::info('OCR Success', ['text_length' => strlen($extractedText), 'preview' => substr($extractedText, 0, 100)]);

            // ── Step 2: Solve with DeepSeek ──
            \Log::info('Step 2: Solving with DeepSeek...');

            $prompt = <<<PROMPT
The student took a photo of an exam paper or question sheet. Here is the text extracted via OCR:

"{$extractedText}"

Your job:
1. Identify ALL questions or sub-questions (e.g., 1a, 1b, Question 2, c, d) present in the text.
2. Solve EVERY single one of them accurately and step-by-step.
3. Handle both Math/Science and General Theory questions.
   - For Math: Use proper Unicode math symbols (e.g. x², √x, ∫, π, θ). NEVER use raw caret notation like x^2.
   - For Theory: Give clear, academic, yet simple explanations.

RULES:
- If a question has sub-parts (a, b, c), treat them as separate items in the list.
- Reconstruct mangled OCR text intelligently (e.g., "dy dx" -> "dy/dx").
- Use ultra-simple English.

Return JSON only in this format:
{
  "results": [
    {
      "question": "reconstructed question text",
      "topic": "subject area",
      "solution": "final answer",
      "steps": ["step 1...", "step 2..."]
    },
    ...
  ]
}
PROMPT;

            $response = $this->client->post(
                $this->baseUrl . '/chat/completions',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'timeout' => 120,
                    'json' => [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'You are a world-class tutor solving exam papers. Return only JSON.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],
                        'temperature' => 0.3,
                        'max_tokens' => 3000, // Increased for multiple solutions
                        'response_format' => ['type' => 'json_object'],
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new \Exception('Invalid response from Deepseek API');
            }

            $content = $data['choices'][0]['message']['content'];
            $decoded = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $content = preg_replace('/```(?:json)?|```/', '', $content);
                $decoded = json_decode(trim($content), true);
            }

            if (!is_array($decoded) || !isset($decoded['results'])) {
                throw new \Exception('AI returned invalid JSON structure for multi-scan');
            }

            return $decoded;

        } catch (RequestException $e) {
            \Log::error('Scan Solve API Error: ' . $e->getMessage());
            throw new \Exception('Failed to solve question: ' . $e->getMessage());
        } catch (\Exception $e) {
            \Log::error('Scan Solve Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * OCR: Extract text from a base64-encoded image using OCR.space (Engine 2 for Math)
     */
    protected function ocrFromBase64(string $base64Image): string
    {
        // Try Engine 2 (Math-focused) first, with a shorter strict timeout
        try {
            $ocrClient = new Client(['timeout' => 15]);
            $response = $ocrClient->post('https://api.ocr.space/parse/image', [
                'headers' => [
                    'apikey' => 'helloworld', // Free tier public key
                ],
                'multipart' => [
                    [
                        'name' => 'base64Image',
                        'contents' => 'data:image/jpeg;base64,' . $base64Image,
                    ],
                    [
                        'name' => 'language',
                        'contents' => 'eng',
                    ],
                    [
                        'name' => 'isOverlayRequired',
                        'contents' => 'false',
                    ],
                    [
                        'name' => 'OCREngine',
                        'contents' => '2', // Engine 2 is gold for math/handwriting
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['ParsedResults'][0]['ParsedText'])) {
                return trim($data['ParsedResults'][0]['ParsedText']);
            }
        } catch (\Exception $e) {
            \Log::warning('OCR.space Engine 2 Timeout/Error, falling back to Engine 1: ' . $e->getMessage());
        }

        // Fallback to Engine 1 (Standard) if Engine 2 timed out or failed
        try {
            $fallbackClient = new Client(['timeout' => 10]);
            $response = $fallbackClient->post('https://api.ocr.space/parse/image', [
                'headers' => [
                    'apikey' => 'helloworld',
                ],
                'multipart' => [
                    [
                        'name' => 'base64Image',
                        'contents' => 'data:image/jpeg;base64,' . $base64Image,
                    ],
                    [
                        'name' => 'language',
                        'contents' => 'eng',
                    ],
                    [
                        'name' => 'isOverlayRequired',
                        'contents' => 'false',
                    ],
                    [
                        'name' => 'OCREngine',
                        'contents' => '1', // Engine 1 is faster but slightly less accurate for math
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['ParsedResults'][0]['ParsedText'])) {
                return trim($data['ParsedResults'][0]['ParsedText']);
            }

            if (isset($data['ErrorMessage'])) {
                \Log::error('OCR.space Error (Engine 1 Fallback): ' . implode(', ', (array) $data['ErrorMessage']));
            }
        } catch (\Exception $e) {
            \Log::error('OCR.space Engine 1 Fallback Exception: ' . $e->getMessage());
        }

        return '';
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
