<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->has('subscription_id')) {
            $query->where('subscription_id', $request->integer('subscription_id'));
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
            'subscription_id' => ['nullable', 'integer', 'exists:subscriptions,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'status' => ['required', 'in:pending,paid,overdue,cancelled'],
            'due_date' => ['nullable', 'date'],
            'paid_at' => ['nullable', 'date'],
            'invoice_number' => ['required', 'string', 'unique:invoices'],
            'description' => ['nullable', 'string'],
        ]);

        $invoice = Invoice::create($validated);

        return response()->json($invoice, Response::HTTP_CREATED);
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load(['user', 'subscription']));
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,paid,overdue,cancelled'],
            'paid_at' => ['sometimes', 'date', 'nullable'],
            'due_date' => ['sometimes', 'date', 'nullable'],
            'description' => ['sometimes', 'string', 'nullable'],
        ]);

        $invoice->update($validated);

        return response()->json($invoice);
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function download(Invoice $invoice)
    {
        // Verify ownership
        if ($invoice->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pdfPath = storage_path('app/invoices/' . $invoice->invoice_number . '.pdf');

        if (!file_exists($pdfPath)) {
            return response()->json(['message' => 'Invoice PDF not found'], 404);
        }

        return response()->download($pdfPath);
    }
}
