<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\GoogleDocumentAIService;
use Illuminate\Support\Facades\Log;

echo "--- Skeeme Google Document AI Diagnostic ---\n";

try {
    $service = app(GoogleDocumentAIService::class);
    
    echo "[1/3] Checking Config...\n";
    $projectId = config('services.google_document_ai.project_id');
    $processorId = config('services.google_document_ai.processor_id');
    
    echo "      Project ID: " . ($projectId ?: "MISSING") . "\n";
    echo "      Processor ID: " . ($processorId ?: "MISSING") . "\n";
    
    if (!$projectId || !$processorId) {
        throw new Exception("Config is incomplete. Please check your .env file.");
    }

    echo "[2/3] Validating Credentials...\n";
    $rawKey = config('services.google_document_ai.credentials_raw');
    if (!empty($rawKey)) {
        $json = json_decode($rawKey, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON Key in .env is INVALID: " . json_last_error_msg());
        }
        echo "      Success: Raw JSON key detected and valid.\n";
    } else {
        echo "      Warning: No raw JSON key found. Checking for file path...\n";
        $path = config('services.google_document_ai.credentials_json');
        if ($path && file_exists($path)) {
            echo "      Success: Found credentials file at: $path\n";
        } else {
            throw new Exception("No credentials found (Neither JSON string nor file path).");
        }
    }

    echo "[3/3] Attempting Client Initialization...\n";
    // Create a dummy file to test processing
    $tempFile = tempnam(sys_get_temp_dir(), 'test_doc');
    file_put_contents($tempFile, "Hello Skeeme Test Document");
    rename($tempFile, $tempFile . ".txt");
    $tempFile .= ".txt";

    echo "      Testing connection with a dummy text file...\n";
    $result = $service->processDocument($tempFile);
    
    @unlink($tempFile);

    if ($result !== null) {
        echo "\n✅ SUCCESS! Google Document AI returned text: \"" . trim($result) . "\"\n";
    } else {
        echo "\n❌ FAILURE: The service returned NULL. Check storage/logs/laravel.log for details.\n";
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
}

echo "-------------------------------------------\n";
