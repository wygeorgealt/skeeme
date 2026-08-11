<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QuestionBankController extends Controller
{
    public function index(Request $request)
    {
        $query = QuestionBank::query();

        if ($request->has('school_id')) {
            $query->where('school_id', $request->integer('school_id'));
        }

        if ($request->has('subject')) {
            $query->where('subject', $request->string('subject'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'subject' => ['nullable', 'string', 'max:100'],
            'grade_level' => ['nullable', 'string', 'max:50'],
            'is_public' => ['nullable', 'boolean', 'default:false'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
        ]);

        $bank = QuestionBank::create($validated);

        return response()->json($bank, Response::HTTP_CREATED);
    }

    public function show(QuestionBank $bank)
    {
        return response()->json($bank->load(['school', 'pools.questions']));
    }

    public function update(Request $request, QuestionBank $bank)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'nullable'],
            'school_id' => ['sometimes', 'integer', 'exists:schools,id'],
            'subject' => ['sometimes', 'string', 'max:100', 'nullable'],
            'grade_level' => ['sometimes', 'string', 'max:50', 'nullable'],
            'is_public' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array', 'nullable'],
            'tags.*' => ['string'],
        ]);

        $bank->update($validated);

        return response()->json($bank);
    }

    public function destroy(QuestionBank $bank)
    {
        $bank->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
