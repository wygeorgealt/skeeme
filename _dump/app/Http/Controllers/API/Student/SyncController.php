<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\User;
use App\Models\QuizSession;
use App\Models\FlashcardDeck;
use App\Models\StudyStreak;

class SyncController extends Controller
{
    /**
     * Delta Sync: Return only records modified after the last_sync_timestamp.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $lastSync = $request->input('last_sync_timestamp');
        
        $queryTimestamp = null;
        if ($lastSync) {
            try {
                if (is_numeric($lastSync)) {
                    // Handle UNIX timestamp (seconds)
                    $queryTimestamp = Carbon::createFromTimestamp($lastSync);
                } else {
                    // Handle ISO-8601 or standard date strings
                    $queryTimestamp = Carbon::parse($lastSync);
                }
            } catch (\Exception $e) {
                // Invalid format, silently fallback to full sync
                $queryTimestamp = null;
            }
        }

        // 1. User Profile & Credit Balance
        $userQuery = User::where('id', $user->id);
        if ($queryTimestamp) {
            $userQuery->where('updated_at', '>', $queryTimestamp);
        }
        $userData = $userQuery->first();

        // 2. Quiz Sessions with their attached Questions
        $quizQuery = QuizSession::where('user_id', $user->id);
        if ($queryTimestamp) {
            // Include sessions where the session itself OR its questions were recently modified
            $quizQuery->where(function($q) use ($queryTimestamp) {
                $q->where('updated_at', '>', $queryTimestamp)
                  ->orWhereHas('questions', function($subQ) use ($queryTimestamp) {
                      $subQ->where('updated_at', '>', $queryTimestamp);
                  });
            });
        }
        $quizSessions = $quizQuery->with('questions')->get();

        // 3. Flashcard Decks with their attached Cards
        $flashcardQuery = FlashcardDeck::where('user_id', $user->id);
        if ($queryTimestamp) {
            // Include decks where the deck itself OR its flashcards were recently modified
            $flashcardQuery->where(function($q) use ($queryTimestamp) {
                $q->where('updated_at', '>', $queryTimestamp)
                  ->orWhereHas('flashcards', function($subQ) use ($queryTimestamp) {
                      $subQ->where('updated_at', '>', $queryTimestamp);
                  });
            });
        }
        $flashcardDecks = $flashcardQuery->with('flashcards')->get();

        // 4. Study Streaks
        $streakQuery = StudyStreak::where('user_id', $user->id);
        if ($queryTimestamp) {
            $streakQuery->where('updated_at', '>', $queryTimestamp);
        }
        $streaks = $streakQuery->get();

        return response()->json([
            'data' => [
                'user' => $userData,
                'quiz_sessions' => $quizSessions,
                'flashcard_decks' => $flashcardDecks,
                'study_streaks' => $streaks,
            ],
            // Supply exact server cursor for the client to store for their next delta request
            'server_timestamp' => now()->toISOString(),
        ]);
    }
}
