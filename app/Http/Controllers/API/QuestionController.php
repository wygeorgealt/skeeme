<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = Question::query();

        if ($request->has('question_pool_id')) {
            $query->where('question_pool_id', $request->integer('question_pool_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->has('question_type')) {
            $query->where('question_type', $request->string('question_type'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_pool_id' => ['required', 'integer', 'exists:question_pools,id'],
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'in:multiple_choice,essay,true_false'],
            'options' => ['nullable', 'array'],
            'correct_answer' => ['nullable', 'string'],
            'marks' => ['required', 'integer', 'min:1'],
            'bloom_level' => ['nullable', 'in:remember,understand,apply,analyze,evaluate,create'],
            'difficulty_level' => ['nullable', 'in:easy,medium,hard'],
            'explanation' => ['nullable', 'string'],
            'metadata' => ['nullable', 'json'],
            'status' => ['nullable', 'in:draft,published,archived', 'default:draft'],
        ]);

        $question = Question::create($validated);

        return response()->json($question, Response::HTTP_CREATED);
    }

    public function show(Question $question)
    {
        // Verify ownership through pool
        if ($question->questionPool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($question->load(['questionPool']));
    }

    public function update(Request $request, Question $question)
    {
        // Verify ownership through pool
        if ($question->questionPool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'question_text' => ['sometimes', 'string'],
            'question_type' => ['sometimes', 'in:multiple_choice,essay,true_false'],
            'options' => ['sometimes', 'array', 'nullable'],
            'correct_answer' => ['sometimes', 'string', 'nullable'],
            'marks' => ['sometimes', 'integer', 'min:1'],
            'bloom_level' => ['sometimes', 'in:remember,understand,apply,analyze,evaluate,create', 'nullable'],
            'difficulty_level' => ['sometimes', 'in:easy,medium,hard', 'nullable'],
            'explanation' => ['sometimes', 'string', 'nullable'],
            'metadata' => ['sometimes', 'json', 'nullable'],
            'status' => ['sometimes', 'in:draft,published,archived'],
        ]);

        $question->update($validated);

        return response()->json($question);
    }

    public function destroy(Question $question)
    {
        // Verify ownership through pool
        if ($question->questionPool->lecturer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
