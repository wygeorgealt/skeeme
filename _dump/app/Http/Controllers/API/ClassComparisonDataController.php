<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ClassComparisonData;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClassComparisonDataController extends Controller
{
    public function index(Request $request)
    {
        $query = ClassComparisonData::query();

        if ($request->has('exam_id')) {
            $query->where('exam_id', $request->integer('exam_id'));
        }

        if ($request->has('comparison_date')) {
            $query->whereDate('comparison_date', $request->date('comparison_date'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_id' => ['required', 'integer', 'exists:exams,id'],
            'comparison_date' => ['required', 'date'],
            'class_average' => ['required', 'numeric', 'min:0', 'max:100'],
            'median_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'pass_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'high_achiever_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'benchmark_average' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'performance_gap' => ['nullable', 'numeric'],
            'performance_status' => ['required', 'in:above_average,average,below_average'],
            'grade_distribution' => ['nullable', 'json'],
            'total_students' => ['required', 'integer', 'min:0'],
            'students_above_average' => ['nullable', 'integer', 'min:0'],
            'students_below_average' => ['nullable', 'integer', 'min:0'],
        ]);

        $comparison = ClassComparisonData::create($validated);

        return response()->json($comparison, Response::HTTP_CREATED);
    }

    public function show(ClassComparisonData $comparison)
    {
        return response()->json($comparison->load(['exam']));
    }

    public function update(Request $request, ClassComparisonData $comparison)
    {
        $validated = $request->validate([
            'class_average' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'median_score' => ['sometimes', 'numeric', 'min:0', 'max:100', 'nullable'],
            'pass_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'high_achiever_rate' => ['sometimes', 'numeric', 'min:0', 'max:100', 'nullable'],
            'benchmark_average' => ['sometimes', 'numeric', 'min:0', 'max:100', 'nullable'],
            'performance_gap' => ['sometimes', 'numeric', 'nullable'],
            'performance_status' => ['sometimes', 'in:above_average,average,below_average'],
            'grade_distribution' => ['sometimes', 'json', 'nullable'],
            'total_students' => ['sometimes', 'integer', 'min:0'],
            'students_above_average' => ['sometimes', 'integer', 'min:0', 'nullable'],
            'students_below_average' => ['sometimes', 'integer', 'min:0', 'nullable'],
        ]);

        $comparison->update($validated);

        return response()->json($comparison);
    }

    public function destroy(ClassComparisonData $comparison)
    {
        $comparison->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
