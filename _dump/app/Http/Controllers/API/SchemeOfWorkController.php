<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SchemeOfWork;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SchemeOfWorkController extends Controller
{
    public function index(Request $request)
    {
        $query = SchemeOfWork::query();

        if ($request->has('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
        ]);

        $scheme = SchemeOfWork::create($validated);

        return response()->json($scheme, Response::HTTP_CREATED);
    }

    public function show(SchemeOfWork $scheme)
    {
        return response()->json($scheme);
    }

    public function update(Request $request, SchemeOfWork $scheme)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'end_date' => ['sometimes', 'date'],
        ]);

        $scheme->update($validated);

        return response()->json($scheme);
    }

    public function destroy(SchemeOfWork $scheme)
    {
        $scheme->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
