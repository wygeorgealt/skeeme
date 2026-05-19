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
            $prefs = $user->ai_preferences ?? [];

            if (!$profile && empty($prefs)) {
                return "The student is using Skeeme for general learning.";
            }

            $context = "--- STUDENT PERSONALIZATION PROFILE ---\n";
            
            // Academic / Education Level
            $academicLevel = $profile->academic_level ?? $prefs['education_level'] ?? 'Not specified';
            $levelMap = [
                'high_school' => 'High School',
                'undergraduate' => 'Undergraduate',
                'masters' => 'Masters / Graduate',
                'professional' => 'Professional'
            ];
            $context .= "Academic Level: " . ($levelMap[$academicLevel] ?? $academicLevel) . "\n";
            
            // Learning Style
            $learningStyle = $profile->learning_style ?? $prefs['learning_style'] ?? 'General';
            $styleMap = [
                'simple' => 'Simple & Easy (no jargon, simplified analogies)',
                'detailed' => 'Detailed (in-depth academic breakdown)'
            ];
            $context .= "Learning Style: " . ($styleMap[$learningStyle] ?? $learningStyle) . "\n";
            
            // Field of Study
            $fieldOfStudy = $prefs['field_of_study'] ?? null;
            if ($fieldOfStudy) {
                $context .= "Field of Study: " . $fieldOfStudy . "\n";
            }

            // AI Tutor Tone / Personality
            $tone = $prefs['tone'] ?? 'supportive';
            $toneMap = [
                'supportive' => 'Supportive Cheerleader: extremely warm, encouraging, motivational, celebrates wins and softens wrong answers with kindness.',
                'strict' => 'Strict Academic Coach: formal, rigorous, highly precise, acts like an elite university professor.',
                'concise' => 'Concise: extremely direct, minimal conversational fluff, gets straight to the point.',
                'fun' => 'Fun & Humorous: witty, lighthearted, uses pop-culture references and keeping it highly engaging.'
            ];
            $context .= "Preferred Tutor Personality: " . ($toneMap[$tone] ?? $tone) . "\n";

            // Explanation Analogy Focus
            $analogy = $prefs['analogy_focus'] ?? 'general';
            $analogyMap = [
                'general' => 'General Academic: Standard, classic illustrations.',
                'tech' => 'Tech & Coding: Illustrate abstract concepts using computers, coding, software, or hardware analogies.',
                'sports' => 'Sports & Athletics: Illustrate abstract concepts using soccer, fitness, force, or athletic dynamics.',
                'gaming' => 'Gaming & Anime: Illustrate abstract concepts using video games, leveling up, RPG mechanics, game lore, and fantasy logic.',
                'pop_culture' => 'Daily Life & Business: Illustrate abstract concepts using coffee shops, cooking, grocery store economics, or business models.'
            ];
            $context .= "Explanation Analogy Style: " . ($analogyMap[$analogy] ?? $analogy) . "\n";

            // Academic Goal / Focus
            $goal = $prefs['academic_goal'] ?? 'conceptual';
            $goalMap = [
                'conceptual' => 'Deep Conceptual: Focus on foundational principles, first-principles logic, and the core "why".',
                'exam' => 'Exam Drill: Focus on test tactics, high-yield facts, common test traps, step-by-step mark-scoring strategies.',
                'cheat' => 'Cheat-sheet: Focus on concise summaries, memory mnemonics, quick formulas, and active recall tables.'
            ];
            $context .= "Study Goal: " . ($goalMap[$goal] ?? $goal) . "\n";

            // Custom Weakness / Instruction
            $customWeakness = $prefs['custom_weakness'] ?? null;
            if ($customWeakness) {
                $context .= "Student Custom Learning Weakness / Instructions: " . $customWeakness . "\n";
            }

            if ($profile) {
                if ($profile->strengths) $context .= "Strengths: " . $profile->strengths . "\n";
                if ($profile->weaknesses) $context .= "Weaknesses: " . $profile->weaknesses . "\n";
                if ($profile->interests) $context .= "Interests: " . $profile->interests . "\n";
            }
            
            $context .= "--- END PROFILE ---\n";
            $context .= "INSTRUCTIONS: You MUST strictly adopt the Preferred Tutor Personality and adopt the designated Explanation Analogy Style. When explaining difficult concepts or solving problems, tailor the analogies to match the analogy focus. Modify the depth of content to fulfill the Study Goal. Keep explanations aligned with the Learning Style and Academic Level. If custom weaknesses are specified, address them carefully and clearly.";

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

