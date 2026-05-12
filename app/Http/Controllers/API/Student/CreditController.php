<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Models\OutOfCreditEvent;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CreditController extends Controller
{
    /**
     * GET /credits/summary
     * Returns current credit balance, plan info, and estimated remaining actions.
     */
    public function summary(Request $request)
    {
        $user = Auth::user();
        $plan = $user->getStudentPlan();
        $credits = (int) $user->credits;

        // Calculate weekly refresh countdown
        $weeklyRefreshDays = null;
        if (in_array($plan, ['standard', 'elite'])) {
            $lastRefill = $user->last_credit_refill_at;
            if ($lastRefill) {
                $nextRefill = $lastRefill->copy()->addWeek();
                $weeklyRefreshDays = max(0, (int) now()->diffInDays($nextRefill, false));
            } else {
                $weeklyRefreshDays = 7;
            }
        }

        $pricingConfig = \App\Models\SystemSetting::getPricingConfig();
        $planTier = $plan === 'free' ? 'free' : 'paid';
        $rates = $pricingConfig['rates'] ?? [];

        $scanRate = is_array($rates['scan_solve'] ?? 25) ? ($rates['scan_solve'][$planTier] ?? 25) : ($rates['scan_solve'] ?? 25);
        $quizRate = is_array($rates['quiz_flat'] ?? 30) ? ($rates['quiz_flat'][$planTier] ?? 30) : ($rates['quiz_flat'] ?? 30);
        $flashcardRate = is_array($rates['flashcard_flat'] ?? 25) ? ($rates['flashcard_flat'][$planTier] ?? 25) : ($rates['flashcard_flat'] ?? 25);

        // Estimate remaining actions based on average credit costs
        $estimatedActions = [
            'scans' => $scanRate > 0 ? (int) floor($credits / $scanRate) : 0,
            'quizzes_10q' => $quizRate > 0 ? (int) floor($credits / $quizRate) : 0,
            'flashcard_decks_20c' => $flashcardRate > 0 ? (int) floor($credits / $flashcardRate) : 0,
        ];

        // Credit thresholds for color coding
        $maxCredits = match ($plan) {
            'standard' => 5000,
            'elite' => 10000,
            default => 500,
        };
        $percentage = $maxCredits > 0 ? round(($credits / $maxCredits) * 100) : 0;

        return response()->json([
            'current_credits' => $credits,
            'plan' => $plan,
            'weekly_refresh_in_days' => $weeklyRefreshDays,
            'estimated_actions_remaining' => $estimatedActions,
            'credit_percentage' => min(100, $percentage),
        ]);
    }

    /**
     * POST /credits/out-of-credits
     * Logs an out-of-credits conversion event for analytics.
     */
    public function logOutOfCredits(Request $request)
    {
        $validated = $request->validate([
            'feature_attempted' => 'required|in:scan,quiz,flashcard',
        ]);

        $user = Auth::user();

        // Calculate days since last purchase
        $lastPurchase = Payment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->latest('paid_at')
            ->first();

        $daysSincePurchase = $lastPurchase
            ? (int) $lastPurchase->paid_at->diffInDays(now())
            : null;

        OutOfCreditEvent::create([
            'user_id' => $user->id,
            'plan' => $user->getStudentPlan(),
            'feature_attempted' => $validated['feature_attempted'],
            'days_since_last_purchase' => $daysSincePurchase,
        ]);

        return response()->json(['status' => 'logged']);
    }
}
