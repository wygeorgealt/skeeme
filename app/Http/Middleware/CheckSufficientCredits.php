<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\CreditCostCalculator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CheckSufficientCredits
{
    protected $calculator;

    public function __construct(CreditCostCalculator $calculator)
    {
        $this->calculator = $calculator;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // 1. Skip unlimited users (Elite Plan or Team members)
        if ($user->is_unlimited_student) {
            return $next($request);
        }

        // 2. Determine Cost via Calculator (Fail-Closed)
        try {
            $cost = $this->calculator->calculate($request);
        } catch (\Exception $e) {
            Log::error("SufficientCreditsMiddleware: Calculation failed - Failing Closed. Error: " . $e->getMessage());
            return response()->json([
                'error' => 'credit_verification_failed',
                'message' => 'Could not verify sufficient credits. Please try again or use a simpler file.',
            ], 402);
        }
        
        // If cost is 0 or negative, allow through
        if ($cost <= 0) {
            return $next($request);
        }

        // 3. Check Balance (No caching to prevent Admin panel desync)
        $user->refresh(); // Ensure we have latest from DB
        $available = $user->credits;

        // --- NEW: Free Tier 1-Scan/Day Logic (Resets at 2 AM) ---
        if ($user->subscription_tier === 'free') {
            $path = $request->path();
            
            // Only allow scans. Block everything else (quizzes, flashcards)
            if (\Illuminate\Support\Str::contains($path, 'scan/solve')) {
                $lastScan = $user->last_free_scan_at ? \Carbon\Carbon::parse($user->last_free_scan_at) : null;
                $today2AM = \Carbon\Carbon::now()->setTime(2, 0, 0);
                
                // Determine the most recent 2 AM reset point
                if (\Carbon\Carbon::now()->lt($today2AM)) {
                    $resetPoint = $today2AM->copy()->subDay();
                } else {
                    $resetPoint = $today2AM;
                }

                // Reset counter if their last scan was before the reset point
                if (!$lastScan || $lastScan->lt($resetPoint)) {
                    $user->daily_free_scans_used = 0;
                    $user->save();
                }

                if ($user->daily_free_scans_used >= 1) {
                    return response()->json([
                        'error' => 'insufficient_credits',
                        'message' => "You've reached your limit of 1 free scan per day. Upgrade to continue studying.",
                    ], 402);
                }

                // Allow this scan! Increment usage and flag request to bypass deduction.
                $user->daily_free_scans_used += 1;
                $user->last_free_scan_at = now();
                $user->save();
                
                $request->attributes->set('is_free_daily_scan', true);
                return $next($request);
            } else {
                return response()->json([
                    'error' => 'insufficient_credits',
                    'message' => "This feature requires a premium subscription. Upgrade to access quizzes and flashcards.",
                ], 402);
            }
        }
        // --- END Free Tier Logic ---

        // 4. Validate
        if ($available < $cost) {
            Log::warning("Insufficient credits intercepted by middleware", [
                'user_id' => $user->id,
                'available' => $available,
                'required' => $cost,
                'path' => $request->path()
            ]);

            return response()->json([
                'error' => 'insufficient_credits',
                'message' => "Insufficient credits. This action requires $cost credits, but you only have $available.",
                'required' => $cost,
                'available' => (int) $available,
                'shortfall' => (int) ($cost - $available),
            ], 402);
        }

        // 5. Success - Attach cost to request so controller doesn't recalculate (Optional optimization)
        $request->attributes->set('calculated_credit_cost', $cost);

        return $next($request);
    }
}
