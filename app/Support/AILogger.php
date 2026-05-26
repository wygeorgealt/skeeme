<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AILogger
{
    /**
     * Log a detailed AI generation/personalization event.
     *
     * @param array $data Log context details:
     *                    - provider (string): e.g. 'anthropic' or 'deepseek'
     *                    - model (string): e.g. 'claude-sonnet-4-6', 'deepseek-v4-flash'
     *                    - action (string): e.g. 'generate_questions', 'generate_flashcards', 'solve_from_image'
     *                    - request (array): detailed request parameters (notes length, prompt preview, etc.)
     *                    - response (array): detailed response info (tokens, count of output items, etc.)
     *                    - latency_ms (float): elapsed time in milliseconds
     *                    - cache (array): cache info like ['status' => 'hit'|'miss', 'key' => '...']
     *                    - error (string|array|\Exception): error or exception detail
     * @param mixed $user Optional User model or User ID (for background queues). If omitted, falls back to Auth::user().
     */
    public static function log(array $data, $user = null): void
    {
        // Resolve user if possible
        if (!$user) {
            $user = Auth::user();
        } elseif (is_numeric($user)) {
            $user = User::find($user);
        }

        $userInfo = null;
        $personalizationProfile = null;

        if ($user instanceof User) {
            $userInfo = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ];

            // Extract personalization preferences
            $prefs = $user->ai_preferences ?? [];
            $profile = $user->aiProfile;

            if ($profile || !empty($prefs)) {
                $personalizationProfile = [
                    'academic_level' => $profile->academic_level ?? $prefs['education_level'] ?? null,
                    'learning_style' => $profile->learning_style ?? $prefs['learning_style'] ?? null,
                    'field_of_study' => $prefs['field_of_study'] ?? null,
                    'tone' => $prefs['tone'] ?? null,
                    'analogy_focus' => $prefs['analogy_focus'] ?? null,
                    'academic_goal' => $prefs['academic_goal'] ?? null,
                    'custom_weakness' => $prefs['custom_weakness'] ?? null,
                ];
            }
        }

        // Standardized logging schema
        $logPayload = [
            'timestamp' => now()->toIso8601String(),
            'provider' => $data['provider'] ?? 'unknown',
            'model' => $data['model'] ?? 'unknown',
            'action' => $data['action'] ?? 'unknown',
            'user' => $userInfo,
            'personalization' => [
                'applied' => !empty($personalizationProfile),
                'profile' => $personalizationProfile,
            ],
            'cache' => $data['cache'] ?? null,
            'request' => $data['request'] ?? [],
            'response' => array_merge([
                'latency_ms' => $data['latency_ms'] ?? null,
                'status' => isset($data['error']) ? 'failed' : 'success',
            ], $data['response'] ?? []),
        ];

        // Format and append error trace
        if (isset($data['error'])) {
            $error = $data['error'];
            if ($error instanceof \Exception) {
                $logPayload['error'] = [
                    'message' => $error->getMessage(),
                    'code' => $error->getCode(),
                    'file' => $error->getFile(),
                    'line' => $error->getLine(),
                    'trace' => substr($error->getTraceAsString(), 0, 1000), // Cap trace length
                ];
            } elseif (is_array($error) || is_string($error)) {
                $logPayload['error'] = $error;
            } else {
                $logPayload['error'] = (string) $error;
            }

            Log::channel('ai')->error("AI Action Failed: {$logPayload['action']} (Provider: {$logPayload['provider']})", $logPayload);
        } else {
            Log::channel('ai')->info("AI Action Succeeded: {$logPayload['action']} (Provider: {$logPayload['provider']})", $logPayload);
        }
    }
}
