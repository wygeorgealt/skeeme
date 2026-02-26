<?php

namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileExtractionService
{
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
            return match ($extension) {
                'pdf' => $this->extractFromPdf($filePath),
                'docx' => $this->extractFromDocx($filePath),
                'doc' => $this->extractFromDocx($filePath), // Some older docs might work but DOCX is preferred
                'txt', 'md' => file_get_contents($filePath),
                default => null,
            };
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
}
