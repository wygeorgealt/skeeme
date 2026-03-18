<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReferralController extends Controller
{
    /**
     * GET /referral/my-code
     * Returns the authenticated user's referral code.
     */
    public function myCode(Request $request)
    {
        $user = Auth::user();

        // Generate code if user doesn't have one yet
        if (!$user->referral_code) {
            $user->referral_code = $this->generateUniqueCode();
            $user->save();
        }

        return response()->json([
            'referral_code' => $user->referral_code,
            'share_text' => "I've been using Skeeme to study smarter — it builds quizzes and flashcards from my notes using AI. Use my code {$user->referral_code} and get 100 bonus credits free. Download: https://skeeme.com/students",
        ]);
    }

    /**
     * GET /referral/stats
     * Returns referral statistics for the authenticated user.
     */
    public function stats(Request $request)
    {
        $user = Auth::user();

        $totalReferrals = Referral::where('referrer_user_id', $user->id)->count();
        $creditedReferrals = Referral::where('referrer_user_id', $user->id)->where('status', 'credited')->count();
        $creditsEarned = $creditedReferrals * 100;

        return response()->json([
            'total_referrals' => $totalReferrals,
            'credited_referrals' => $creditedReferrals,
            'credits_earned' => $creditsEarned,
        ]);
    }

    /**
     * POST /referral/redeem
     * Called when a referred user completes their first study action.
     * Credits both users atomically.
     */
    public function redeem(Request $request)
    {
        $validated = $request->validate([
            'referral_code' => 'required|string|max:12',
        ]);

        $referredUser = Auth::user();
        $code = strtoupper(trim($validated['referral_code']));

        // Find the referrer by code
        $referrer = User::where('referral_code', $code)->first();

        if (!$referrer) {
            return response()->json(['message' => 'Invalid referral code.'], 422);
        }

        // Cannot self-refer
        if ($referrer->id === $referredUser->id) {
            return response()->json(['message' => 'You cannot use your own referral code.'], 422);
        }

        // Check if already referred
        $existingReferral = Referral::where('referred_user_id', $referredUser->id)
            ->where('status', 'credited')
            ->exists();

        if ($existingReferral) {
            return response()->json(['message' => 'You have already redeemed a referral code.'], 422);
        }

        try {
            DB::transaction(function () use ($referrer, $referredUser, $code) {
                // Lock both users
                $lockedReferrer = User::where('id', $referrer->id)->lockForUpdate()->first();
                $lockedReferred = User::where('id', $referredUser->id)->lockForUpdate()->first();

                // Credit both users 100 credits
                $lockedReferrer->increment('credits', 100);
                $lockedReferred->increment('credits', 100);

                // Log transactions
                $lockedReferrer->transactions()->create([
                    'type' => 'reward',
                    'amount' => 100,
                    'description' => "Referral reward: {$lockedReferred->name} joined with your code",
                    'metadata' => json_encode(['source' => 'referral']),
                ]);

                $lockedReferred->transactions()->create([
                    'type' => 'reward',
                    'amount' => 100,
                    'description' => "Referral bonus: Joined using code {$code}",
                    'metadata' => json_encode(['source' => 'referral']),
                ]);

                // Create or update referral record
                Referral::updateOrCreate(
                    ['referred_user_id' => $lockedReferred->id],
                    [
                        'referrer_user_id' => $lockedReferrer->id,
                        'referral_code' => $code,
                        'status' => 'credited',
                        'referred_at' => $lockedReferred->created_at,
                        'credited_at' => now(),
                    ]
                );
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Referral redeemed! You and your friend both earned 100 credits.',
                'credits_earned' => 100,
                'remaining_credits' => $referredUser->fresh()->credits,
            ]);
        } catch (\Exception $e) {
            Log::error("Referral redeem failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to redeem referral code.'], 500);
        }
    }

    /**
     * Generate a unique 8-character alphanumeric referral code.
     */
    private function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}
