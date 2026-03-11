<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class PaddleOCRService
{
    protected $client;
    protected $baseUrl;
    protected $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.paddle_ocr.url');
        $this->timeout = config('services.paddle_ocr.timeout', 30);
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => $this->timeout,
        ]);
    }

    /**
     * Perform OCR on a base64 encoded image using the PaddleOCR microservice.
     */
    public function ocr(string $base64Image): array
    {
        try {
            $response = $this->client->post('/ocr', [
                'json' => [
                    'image' => $base64Image,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'text' => $data['text'] ?? '',
                'lines' => $data['lines'] ?? [],
            ];
        } catch (RequestException $e) {
            Log::error('PaddleOCR API Connection Failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'OCR Service unreachable: ' . $e->getMessage(),
                'text' => '',
            ];
        } catch (\Exception $e) {
            Log::error('PaddleOCR Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'text' => '',
            ];
        }
    }

    /**
     * Health check for the service.
     */
    public function isHealthy(): bool
    {
        try {
            $response = $this->client->get('/health');
            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            return false;
        }
    }
}
