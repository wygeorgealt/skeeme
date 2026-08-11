<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscription::query();

        if ($request->has('school_id')) {
            $query->where('school_id', $request->integer('school_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'plan_type' => ['required', 'string'],
            'status' => ['required', 'in:active,inactive,expired'],
            'started_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'features' => ['nullable', 'json'],
        ]);

        $subscription = Subscription::create($validated);

        return response()->json($subscription, Response::HTTP_CREATED);
    }

    public function show(Subscription $subscription)
    {
        return response()->json($subscription);
    }

    public function update(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:active,inactive,expired'],
            'expires_at' => ['sometimes', 'date'],
            'features' => ['sometimes', 'json'],
        ]);

        $subscription->update($validated);

        return response()->json($subscription);
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
