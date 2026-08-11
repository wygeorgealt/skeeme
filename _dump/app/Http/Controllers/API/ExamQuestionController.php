<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExamQuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = ExamQuestion::query();

        if ($request->has('exam_id')) {
            $query->where('exam_id', $request->integer('exam_id'));
        }

        if ($request->has('question_id')) {
            $query->where('question_id', $request->integer('question_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_id' => ['required', 'integer', 'exists:exams,id'],
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'order' => ['required', 'integer', 'min:1'],
            'marks' => ['required', 'integer', 'min:1'],
            'time_limit' => ['nullable', 'integer', 'min:1'],
            'instructions' => ['nullable', 'string'],
        ]);

        $examQuestion = ExamQuestion::create($validated);

        return response()->json($examQuestion, Response::HTTP_CREATED);
    }

    public function show(ExamQuestion $examQuestion)
    {
        return response()->json($examQuestion->load(['exam', 'question']));
    }

    public function update(Request $request, ExamQuestion $examQuestion)
    {
        $validated = $request->validate([
            'order' => ['sometimes', 'integer', 'min:1'],
            'marks' => ['sometimes', 'integer', 'min:1'],
            'time_limit' => ['sometimes', 'integer', 'min:1', 'nullable'],
            'instructions' => ['sometimes', 'string', 'nullable'],
        ]);

        $examQuestion->update($validated);

        return response()->json($examQuestion);
    }

    public function destroy(ExamQuestion $examQuestion)
    {
        $examQuestion->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
