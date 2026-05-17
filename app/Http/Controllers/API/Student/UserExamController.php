<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Models\UserExam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserExamController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $user->clearPassedExams();

        $exams = $user->userExams()
            ->orderBy('exam_date', 'asc')
            ->get();

        return response()->json($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'exam_date' => 'required|date',
        ]);

        $exam = Auth::user()->userExams()->create($validated);

        return response()->json($exam, 201);
    }

    public function update(Request $request, UserExam $userExam)
    {
        if ($userExam->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:100',
            'exam_date' => 'sometimes|date',
        ]);

        $userExam->update($validated);

        return response()->json($userExam);
    }

    public function destroy(UserExam $userExam)
    {
        if ($userExam->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userExam->delete();

        return response()->json(null, 204);
    }
}
