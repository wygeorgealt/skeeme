<?php

namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileExtractionService
{
    protected $visionService;

    public function __construct(GoogleVisionService $visionService)
    {
        $this->visionService = $visionService;
    }
    /**
     * Extract text from a file based on its extension.
     *
     * @param string $filePath Absolute path or path relative to storage/app/public
     * @param string|null $originalExtension Optional original extension (useful for .tmp uploads)
     * @return string|null Extracted text or null on failure
     */
    public function extractText(string $filePath, ?string $originalExtension = null): ?string
    {
        if (!file_exists($filePath)) {
            Log::error("FileExtractionService: File not found at {$filePath}");
            return null;
        }

        $extension = $originalExtension 
            ? strtolower($originalExtension) 
            : strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        // Strip leading dot if accidentally provided
        $extension = ltrim($extension, '.');

        try {
            $text = match ($extension) {
                'pdf' => $this->extractFromPdf($filePath),
                'docx' => $this->extractFromDocx($filePath),
                'doc' => $this->extractFromDocx($filePath), 
                'txt', 'md' => file_get_contents($filePath),
                default => null,
            };

            // OCR Fallback: If text is extremely short (scanned PDF or diagram-heavy medicine notes)
            if ($extension === 'pdf' && (empty($text) || strlen(trim($text)) < 150)) {
                Log::info("Sparse text detected in PDF ({$extension}), attempting Google Vision OCR fallback...");
                $ocrResult = $this->visionService->ocrPdf($filePath);
                if ($ocrResult['success']) {
                    $text = $ocrResult['text'];
                    Log::info("OCR Fallback Successful.");
                } else {
                    Log::warning("OCR Fallback Failed: " . ($ocrResult['error'] ?? 'Unknown error'));
                }
            }

            return $text ? $this->sanitizeUtf8($text) : null;
        } catch (\Exception $e) {
            Log::error("FileExtractionService: Error extracting {$extension} file: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract text from PDF using PDFParser
     */
    protected function extractFromPdf(string $filePath): string
    {
        $parser = new PdfParser();
        $pdf = $parser->parseFile($filePath);
        return $pdf->getText();
    }

    /**
     * Extract text from DOCX using PHPWord
     */
    protected function extractFromDocx(string $filePath): string
    {
        $phpWord = WordIOFactory::load($filePath);
        $text = '';
        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . " ";
                } elseif (method_exists($element, 'getElements')) {
                    // Handle nested elements like tables or lists if necessary
                    $text .= $this->extractNestedText($element);
                }
            }
        }
        return $text;
    }

    /**
     * Helper to extract text from nested PHPWord elements
     */
    protected function extractNestedText($container): string
    {
        $text = '';
        foreach ($container->getElements() as $element) {
            if (method_exists($element, 'getText')) {
                $text .= $element->getText() . " ";
            } elseif (method_exists($element, 'getElements')) {
                $text .= $this->extractNestedText($element);
            }
        }
        return $text;
    }

    /**
     * Sanitize text to ensure it is valid UTF-8 and clean.
     */
    private function sanitizeUtf8(string $text): string
    {
        // Remove invalid UTF-8 sequences
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        
        // Remove non-printable control characters except standard whitespace
        $text = preg_replace('/[^\x20-\x7E\t\n\r\x{00A0}-\x{FFFF}]/u', '', $text);
        
        return trim($text);
    }
}
