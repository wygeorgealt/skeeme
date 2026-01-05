<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class TranslationService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://api.deepseek.com/v1';
    
    protected array $supportedLanguages = [
        'en' => 'English',
        'es' => 'Spanish',
        'fr' => 'French',
        'de' => 'German',
        'pt' => 'Portuguese',
    ];

    public function __construct()
    {
        $this->apiKey = env('DEEPSEEK_API_KEY');
        $this->client = new Client([
            'timeout' => 300,
            'connect_timeout' => 10,
            'verify' => false, // Disable SSL verification for Windows
        ]);
    }

    /**
     * Generate translations for the application
     */
    public function generateTranslations(array $keys, string $targetLanguage = 'es'): array
    {
        try {
            if (!isset($this->supportedLanguages[$targetLanguage])) {
                throw new \Exception("Unsupported language: $targetLanguage");
            }

            // Check cache
            $cacheKey = "translations:{$targetLanguage}:" . hash('sha256', json_encode($keys));
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }

            // Build translation request
            $keysText = implode("\n", array_map(fn($k, $v) => "{$k}: {$v}", array_keys($keys), $keys));
            
            $prompt = <<<PROMPT
Translate the following English text to {$this->supportedLanguages[$targetLanguage]}.
Return ONLY valid JSON with the same keys. Do not add explanations or extra text.

English:
{$keysText}

Response as JSON:
PROMPT;

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
                                'content' => 'You are a professional translator. Return only valid JSON responses.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt,
                            ],
                        ],
                        'temperature' => 0.3,
                        'max_tokens' => 4000,
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['choices'][0]['message']['content'])) {
                throw new \Exception('Invalid response from Deepseek API');
            }

            $content = $data['choices'][0]['message']['content'];
            $translations = $this->parseTranslations($content);

            // Cache for 30 days
            Cache::put($cacheKey, $translations, now()->addDays(30));

            return $translations;
        } catch (RequestException $e) {
            \Log::error('Translation API Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate translations: ' . $e->getMessage());
        } catch (\Exception $e) {
            \Log::error('Translation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Parse translation response
     */
    protected function parseTranslations(string $response): array
    {
        $jsonPattern = '/\{[\s\S]*\}/';
        if (preg_match($jsonPattern, $response, $matches)) {
            $translations = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($translations)) {
                return $translations;
            }
        }

        throw new \Exception('Could not parse translations from response');
    }

    /**
     * Create language files for all supported languages
     */
    public function createLanguageFiles(array $baseTranslations): void
    {
        // Ensure language directories exist
        foreach (array_keys($this->supportedLanguages) as $lang) {
            $langPath = resource_path("lang/{$lang}");
            if (!is_dir($langPath)) {
                mkdir($langPath, 0755, true);
            }
        }

        // English is the base
        $this->createLanguageFile('en', $baseTranslations);

        // Generate translations for other languages
        foreach (array_keys($this->supportedLanguages) as $lang) {
            if ($lang !== 'en') {
                \Log::info("Generating translations for {$lang}...");
                $translations = $this->generateTranslations($baseTranslations, $lang);
                $this->createLanguageFile($lang, $translations);
            }
        }
    }

    /**
     * Extract all __() strings from Blade files and merge with existing translations
     */
    public function extractStringsFromBladeFiles(string $path = 'resources/views'): array
    {
        $extracted = [];
        $files = \Illuminate\Support\Facades\File::allFiles(base_path($path));

        foreach ($files as $file) {
            $ext = $file->getExtension();
            if ($ext !== 'blade' && $ext !== 'php') {
                continue;
            }

            $content = file_get_contents($file->getPathname());
            
            // Match __('messages.key') or __('key')
            if (preg_match_all("/__\\('(?:messages\\.)?([^']+)'\\)/", $content, $matches)) {
                foreach ($matches[1] as $string) {
                    if (!empty($string)) {
                        $extracted[$string] = $string;
                    }
                }
            }
        }

        return $extracted;
    }

    /**
     * Create individual language file
     */
    protected function createLanguageFile(string $language, array $translations): void
    {
        $path = resource_path("lang/{$language}/messages.php");
        
        $content = "<?php\n\nreturn " . var_export($translations, true) . ";\n";
        
        file_put_contents($path, $content);
        \Log::info("Created language file: {$path}");
    }

    /**
     * Get all supported languages
     */
    public function getSupportedLanguages(): array
    {
        return $this->supportedLanguages;
    }

    /**
     * Check if language file exists
     */
    public function languageFileExists(string $language): bool
    {
        return file_exists(resource_path("lang/{$language}/messages.php"));
    }
}
