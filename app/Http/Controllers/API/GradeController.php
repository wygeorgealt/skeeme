<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $query = Grade::query();
        if ($request->has('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }
        if ($request->has('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }
        if ($request->has('exam_id')) {
            $query->where('exam_id', $request->integer('exam_id'));
        }
        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:users,id'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'exam_id' => ['required', 'integer', 'exists:exams,id'],
            'score' => ['required', 'numeric', 'min:0'],
            'grade' => ['nullable', 'string', 'max:5'],
            'remarks' => ['nullable', 'string'],
            'graded_at' => ['nullable', 'date'],
        ]);
        $grade = Grade::create($validated);
        return response()->json($grade, Response::HTTP_CREATED);
    }

    public function show(Grade $grade)
    {
        return response()->json($grade);
    }

    public function update(Request $request, Grade $grade)
    {
        $validated = $request->validate([
            'student_id' => ['sometimes', 'integer', 'exists:users,id'],
            'course_id' => ['sometimes', 'integer', 'exists:courses,id'],
            'exam_id' => ['sometimes', 'integer', 'exists:exams,id'],
            'score' => ['sometimes', 'numeric', 'min:0'],
            'grade' => ['sometimes', 'string', 'max:5', 'nullable'],
            'remarks' => ['sometimes', 'string', 'nullable'],
            'graded_at' => ['sometimes', 'date', 'nullable'],
        ]);
        $grade->update($validated);
        return response()->json($grade);
    }

    public function destroy(Grade $grade)
    {
        $grade->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
