<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\QuizSession;
use App\Models\QuizQuestion;
use App\Services\StreakService;

class QuizSessionController extends Controller
{
    /**
     * List all past quiz sessions for the user
     */
    public function index(Request $request)
    {
        $limit = $request->input('limit', 15);
        $cursor = $request->input('cursor');

        $query = QuizSession::where('user_id', $request->user()->id)
            ->withCount('questions')
            ->orderBy('id', 'desc');

        if ($cursor) {
            $query->where('id', '<', $cursor);
        }

        // Fetch limit + 1 to determine if there are more results
        $sessions = $query->take($limit + 1)->get();

        $nextCursor = null;
        if ($sessions->count() > $limit) {
            $sessions->pop(); // Remove the extra item
            $nextCursor = $sessions->last()->id;
        }

        return response()->json([
            'data' => $sessions,
            'next_cursor' => $nextCursor
        ]);
    }

    /**
     * Get details of a specific past quiz session
     */
    public function show(Request $request, $id)
    {
        $session = QuizSession::where('user_id', $request->user()->id)
            ->with('questions')
            ->findOrFail($id);

        return response()->json(['data' => $session]);
    }

    /**
     * Save a completed quiz session from the mobile app
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'topic' => 'required|string',
            'difficulty' => 'required|string',
            'total_questions' => 'required|integer',
            'correct_answers' => 'required|integer',
            'score_percentage' => 'required|numeric',
            'time_spent_seconds' => 'nullable|integer',
            
            // Array of answered questions
            'questions' => 'required|array',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answer' => 'required|string',
            'questions.*.user_answer' => 'nullable|string',
            'questions.*.is_correct' => 'required|boolean',
            'questions.*.explanation' => 'nullable|string',
        ]);

        $session = QuizSession::create([
            'user_id' => $request->user()->id,
            'topic' => $validated['topic'],
            'difficulty' => $validated['difficulty'],
            'total_questions' => $validated['total_questions'],
            'correct_answers' => $validated['correct_answers'],
            'score_percentage' => $validated['score_percentage'],
            'time_spent_seconds' => $validated['time_spent_seconds'],
        ]);

        $questionsData = [];
        foreach ($validated['questions'] as $q) {
            $questionsData[] = [
                'quiz_session_id' => $session->id,
                'question' => $q['question'],
                'type' => $q['type'],
                'options' => isset($q['options']) ? json_encode($q['options']) : null,
                'correct_answer' => $q['correct_answer'],
                'user_answer' => $q['user_answer'] ?? null,
                'is_correct' => $q['is_correct'],
                'explanation' => $q['explanation'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        QuizQuestion::insert($questionsData);

        // Update User Streak
        $streakResult = app(StreakService::class)->logActivity($request->user()->id);

        return response()->json([
            'message' => 'Quiz session saved successfully', 
            'data' => $session,
            'streak' => $streakResult['streak'],
            'reward' => $streakResult['reward']
        ], 201);
    }
    /**
     * Delete a quiz session
     */
    public function destroy(Request $request, $id)
    {
        $session = QuizSession::where('user_id', $request->user()->id)->findOrFail($id);
        $session->delete();
        return response()->json(['message' => 'Quiz session deleted.']);
    }
}
