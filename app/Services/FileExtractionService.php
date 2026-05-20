<?php

namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileExtractionService
{
    protected GoogleVisionService $visionService;
    protected GoogleDocumentAIService $docAiService;

    public function __construct(GoogleVisionService $visionService, GoogleDocumentAIService $docAiService)
    {
        $this->visionService = $visionService;
        $this->docAiService = $docAiService;
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
                'pdf' => $this->shouldUseDocumentAiForPdf($filePath)
                    ? $this->docAiService->processDocument($filePath) ?? $this->extractFromPdf($filePath)
                    : $this->extractFromPdf($filePath),
                'docx', 'doc' => $this->extractFromDocx($filePath),
                'txt', 'md' => file_get_contents($filePath),
                'png', 'jpg', 'jpeg' => $this->docAiService->processDocument($filePath) ?? $this->visionService->ocr(base64_encode(file_get_contents($filePath)))['text'],
                default => null,
            };

            // OCR Fallback: If text is extremely short or Document AI failed
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
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            return $pdf->getText();
        } catch (\Exception $e) {
            Log::warning("FileExtractionService: PDFParser failed (" . $e->getMessage() . "), falling back to OCR if available.");
            return "";
        }
    }

    /**
     * Only use Document AI for PDFs within the page limit.
     */
    protected function shouldUseDocumentAiForPdf(string $filePath): bool
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            $pageCount = count($pdf->getPages());
            if ($pageCount > 30) {
                Log::info("FileExtractionService: PDF page count {$pageCount} exceeds Document AI limit, using fallback extraction.");
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::warning("FileExtractionService: Failed to count PDF pages ({$e->getMessage()}), avoiding Document AI.");
            return false;
        }
    }

    /**
     * Extract text from DOCX using PHPWord
     */
    protected function extractFromDocx(string $filePath): string
    {
        $useErrors = libxml_use_internal_errors(true);
        $phpWord = null;
        try {
            $phpWord = WordIOFactory::load($filePath);
        } catch (\Exception $e) {
            Log::warning("FileExtractionService: PHPWord failed to load DOCX (" . $e->getMessage() . "), using ZipArchive fallback.");
            return $this->extractDocxTextFallback($filePath);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($useErrors);
        }

        $text = '';
        if ($phpWord) {
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
        }
        return $text;
    }

    /**
     * Fallback to extract text directly from DOCX XML if PHPWord fails.
     */
    protected function extractDocxTextFallback(string $filePath): string
    {
        $text = '';
        $zip = new \ZipArchive();
        if ($zip->open($filePath) === true) {
            if (($index = $zip->locateName('word/document.xml')) !== false) {
                $xml = $zip->getFromIndex($index);
                // Ensure spaces between paragraphs
                $xml = str_replace('</w:p>', " </w:p>\n", $xml);
                // Replace tabs
                $xml = str_replace('<w:tab/>', "\t", $xml);
                $text = strip_tags($xml);
            }
            $zip->close();
        } else {
            Log::error("FileExtractionService: ZipArchive failed to open DOCX at {$filePath}");
        }
        return $text;
    }

    /**
     * Helper to extract text from nested PHPWord elements
     */
    protected function extractNestedText(object $container): string
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
