<?php

namespace App\Services;

use App\Models\User;
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
            $profile = $user->aiProfile;
            
            if (!$profile) {
                return "The student is using Skeeme for general learning.";
            }

            $context = "--- STUDENT PERSONALIZATION PROFILE ---\n";
            $context .= "Academic Level: " . ($profile->academic_level ?? 'Not specified') . "\n";
            $context .= "Learning Style: " . ($profile->learning_style ?? 'General') . "\n";
            
            if ($profile->strengths) $context .= "Strengths: " . $profile->strengths . "\n";
            if ($profile->weaknesses) $context .= "Weaknesses: " . $profile->weaknesses . "\n";
            if ($profile->interests) $context .= "Interests: " . $profile->interests . "\n";
            
            if ($profile->tone_preferences) {
                $tone = $profile->tone_preferences;
                $formality = ($tone['formality'] ?? 0.5) > 0.7 ? 'Formal' : (($tone['formality'] ?? 0.5) < 0.3 ? 'Casual' : 'Balanced');
                $humor = ($tone['humor'] ?? 0.2) > 0.5 ? 'Witty/Humorous' : 'Serious/Direct';
                $context .= "Preferred Tone: {$formality}, {$humor}\n";
            }

            if ($profile->custom_context) {
                $context .= "Additional Context: " . $profile->custom_context . "\n";
            }
            
            $context .= "--- END PROFILE ---\n";
            $context .= "INSTRUCTIONS: Use this profile to tailor your explanations, examples, and tone. If the student has specific weaknesses, be extra clear and step-by-step in those areas. If they have interests, use them for analogies where appropriate.\n";

            return $context;
        });
    }

    /**
     * Clear the personalization cache (call when profile updated)
     */
    public function clearCache(User $user): void
    {
        Cache::forget("user_ai_context_{$user->id}");
    }
}
