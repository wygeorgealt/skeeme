<?php

namespace App\Services;

use App\Models\User;
use App\Services\DeepseekAIService;
use Illuminate\Support\Facades\Cache;

class UserPersonalizationService
{
    /**
     * Build a system prompt context for the user.
     * Caches the result for 1 hour to minimize DB hits.
     */
    public function getSystemContext(User $user): string
    {
        return Cache::remember("user_ai_context_{$user->id}", 3600, function () use ($user) {
            $prefs = $user->ai_preferences ?? [];

            if (empty($prefs)) {
                return "The student is using Skeeme for general learning.";
            }

            if (!empty($prefs['summary'])) {
                $context = "--- STUDENT PERSONALIZATION PROFILE ---\n";
                $context .= $prefs['summary'] . "\n";
                $context .= "--- END PROFILE ---\n";
                $context .= "INSTRUCTIONS: You MUST strictly act as the tutor described in the student profile above. Adopt the requested tone, tailor analogies to match the analogy focus, and modify the depth of content to fulfill the study goal. Keep explanations aligned with the student's learning style and academic level. If custom weaknesses are specified, address them carefully and clearly.";
                return $context;
            }

            return "The student is using Skeeme for general learning.";
        });
    }

    /**
     * Generate an AI summary of the user's preferences and save it.
     */
    public function generateAndSaveSummary(User $user, array $prefs): void
    {
        $deepseek = app(DeepseekAIService::class);
        
        $firstName = explode(' ', trim($user->name))[0] ?: 'The student';
        $prompt = "Create a concise, warm, and friendly 1-2 paragraph AI tutor persona profile for a student named {$firstName} based on these settings:\n\n";
        $prompt .= json_encode($prefs, JSON_PRETTY_PRINT);
        
        $systemPrompt = "You are a prompt engineer writing a friendly persona profile. Write it in the third person. Make it warm and conversational. E.g., '{$firstName} is a high school student who prefers concise topics but learns math a bit slower. The tutor should adopt a supportive approach and use fun gaming analogies to explain concepts.' Keep it to 1-2 short paragraphs. Do not include markdown formatting or extra conversational text.";
        
        try {
            $summary = $deepseek->generateText($prompt, $systemPrompt);
            
            $prefs['summary'] = trim($summary);
            $user->ai_preferences = $prefs;
            $user->save();
            
            $this->clearCache($user);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to generate AI preference summary: " . $e->getMessage());
        }
    }

    /**
     * Clear the personalization cache (call when profile updated)
     */
    public function clearCache(User $user): void
    {
        Cache::forget("user_ai_context_{$user->id}");
    }
}

