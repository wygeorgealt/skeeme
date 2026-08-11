<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StreakController extends Controller
{
    /**
     * Get study activity for the past 30 days to build a heatmap.
     * We just need an array of dates where the user completed a quiz or deck.
     */
    public function heatmap(Request $request)
    {
        $userId = $request->user()->id;
        $thirtyDaysAgo = Carbon::now()->subDays(30)->startOfDay();

        // Get distinct dates from Quiz Sessions
        $quizDates = DB::table('quiz_sessions')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'))
            ->distinct()
            ->pluck('date')
            ->toArray();

        // Get distinct dates from Flashcard generation
        $flashcardDates = DB::table('flashcard_decks')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'))
            ->distinct()
            ->pluck('date')
            ->toArray();

        // Get distinct dates from Scan & Solve (Transactions)
        $scanDates = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('action_type', 'scan_solve')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'))
            ->distinct()
            ->pluck('date')
            ->toArray();

        // Merge, unique, and sort
        $activeDates = array_unique(array_merge($quizDates, $flashcardDates, $scanDates));
        sort($activeDates);

        return response()->json(['data' => $activeDates]);
    }

    /**
     * Get the user's streak freeze status for the current month.
     */
    public function freezes(Request $request)
    {
        $user = $request->user();
        $record = \App\Models\StreakFreeze::currentMonth($user->id);

        return response()->json([
            'total_allowed' => $record->freezes_allocated,
            'used_this_month' => $record->freezes_used,
        ]);
    }

    /**
     * Claim the pending streak reward
     */
    public function claimReward(Request $request)
    {
        $user = $request->user();
        
        return DB::transaction(function () use ($user) {
            $user = \App\Models\User::lockForUpdate()->find($user->id);
            $streak = \App\Models\StudyStreak::where('user_id', $user->id)->first();

            if (!$streak || $streak->unclaimed_reward <= 0) {
                return response()->json(['message' => 'No reward to claim'], 400);
            }

            $reward = $streak->unclaimed_reward;
            $milestone = $streak->current_streak;

            $user->increment('credits', $reward);

            try {
                $user->transactions()->create([
                    'type' => 'reward',
                    'amount' => $reward,
                    'description' => "{$milestone}-Day Study Streak Reward",
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("Streak reward transaction log failed for user {$user->id}: " . $e->getMessage());
            }

            $streak->unclaimed_reward = 0;
            $streak->save();

            return response()->json([
                'message' => 'Reward claimed successfully',
                'credits' => $user->credits
            ]);
        });
    }
}
