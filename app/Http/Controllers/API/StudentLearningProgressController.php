<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\StudentLearningProgress;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StudentLearningProgressController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentLearningProgress::query();

        if ($request->has('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:users,id'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'mastery_level' => ['required', 'numeric', 'min:0', 'max:100'],
            'progress_status' => ['required', 'in:beginning,developing,proficient,advanced'],
            'mastery_level_rating' => ['nullable', 'in:low,medium,high'],
            'exams_completed' => ['required', 'integer', 'min:0'],
            'average_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'learning_objectives_achieved' => ['nullable', 'integer', 'min:0'],
            'total_learning_objectives' => ['nullable', 'integer', 'min:0'],
            'needs_intervention' => ['nullable', 'boolean'],
            'is_high_performer' => ['nullable', 'boolean'],
            'last_assessment_date' => ['nullable', 'date'],
            'next_recommended_actions' => ['nullable', 'array'],
            'next_recommended_actions.*' => ['string'],
        ]);

        $progress = StudentLearningProgress::create($validated);

        return response()->json($progress, Response::HTTP_CREATED);
    }

    public function show(StudentLearningProgress $progress)
    {
        return response()->json($progress->load(['student', 'course']));
    }

    public function update(Request $request, StudentLearningProgress $progress)
    {
        $validated = $request->validate([
            'mastery_level' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'progress_status' => ['sometimes', 'in:beginning,developing,proficient,advanced'],
            'mastery_level_rating' => ['sometimes', 'in:low,medium,high', 'nullable'],
            'exams_completed' => ['sometimes', 'integer', 'min:0'],
            'average_score' => ['sometimes', 'numeric', 'min:0', 'max:100', 'nullable'],
            'learning_objectives_achieved' => ['sometimes', 'integer', 'min:0', 'nullable'],
            'total_learning_objectives' => ['sometimes', 'integer', 'min:0', 'nullable'],
            'needs_intervention' => ['sometimes', 'boolean', 'nullable'],
            'is_high_performer' => ['sometimes', 'boolean', 'nullable'],
            'last_assessment_date' => ['sometimes', 'date', 'nullable'],
            'next_recommended_actions' => ['sometimes', 'array', 'nullable'],
            'next_recommended_actions.*' => ['string'],
        ]);

        $progress->update($validated);

        return response()->json($progress);
    }

    public function destroy(StudentLearningProgress $progress)
    {
        $progress->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
