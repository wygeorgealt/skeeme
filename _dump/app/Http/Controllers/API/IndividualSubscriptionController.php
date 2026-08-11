<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\IndividualSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class IndividualSubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = IndividualSubscription::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'plan_name' => ['required', 'string', 'in:Free,Standard,Elite'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'price' => ['required', 'numeric'],
            'status' => ['required', 'in:active,inactive,expired'],
            'start_date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        $subscription = IndividualSubscription::create($validated);

        return response()->json($subscription, Response::HTTP_CREATED);
    }

    public function show(IndividualSubscription $individual_subscription)
    {
        return response()->json($individual_subscription);
    }

    public function update(Request $request, IndividualSubscription $individual_subscription)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:active,inactive,expired'],
            'expires_at' => ['sometimes', 'date'],
        ]);

        $individual_subscription->update($validated);

        return response()->json($individual_subscription);
    }

    public function destroy(IndividualSubscription $individual_subscription)
    {
        $individual_subscription->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
