<?php

namespace App\Support;

class PromptSanitizer {
    /**
     * Validate and sanitize user input for AI services
     */
    public static function sanitize(string $input): string {
        // 1. Length limit
        if (strlen($input) > 100000) {
            throw new \InvalidArgumentException('Input exceeds maximum length');
        }

        // 2. Detect jailbreak attempts
        $jailbreakPatterns = [
            '/ignore\s+all\s+previous/i',
            '/ignore\s+previous\s+instructions/i',
            '/system\s+prompt/i',
            '/forget\s+everything/i',
            '/forget\s+previous\s+instructions/i',
            '/bypass\s+restrictions/i',
            '/administrator\s+mode/i',
            '/you\s+are\s+now\s+a/i',
            '/new\s+system\s+instructions/i',
        ];

        foreach ($jailbreakPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                throw new \InvalidArgumentException('Potential jailbreak or prompt injection attempt detected.');
            }
        }

        // 3. Sanitize HTML tags to prevent XSS/injection in system prompts
        $input = strip_tags($input);

        return trim($input);
    }
}
