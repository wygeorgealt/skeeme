<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class GoogleVisionService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://vision.googleapis.com/v1/images:annotate';

    public function __construct()
    {
        $this->apiKey = config('services.google_vision.api_key');
        $this->client = new Client([
            'timeout' => 30,
        ]);
    }

    /**
     * Perform OCR on a base64 encoded image using Google Cloud Vision API.
     * Uses DOCUMENT_TEXT_DETECTION for better layout and math support.
     */
    public function ocr(string $base64Image): array
    {
        if (empty($this->apiKey)) {
            Log::error('Google Cloud Vision API Key is missing.');
            return [
                'success' => false,
                'error' => 'API Key not configured.',
                'text' => '',
            ];
        }

        try {
            $response = $this->client->post($this->baseUrl . '?key=' . $this->apiKey, [
                'json' => [
                    'requests' => [
                        [
                            'image' => [
                                'content' => $base64Image,
                            ],
                            'features' => [
                                [
                                    'type' => 'DOCUMENT_TEXT_DETECTION',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            
            // Extract full text from the response
            $fullText = $data['responses'][0]['fullTextAnnotation']['text'] ?? '';

            return [
                'success' => true,
                'text' => $fullText,
                'raw' => $data,
            ];
        } catch (RequestException $e) {
            Log::error('Google Vision API Connection Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Vision API unreachable: ' . $e->getMessage(),
                'text' => '',
            ];
        } catch (\Exception $e) {
            Log::error('Google Vision Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'text' => '',
            ];
        }
    }
}
