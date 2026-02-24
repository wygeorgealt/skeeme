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

        // Merge, unique, and sort
        $activeDates = array_unique(array_merge($quizDates, $flashcardDates));
        sort($activeDates);

        return response()->json(['data' => $activeDates]);
    }
}
