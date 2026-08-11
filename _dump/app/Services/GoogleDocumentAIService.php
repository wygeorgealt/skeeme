<?php

namespace App\Services;

use Google\Cloud\DocumentAI\V1\Client\DocumentProcessorServiceClient;
use Google\Cloud\DocumentAI\V1\ProcessRequest;
use Google\Cloud\DocumentAI\V1\RawDocument;
use Illuminate\Support\Facades\Log;

class GoogleDocumentAIService
{
    protected ?string $projectId;
    protected string $location;
    protected ?string $processorId;
    protected ?string $credentialsPath;
    protected ?string $credentialsRaw;

    public function __construct()
    {
        $this->projectId = config('services.google_document_ai.project_id');
        $this->location = config('services.google_document_ai.location', 'us');
        $this->processorId = config('services.google_document_ai.processor_id');
        $this->credentialsPath = config('services.google_document_ai.credentials_json');
        $this->credentialsRaw = config('services.google_document_ai.credentials_raw');
    }

    /**
     * Process a document (PDF or Image) using Google Document AI.
     * This provides high-fidelity, layout-aware text extraction.
     */
    public function processDocument(string $filePath): ?string
    {
        if (empty($this->processorId)) {
            Log::error('GoogleDocumentAIService: Processor ID not configured.');
            return null;
        }

        try {
            $clientOptions = [
                'apiEndpoint' => "{$this->location}-documentai.googleapis.com",
            ];

            // Priority 1: Raw JSON string from Env (Best for Production/Railway)
            if (!empty($this->credentialsRaw)) {
                $clientOptions['credentials'] = json_decode($this->credentialsRaw, true);
            } 
            // Priority 2: File Path (Best for Local)
            elseif (!empty($this->credentialsPath) && file_exists($this->credentialsPath)) {
                $clientOptions['credentials'] = $this->credentialsPath;
            }

            $client = new DocumentProcessorServiceClient($clientOptions);

            // Read the file content
            $content = file_get_contents($filePath);
            $mimeType = $this->getMimeType($filePath);

            if (empty($mimeType)) {
                Log::error("GoogleDocumentAIService: Unsupported mime type for file {$filePath}");
                return null;
            }

            $rawDocument = new RawDocument([
                'content' => $content,
                'mime_type' => $mimeType,
            ]);

            $name = $client->processorName($this->projectId, $this->location, $this->processorId);

            $request = new ProcessRequest([
                'name' => $name,
                'raw_document' => $rawDocument,
            ]);

            $response = $client->processDocument($request);
            $document = $response->getDocument();

            return $document->getText();

        } catch (\Exception $e) {
            Log::error('GoogleDocumentAIService Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Helper to determine MIME type for Document AI
     */
    protected function getMimeType(string $filePath): ?string
    {
        $supportedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/tiff',
            'image/gif',
            'image/bmp',
            'image/webp',
        ];

        $mimeType = null;

        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo !== false) {
                $mimeType = finfo_file($finfo, $filePath) ?: null;
                finfo_close($finfo);
            }
        }

        if (empty($mimeType) && function_exists('mime_content_type')) {
            $mimeType = mime_content_type($filePath) ?: null;
        }

        $mimeType = $mimeType ? strtolower($mimeType) : null;

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $extension = ltrim($extension, '.');
        $extensionMimeType = match ($extension) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'tiff', 'tif' => 'image/tiff',
            'gif' => 'image/gif',
            'bmp' => 'image/bmp',
            'webp' => 'image/webp',
            default => null,
        };

        if ($mimeType && in_array($mimeType, $supportedMimeTypes, true)) {
            return $mimeType;
        }

        if ($extensionMimeType && in_array($extensionMimeType, $supportedMimeTypes, true)) {
            return $extensionMimeType;
        }

        return null;
    }
}
