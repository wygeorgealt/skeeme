<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Enrollment::query();

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
            'enrolled_at' => ['nullable', 'date'],
        ]);

        $enrollment = Enrollment::create($validated);

        return response()->json($enrollment, Response::HTTP_CREATED);
    }

    public function show(Enrollment $enrollment)
    {
        return response()->json($enrollment);
    }

    public function update(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'enrolled_at' => ['sometimes', 'date'],
        ]);

        $enrollment->update($validated);

        return response()->json($enrollment);
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
