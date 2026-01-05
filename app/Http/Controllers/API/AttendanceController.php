<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::query();

        if ($request->has('class_id')) {
            $query->where('class_id', $request->integer('class_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:users,id'],
            'class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:present,absent,late,excused'],
        ]);

        $attendance = Attendance::create($validated);

        return response()->json($attendance, Response::HTTP_CREATED);
    }

    public function show(Attendance $attendance)
    {
        return response()->json($attendance);
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:present,absent,late,excused'],
            'date' => ['sometimes', 'date'],
        ]);

        $attendance->update($validated);

        return response()->json($attendance);
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
