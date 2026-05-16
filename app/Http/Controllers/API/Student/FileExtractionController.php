<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FileExtractionService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class FileExtractionController extends Controller
{
    protected $extractionService;

    public function __construct(FileExtractionService $extractionService)
    {
        $this->extractionService = $extractionService;
    }

    public function extract(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx,txt,md|max:10240',
            'type' => 'required|in:quiz,flashcard',
        ]);

        $user = Auth::user();
        $file = $request->file('file');
        $type = $request->input('type');

        try {
            // 1. Extract text
            $tempPath = $file->getRealPath();
            $sourceContent = $this->extractionService->extractText($tempPath, $file->getClientOriginalExtension());
            
            if (!$sourceContent || empty(trim($sourceContent))) {
                return response()->json(['message' => 'Could not extract text from the uploaded file. Please ensure it is a text-based document.'], 400);
            }

            // 2. Upload to R2 for persistent storage
            $safeName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $storagePath = 'student-uploads/' . ($type === 'quiz' ? 'quizzes' : 'flashcards') . '/' . $user->id;
            $r2Path = $file->storeAs($storagePath, $safeName, config('filesystems.default'));

            // 3. Cache extracted text
            $extractionId = (string) Str::uuid();
            // Cache for 24 hours
            Cache::put("extraction_{$extractionId}", [
                'text' => $sourceContent,
                'r2_path' => $r2Path,
                'original_name' => $file->getClientOriginalName()
            ], now()->addHours(24));

            return response()->json([
                'extraction_id' => $extractionId,
                'status' => 'ready'
            ]);

        } catch (\Exception $e) {
            Log::error("FileExtractionController Error: " . $e->getMessage());
            return response()->json(['message' => 'Failed to process document.'], 500);
        }
    }
}
