<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionPlan
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature = null): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // If no specific feature is required, just check if user has an active subscription
        if (!$feature) {
            if (!$user->school || !$user->school->hasActiveSubscription()) {
                return $this->handleNoSubscription($request);
            }
        } else {
            // Check if user can access the specific feature
            if (!$this->subscriptionService->canAccessFeature($user, $feature)) {
                return $this->handleFeatureRestriction($request, $feature);
            }
        }

        return $next($request);
    }

    /**
     * Handle case when user has no active subscription
     */
    private function handleNoSubscription(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Subscription required',
                'message' => 'An active subscription is required to access this feature.'
            ], 403);
        }

        return redirect()->route('subscriptions.index')
            ->with('error', 'An active subscription is required to access this feature.');
    }

    /**
     * Handle case when user cannot access a specific feature
     */
    private function handleFeatureRestriction(Request $request, string $feature): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Feature not available',
                'message' => "The {$feature} feature is not available in your current plan."
            ], 403);
        }

        return redirect()->back()
            ->with('error', "The {$feature} feature is not available in your current plan. Please upgrade your subscription.");
    }
}
