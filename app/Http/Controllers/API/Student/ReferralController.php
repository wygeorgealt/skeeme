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
        $existingReferral = Referral::where('referred_user_id', $referredUser->id)->exists();
        if ($existingReferral) {
            return response()->json(['message' => 'You have already used a referral code.'], 422);
        }

        try {
            $result = DB::transaction(function () use ($referrer, $referredUser, $code) {
                // Find indirect referrer (who referred the current referrer?)
                $indirectReferral = Referral::where('referred_user_id', $referrer->id)->first();
                $indirectReferrer = $indirectReferral ? User::find($indirectReferral->referrer_user_id) : null;

                // 1. Credit the New User (C) - 100 Credits
                $referredUser->increment('credits', 100);
                $referredUser->transactions()->create([
                    'type' => 'reward',
                    'amount' => 100,
                    'description' => "Welcome bonus: Used code {$code}",
                    'metadata' => json_encode(['source' => 'referral_bonus']),
                ]);

                // 2. Credit the Direct Referrer (B) - 200 Credits
                $referrer->increment('credits', 200);
                $referrer->transactions()->create([
                    'type' => 'reward',
                    'amount' => 200,
                    'description' => "Referral reward: {$referredUser->name} joined",
                    'metadata' => json_encode(['source' => 'referral_direct']),
                ]);

                // 3. Credit the Indirect Referrer (A) - 50 Credits (if exists)
                if ($indirectReferrer) {
                    $indirectReferrer->increment('credits', 50);
                    $indirectReferrer->transactions()->create([
                        'type' => 'reward',
                        'amount' => 50,
                        'description' => "Secondary referral reward: Friend of {$referrer->name} joined",
                        'metadata' => json_encode(['source' => 'referral_indirect']),
                    ]);
                }

                // Create referral record
                return Referral::create([
                    'referred_user_id' => $referredUser->id,
                    'referrer_user_id' => $referrer->id,
                    'indirect_referrer_user_id' => $indirectReferrer?->id,
                    'referral_code' => $code,
                    'direct_reward_amount' => 200,
                    'indirect_reward_amount' => 50,
                    'status' => 'credited',
                    'referred_at' => now(),
                    'credited_at' => now(),
                ]);
            });

            // Send Notification to Direct Referrer
            try {
                // Assuming a Notification or Push service exists
                // $referrer->notify(new \App\Notifications\ReferralJoined($referredUser));
            } catch (\Exception $e) {}

            return response()->json([
                'status' => 'success',
                'message' => 'Referral code applied! You earned 100 bonus credits.',
                'credits_earned' => 100,
                'remaining_credits' => $referredUser->fresh()->credits,
            ]);
        } catch (\Exception $e) {
            Log::error("Referral redeem failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to redeem referral code.'], 500);
        }
    }

    /**
     * GET /referral/pending-rewards
     * Returns total unclaimed reward credits for the user.
     */
    public function pendingRewards(Request $request)
    {
        $user = Auth::user();

        $directAmount = Referral::where('referrer_user_id', $user->id)
            ->whereNotNull('credited_at')
            ->whereNull('direct_reward_claimed_at')
            ->sum('direct_reward_amount');

        $indirectAmount = Referral::where('indirect_referrer_user_id', $user->id)
            ->whereNotNull('credited_at')
            ->whereNull('indirect_reward_claimed_at')
            ->sum('indirect_reward_amount');

        $total = $directAmount + $indirectAmount;

        if ($total <= 0) {
            return response()->json(['total' => 0]);
        }

        return response()->json([
            'total' => $total,
            'direct' => $directAmount,
            'indirect' => $indirectAmount,
            'message' => "You have {$total} new credits waiting from referrals!",
        ]);
    }

    /**
     * POST /referral/claim-rewards
     * Marks all pending rewards as claimed.
     */
    public function claimRewards(Request $request)
    {
        $user = Auth::user();
        $now = now();

        Referral::where('referrer_user_id', $user->id)
            ->whereNotNull('credited_at')
            ->whereNull('direct_reward_claimed_at')
            ->update(['direct_reward_claimed_at' => $now]);

        Referral::where('indirect_referrer_user_id', $user->id)
            ->whereNotNull('credited_at')
            ->whereNull('indirect_reward_claimed_at')
            ->update(['indirect_reward_claimed_at' => $now]);

        return response()->json(['status' => 'success']);
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
