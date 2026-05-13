<?php

namespace App\Services;

use Google\Cloud\DocumentAI\V1\Client\DocumentProcessorServiceClient;
use Google\Cloud\DocumentAI\V1\ProcessRequest;
use Google\Cloud\DocumentAI\V1\RawDocument;
use Illuminate\Support\Facades\Log;

class GoogleDocumentAIService
{
    protected $projectId;
    protected $location;
    protected $processorId;
    protected $credentialsPath;
    protected $credentialsRaw;

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
    protected function getMimeType(string $filePath): string
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        return match ($extension) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'tiff' => 'image/tiff',
            default => 'application/octet-stream',
        };
    }
}
