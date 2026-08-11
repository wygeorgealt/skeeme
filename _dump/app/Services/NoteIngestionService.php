<?php

namespace App\Services;

use App\Models\Note;
use App\Models\VectorStoreEntry;
use Illuminate\Support\Facades\Log;

class NoteIngestionService
{
    /**
     * Main method to ingest a note:
     * - extract text from file (OCR)
     * - embed the extracted text via DeepSeek API
     * - store vector in VectorStoreEntry
     * - update Note ingestion status
     *
     * @param Note $note
     * @return bool success
     */
    public function ingestNote(Note $note)
    {
        try {
            // Extract text from the uploaded note file (OCR)
            $text = $this->extractTextFromFile($note->file_path);

            if (empty($text)) {
                Log::warning("No text extracted during OCR for Note ID: {$note->id}");
                $note->update([
                    'embedding_status' => 'failed',
                    'text_content' => null,
                    'ingested_at' => now(),
                ]);
                return false;
            }

            // Save extracted text to note
            $note->update([
                'text_content' => $text,
                'embedding_status' => 'processing',
            ]);

            // Query DeepSeek API to get embedding vector
            $embedding = $this->embedText($text);

            if (empty($embedding)) {
                Log::warning("DeepSeek embedding failed for Note ID: {$note->id}");
                $note->update([
                    'embedding_status' => 'failed',
                    'ingested_at' => now(),
                ]);
                return false;
            }

            // Store embedding vector in vector store table
            $this->storeVectorEntry($note->id, $embedding, [
                'note_title' => $note->title,
                'course_id' => $note->course_id,
            ]);

            // Update ingestion status as successful
            $note->update([
                'embedding_status' => 'completed',
                'ingested_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Note ingestion failed for Note ID: {$note->id} - " . $e->getMessage());
            $note->update([
                'embedding_status' => 'failed',
                'ingested_at' => now(),
            ]);
            return false;
        }
    }

    /**
     * Extract text from file - placeholder for OCR implementation.
     * Replace with actual OCR library/integration.
     *
     * @param string $filePath
     * @return string Extracted text
     */
    protected function extractTextFromFile(string $filePath): string
    {
        // TODO: Implement OCR logic here
        // For now, simulate with returning dummy text or file content

        // Example: read file contents if text file
        $fullPath = storage_path('app/public/' . $filePath);
        if (file_exists($fullPath)) {
            return file_get_contents($fullPath);
        }

        return '';
    }

    /**
     * Call DeepSeek API to embed given text.
     * Placeholder for API integration.
     *
     * @param string $text
     * @return array|null Embedding vector array or null on failure
     */
    protected function embedText(string $text): ?array
    {
        // TODO: Implement actual DeepSeek API call here
        // For now, simulate with random fixed-size vector

        $vectorSize = 512;
        $embedding = array_fill(0, $vectorSize, 0.01);

        return $embedding;
    }

    /**
     * Store vector embedding entry in the database.
     *
     * @param int $noteId
     * @param array $embeddingVector
     * @param array $metadata
     * @return void
     */
    protected function storeVectorEntry(int $noteId, array $embeddingVector, array $metadata = [])
    {
        VectorStoreEntry::updateOrCreate(
            ['note_id' => $noteId],
            [
                'vector_data' => $embeddingVector,
                'metadata' => $metadata,
            ]
        );
    }
}
