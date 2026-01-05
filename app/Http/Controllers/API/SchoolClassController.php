<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::query();

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
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'level' => ['nullable', 'string'],
            'capacity' => ['nullable', 'integer'],
        ]);

        $class = SchoolClass::create($validated);

        return response()->json($class, Response::HTTP_CREATED);
    }

    public function show(SchoolClass $class)
    {
        return response()->json($class);
    }

    public function update(Request $request, SchoolClass $class)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'level' => ['sometimes', 'string'],
            'capacity' => ['sometimes', 'integer'],
        ]);

        $class->update($validated);

        return response()->json($class);
    }

    public function destroy(SchoolClass $class)
    {
        $class->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
