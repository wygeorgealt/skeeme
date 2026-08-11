<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->has('invoice_id')) {
            $query->where('invoice_id', $request->integer('invoice_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'invoice_id' => ['nullable', 'integer', 'exists:invoices,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'payment_method' => ['required', 'string'],
            'transaction_id' => ['required', 'string', 'unique:payments'],
            'status' => ['required', 'in:pending,completed,failed,refunded'],
            'paid_at' => ['nullable', 'date'],
            'metadata' => ['nullable', 'json'],
        ]);

        $payment = Payment::create($validated);

        return response()->json($payment, Response::HTTP_CREATED);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load(['user', 'invoice']));
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,completed,failed,refunded'],
            'paid_at' => ['sometimes', 'date', 'nullable'],
            'metadata' => ['sometimes', 'json', 'nullable'],
        ]);

        $payment->update($validated);

        return response()->json($payment);
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
