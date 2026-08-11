<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::query();

        if ($request->has('school_id')) {
            $query->where('school_id', $request->integer('school_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'course_link' => ['nullable', 'string', 'max:255'],
            'course_rep_id' => ['nullable', 'integer', 'exists:users,id'],
            'created_by' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = Course::generateCourseCode($validated['name']);
        }
        if (empty($validated['course_link'])) {
            $validated['course_link'] = Course::generateCourseLink();
        }

        $course = Course::create($validated);

        return response()->json($course, Response::HTTP_CREATED);
    }

    public function show(Course $course)
    {
        return response()->json($course);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50'],
            'description' => ['sometimes', 'string', 'nullable'],
            'school_id' => ['sometimes', 'integer', 'exists:schools,id'],
            'course_link' => ['sometimes', 'string', 'max:255'],
            'course_rep_id' => ['sometimes', 'integer', 'exists:users,id', 'nullable'],
            'created_by' => ['sometimes', 'integer', 'exists:users,id', 'nullable'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        $course->update($validated);

        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
