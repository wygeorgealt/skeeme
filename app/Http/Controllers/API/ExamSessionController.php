<?php

namespace App\Http\Controllers\API;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamAnswer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExamSessionController
{
    /**
     * Start a new exam session for a student
     */
    public function start(Request $request, Exam $exam): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        // Check if student already has an active session
        $existingSession = $exam->sessions()
            ->where('student_id', $validated['student_id'])
            ->whereIn('status', ['not_started', 'in_progress'])
            ->first();

        if ($existingSession) {
            return response()->json([
                'message' => 'You already have an active session for this exam',
                'session' => $existingSession,
            ], 409);
        }

        // Create new session
        $session = $exam->sessions()->create([
            'student_id' => $validated['student_id'],
            'status' => 'not_started',
            'metadata' => [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        ]);

        return response()->json([
            'message' => 'Exam session created',
            'session' => $session,
        ], 201);
    }

    /**
     * Begin the exam (transition from not_started to in_progress)
     */
    public function begin(ExamSession $session): JsonResponse
    {
        if ($session->status !== 'not_started') {
            return response()->json([
                'message' => 'Session has already begun or is completed',
            ], 409);
        }

        $session->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json([
            'message' => 'Exam session started',
            'session' => $session,
            'time_remaining' => $session->getTimeRemainingSeconds(),
        ]);
    }

    /**
     * Get session details with questions
     */
    public function show(ExamSession $session): JsonResponse
    {
        // Check if session has expired
        if ($session->isActive() && $session->hasExpired()) {
            $session->update(['status' => 'submitted', 'submitted_at' => now()]);
            return response()->json([
                'message' => 'Session has expired and been auto-submitted',
                'session' => $session,
            ], 410);
        }

        return response()->json([
            'session' => $session,
            'exam' => $session->exam,
            'time_remaining' => $session->isActive() ? $session->getTimeRemainingSeconds() : 0,
            'progress' => $session->getProgressPercentage(),
        ]);
    }

    /**
     * Save an answer (autosave)
     */
    public function saveAnswer(Request $request, ExamSession $session): JsonResponse
    {
        if (!$session->isActive()) {
            return response()->json([
                'message' => 'Session is not active',
            ], 409);
        }

        if ($session->hasExpired()) {
            $session->submit();
            return response()->json([
                'message' => 'Session has expired',
            ], 410);
        }

        $validated = $request->validate([
            'question_index' => 'required|integer|min:0',
            'student_answer' => 'required|string',
        ]);

        $answer = $session->answers()->updateOrCreate(
            ['question_index' => $validated['question_index']],
            [
                'student_answer' => $validated['student_answer'],
                'answered_at' => now(),
                'marking_status' => 'not_marked',
            ]
        );

        // Update progress
        $answeredCount = $session->answers()->whereNotNull('student_answer')->count();
        $session->update(['questions_answered' => $answeredCount]);

        return response()->json([
            'message' => 'Answer saved',
            'answer' => $answer,
        ]);
    }

    /**
     * Get all answers for a session
     */
    public function getAnswers(ExamSession $session): JsonResponse
    {
        return response()->json([
            'answers' => $session->answers()->get(),
        ]);
    }

    /**
     * Submit the exam session
     */
    public function submit(ExamSession $session): JsonResponse
    {
        if (!$session->isActive()) {
            return response()->json([
                'message' => 'Session is not active',
            ], 409);
        }

        $session->submit();

        // Calculate time spent
        $timeSpent = $session->started_at->diffInSeconds(now());
        $session->update(['time_spent_seconds' => $timeSpent]);

        return response()->json([
            'message' => 'Exam submitted successfully',
            'session' => $session,
        ]);
    }

    /**
     * Abandon/timeout the exam session
     */
    public function abandon(ExamSession $session): JsonResponse
    {
        if (!$session->isActive()) {
            return response()->json([
                'message' => 'Session is not active',
            ], 409);
        }

        $timeSpent = $session->started_at->diffInSeconds(now());
        $session->update([
            'status' => 'abandoned',
            'submitted_at' => now(),
            'time_spent_seconds' => $timeSpent,
        ]);

        return response()->json([
            'message' => 'Exam session abandoned',
            'session' => $session,
        ]);
    }

    /**
     * Get exam session results (after grading)
     */
    public function results(ExamSession $session): JsonResponse
    {
        if ($session->status === 'not_marked') {
            return response()->json([
                'message' => 'Exam is still being graded',
            ], 202);
        }

        $answers = $session->answers()->with('grading_details')->get();

        return response()->json([
            'session' => $session,
            'exam' => $session->exam,
            'answers' => $answers,
            'total_score' => $session->score,
            'total_marks' => $session->exam->total_marks,
        ]);
    }
}
