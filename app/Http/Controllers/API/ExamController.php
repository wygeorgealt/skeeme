<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $query = Exam::query();
        if ($request->has('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }
        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'lecturer_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'exam_date' => ['required', 'date'],
            'duration' => ['required', 'integer', 'min:1'],
            'total_marks' => ['required', 'integer', 'min:1'],
            'questions' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $exam = Exam::create($validated);
        return response()->json($exam, Response::HTTP_CREATED);
    }

    public function show(Exam $exam)
    {
        return response()->json($exam);
    }

    public function update(Request $request, Exam $exam)
    {
        $validated = $request->validate([
            'course_id' => ['sometimes', 'integer', 'exists:courses,id'],
            'lecturer_id' => ['sometimes', 'integer', 'exists:users,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'nullable'],
            'exam_date' => ['sometimes', 'date'],
            'duration' => ['sometimes', 'integer', 'min:1'],
            'total_marks' => ['sometimes', 'integer', 'min:1'],
            'questions' => ['sometimes', 'array', 'nullable'],
            'status' => ['sometimes', 'string', 'max:50'],
        ]);
        $exam->update($validated);
        return response()->json($exam);
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
