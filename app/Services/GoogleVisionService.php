<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class GoogleVisionService
{
    protected $client;
    protected $apiKey;
    protected $imagesUrl = 'https://vision.googleapis.com/v1/images:annotate';
    protected $filesUrl = 'https://vision.googleapis.com/v1/files:annotate';

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
            $response = $this->client->post($this->imagesUrl . '?key=' . $this->apiKey, [
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
    /**
     * Perform OCR on a PDF file using Google Cloud Vision API.
     * Supports up to 5 pages for synchronous requests.
     */
    public function ocrPdf(string $filePath): array
    {
        if (empty($this->apiKey)) return ['success' => false, 'error' => 'No API Key'];
        if (!file_exists($filePath)) return ['success' => false, 'error' => 'File not found'];

        try {
            $pdfContent = base64_encode(file_get_contents($filePath));
            
            $response = $this->client->post($this->filesUrl . '?key=' . $this->apiKey, [
                'json' => [
                    'requests' => [
                        [
                            'inputConfig' => [
                                'content' => $pdfContent,
                                'mimeType' => 'application/pdf',
                            ],
                            'features' => [
                                ['type' => 'DOCUMENT_TEXT_DETECTION'],
                            ],
                            'pages' => [1, 2, 3, 4, 5], // Limit to first 5 pages for sync/speed/cost
                        ],
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            
            $allText = '';
            $responses = $data['responses'][0]['responses'] ?? [];
            foreach ($responses as $pageResponse) {
                $allText .= ($pageResponse['fullTextAnnotation']['text'] ?? '') . "\n";
            }

            return [
                'success' => true,
                'text' => trim($allText),
                'raw' => $data,
            ];
        } catch (\Exception $e) {
            Log::error('Google Vision PDF Error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
