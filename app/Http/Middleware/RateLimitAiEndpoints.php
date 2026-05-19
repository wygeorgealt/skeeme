<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RateLimitAiEndpoints
{
    /**
     * Handle an incoming request.
     */
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $endpoint = $this->getEndpoint($request);
        if ($endpoint === 'other') {
            return $next($request);
        }

        $cacheKey = "rate_limit:{$user->id}:{$endpoint}";

        $limits = [
            'scan' => 10,
            'quiz' => 5,
            'flashcard' => 3,
        ];

        $currentValue = Cache::get($cacheKey, 0);

        if ($currentValue >= ($limits[$endpoint] ?? 10)) {
            Log::warning('AI rate limit exceeded for user', [
                'user_id' => $user->id,
                'endpoint' => $endpoint,
                'limit' => $limits[$endpoint] ?? 10
            ]);
            return response()->json(['message' => 'Rate limit exceeded. Please wait a minute before making another request.'], 429);
        }

        Cache::put($cacheKey, $currentValue + 1, 60);

        return $next($request);
    }

    /**
     * Map request path to endpoint type.
     */
    private function getEndpoint($request): string
    {
        $path = $request->path();
        if (str_contains($path, 'scan') || str_contains($path, 'solve')) {
            return 'scan';
        }
        if (str_contains($path, 'quiz')) {
            return 'quiz';
        }
        if (str_contains($path, 'flashcard') || str_contains($path, 'deck')) {
            return 'flashcard';
        }
        return 'other';
    }
}
