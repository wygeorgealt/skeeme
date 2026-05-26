<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures the authenticated user record actually exists in the database.
 * 
 * Handles the edge case where a Sanctum token is valid (exists in
 * personal_access_tokens) but the associated user has been deleted.
 * Without this, $request->user() returns null and controllers crash with 500.
 */
class EnsureUserExists
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated. Your session has expired, please log in again.',
            ], 401);
        }

        return $next($request);
    }
}
