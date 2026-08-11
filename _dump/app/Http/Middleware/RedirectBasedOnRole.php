<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip Livewire AJAX requests
        if ($request->path() === 'livewire/update' || $request->header('X-Livewire')) {
            return $next($request);
        }

        if (auth()->check()) {
            $user = auth()->user();
            $currentRoute = $request->route()?->getName();
            
            Log::error('RedirectBasedOnRole DEBUG', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'current_route' => $currentRoute,
                'path' => $request->path(),
                'url' => $request->url(),
            ]);
            
            // If user has no role yet and is not on role-selection or onboarding pages, redirect to role selection
            // CREATOR EXCEPTION: Creators don't need a school-specific role
            if (!$user->role && !$user->isCreator() && !in_array($currentRoute, ['role-selection', 'role-selection.store', 'onboarding.admin', 'onboarding.lecturer', 'lecturer.pending-approval'])) {
                Log::error('RedirectBasedOnRole - REDIRECTING TO ROLE-SELECTION', [
                    'user_id' => $user->id,
                    'current_route' => $currentRoute,
                ]);
                return redirect()->route('role-selection');
            }
        }

        return $next($request);
    }
}
