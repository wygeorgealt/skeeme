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
    protected $model = 'claude-haiku-4-5-20251001';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
        $this->client = new Client([
            'timeout' => 300, // Matching the "Ultra" timeout for Skeeme
            'connect_timeout' => 15,
        ]);
    }

    /**
     * Generate questions using Claude 4.5 Haiku
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
            
            $cacheKey = $this->generateCacheKey('q', $notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals);
            if (Cache::has($cacheKey)) {
                if ($progressCallback) $progressCallback(100);
                return Cache::get($cacheKey);
            }
            
            if ($progressCallback) $progressCallback(30);

            $optimizedPrompt = $this->buildOptimizedPrompt($notes, $numberOfQuestions, $difficulty, $questionTypes, $prompt, $includeVisuals, $aiPreferences);

            if ($progressCallback) $progressCallback(50);
            
            $response = $this->client->post($this->baseUrl, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => $this->version,
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => 8192,
                    'system' => "You are a quiz generator. Return ONLY raw JSON matching the requested schema. No conversational text.",
                    'messages' => [
                        ['role' => 'user', 'content' => $optimizedPrompt]
                    ],
                    'temperature' => 0.5,
                ],
            ]);

            if ($progressCallback) $progressCallback(80);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '';
            
            $questions = $this->parseQuestionsFromResponse($content);

            if ($progressCallback) $progressCallback(95);

            Cache::put($cacheKey, $questions, now()->addHours(24));
            
            return $questions;
        } catch (RequestException $e) {
            \Log::error('Anthropic API Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate questions: ' . $e->getMessage());
        }
    }

    /**
     * Generate Flashcards
     */
    public function generateFlashcards(
        array $notes,
        int $numberOfCards,
        string $difficulty = 'mixed',
        string $prompt = '',
        ?callable $progressCallback = null
    ): array {
        try {
            set_time_limit(300);
            if ($progressCallback) $progressCallback(10);

            $notesText = implode("\n", $notes);
            $systemPrompt = "You are an expert tutor creating flashcards. Return ONLY raw JSON array: [{\"front\": \"...\", \"back\": \"...\"}]";
            $userPrompt = "Generate EXACTLY {$numberOfCards} flashcards from this content: \n\n {$notesText} \n\n Additional context: {$prompt}";

            $response = $this->client->post($this->baseUrl, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => $this->version,
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => 4096,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $userPrompt]],
                    'temperature' => 0.7,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '[]';
            
            // Basic cleanup for JSON
            $content = preg_replace('/```(?:json)?|```/', '', $content);
            $decoded = json_decode(trim($content), true);

            return is_array($decoded) ? $decoded : [];
        } catch (\Exception $e) {
            \Log::error('Anthropic Flashcard Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate generic text
     */
    public function generateText(string $prompt, string $systemPrompt = "You are a helpful assistant."): string
    {
        try {
            $response = $this->client->post($this->baseUrl, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => $this->version,
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => 4096,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            return $data['content'][0]['text'] ?? "Error generating response.";
        } catch (\Exception $e) {
            \Log::error('Anthropic Text Error: ' . $e->getMessage());
            return "I'm having trouble connecting to Claude right now.";
        }
    }

    /**
     * Translate text using Claude 4.5 Haiku
     */
    public function translateText(string $text, string $targetLanguage): string
    {
        try {
            $systemPrompt = "You are a professional translator. Translate the provided text to {$targetLanguage}. Return ONLY the translated text.";
            
            $response = $this->client->post($this->baseUrl, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => $this->version,
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => 4096,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $text]],
                    'temperature' => 0.3,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            return $data['content'][0]['text'] ?? $text;
        } catch (\Exception $e) {
            \Log::error('Claude Translation Error: ' . $e->getMessage());
            return $text; // Fallback to original text
        }
    }

    /**
     * Grade a theory/essay answer using Claude 4.5 Haiku
     */
    public function gradeTheoryAnswer(
        string $questionText,
        string $studentAnswer,
        string $modelAnswer = '',
        array $rubric = [],
        float $maxMarks = 10.0
    ): array {
        try {
            $systemPrompt = "You are an expert academic examiner. Grade the student's answer fairly but strictly. Return ONLY JSON.";
            $prompt = "QUESTION: {$questionText}\nMODEL ANSWER: {$modelAnswer}\nSTUDENT ANSWER: {$studentAnswer}\nMAX MARKS: {$maxMarks}\n\nSchema: {\"marks\": float, \"feedback\": \"string\", \"analysis\": \"string\"}";

            $response = $this->client->post($this->baseUrl, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => $this->version,
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => 1024,
                    'system' => $systemPrompt,
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'temperature' => 0.3,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '{}';
            $decoded = json_decode(trim(preg_replace('/```(?:json)?|```/', '', $content)), true);

            return [
                'marks' => (float) ($decoded['marks'] ?? 0),
                'ai_feedback' => $decoded['feedback'] ?? '',
                'analysis' => $decoded['analysis'] ?? '',
            ];
        } catch (\Exception $e) {
            \Log::error('Claude Grading Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Solve a question from a scanned image (Multi-step optimization)
     */
    public function solveFromImage(string $base64Image): array
    {
        // For vision tasks, we use Claude 4.5 Sonnet if available, or just Sonar/Vision.
        // But Claude 4.5 Haiku doesn't support vision in the same way via messages API with base64 yet (it does, but needs specific format).
        // Actually, Claude 4.5 Haiku DOES support vision.
        try {
            set_time_limit(300);
            
            $response = $this->client->post($this->baseUrl, [
                'headers' => [
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => $this->version,
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => 4096,
                    'system' => "You are a world-class tutor. Solve the questions in the image. Return ONLY JSON.",
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'image',
                                    'source' => [
                                        'type' => 'base64',
                                        'media_type' => 'image/jpeg',
                                        'data' => $this->cleanBase64($base64Image),
                                    ],
                                ],
                                [
                                    'type' => 'text',
                                    'text' => "Identify all questions and solve them. Format: {\"results\": [{\"question\": \"...\", \"solution\": \"...\", \"steps\": []}]}",
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $content = $data['content'][0]['text'] ?? '{}';
            return json_decode(trim(preg_replace('/```(?:json)?|```/', '', $content)), true) ?? ['results' => []];
        } catch (\Exception $e) {
            \Log::error('Claude Image Solve Error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function cleanBase64(string $base64): string
    {
        return preg_replace('/^data:image\/(png|jpeg|jpg);base64,/', '', $base64);
    }

    protected function generateCacheKey(string $type, ...$params): string
    {
        return "skeeme:claude:{$type}:" . substr(md5(json_encode($params)), 0, 16);
    }

    protected function buildOptimizedPrompt(array $notes, int $count, string $diff, array $types, string $userPrompt, bool $visuals, ?array $prefs): string
    {
        $notesText = implode(" ", $notes);
        $typesText = implode("/", $types);
        
        return "Gen EXACTLY {$count} questions. Types: {$typesText}. Diff: {$diff}.
Material: {$notesText}
Context: {$userPrompt}
Schema: [{\"q\":\"text\",\"t\":\"MC|TF|SA|ES|FB\",\"d\":\"E|M|H\",\"o\":[\"A\",\"B\"],\"c\":\"A\",\"x\":\"why\"}]
Return ONLY the JSON array.";
    }

    protected function parseQuestionsFromResponse(string $response): array
    {
        $clean = preg_replace('/```(?:json)?|```/', '', $response);
        $decoded = json_decode(trim($clean), true);
        
        if (!is_array($decoded)) return [];

        // Formatting logic similar to DeepseekAIService
        $typeMap = ['MC' => 'multiple_choice', 'TF' => 'true_false', 'SA' => 'short_answer', 'ES' => 'essay', 'FB' => 'fill_blank'];
        
        return array_map(function ($q) use ($typeMap) {
            return [
                'question_text' => $q['q'] ?? '',
                'question_type' => $typeMap[$q['t'] ?? 'MC'] ?? 'multiple_choice',
                'difficulty_level' => $q['d'] ?? 'medium',
                'explanation' => $q['x'] ?? '',
                'options' => $q['o'] ?? [],
                'correct_answer' => $q['c'] ?? '',
            ];
        }, $decoded);
    }
}
