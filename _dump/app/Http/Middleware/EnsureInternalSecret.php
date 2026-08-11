<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureInternalSecret
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $secret = env('INTERNAL_SECRET', 'skeeme-ai-secret-key-123');

        if ($request->header('X-Internal-Secret') !== $secret) {
            return response()->json(['error' => 'Unauthorized service access'], 401);
        }

        return $next($request);
    }
}
