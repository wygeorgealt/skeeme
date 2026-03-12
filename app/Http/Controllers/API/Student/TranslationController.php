<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DeepseekAIService;
use Illuminate\Support\Facades\Log;

class TranslationController extends Controller
{
    protected $aiService;

    public function __construct(DeepseekAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Translate text to target language (No Credit Cost)
     */
    public function translate(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:5000',
            'target_language' => 'required|string|max:50',
        ]);

        try {
            $translatedText = $this->aiService->translateText(
                $validated['text'],
                $validated['target_language']
            );

            return response()->json([
                'success' => true,
                'original_text' => $validated['text'],
                'translated_text' => $translatedText,
                'target_language' => $validated['target_language'],
            ]);
        } catch (\Exception $e) {
            Log::error('Translation API failure: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Translation failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
