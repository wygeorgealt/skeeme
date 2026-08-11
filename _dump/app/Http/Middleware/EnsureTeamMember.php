<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamMember
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Check if user is a team member
        $teamMember = $request->user()->teamMember;
        
        if (!$teamMember || !$teamMember->is_active) {
            abort(403, 'You do not have access to the Team Management Dashboard.');
        }

        // Store team member in request for easy access
        $request->teamMember = $teamMember;

        // Update last login
        $teamMember->update(['last_login_at' => now()]);

        return $next($request);
    }
}
