<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSchoolIpRestriction
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Only check for authenticated students
        if (!$user || !$user->hasRole('student')) {
            return $next($request);
        }

        $school = $user->school;

        // If no school or no IP restrictions set, allow access
        if (!$school || empty($school->allowed_ips)) {
            return $next($request);
        }

        // Check if current IP is allowed
        $currentIp = $request->ip();
        
        // If the school has allowed IPs but current IP is not in the list
        if (!in_array($currentIp, $school->allowed_ips)) {
            abort(403, 'Access denied. You can only access this platform from approved locations.');
        }

        return $next($request);
    }
}
