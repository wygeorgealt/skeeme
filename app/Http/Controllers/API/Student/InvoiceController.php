<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    /**
     * Get billing history for the authenticated student
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Invoice::where('user_id', $user->id)
            ->orderBy('invoice_date', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Download the invoice PDF (ensuring ownership)
     */
    public function download(Invoice $invoice)
    {
        if ($invoice->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pdfPath = storage_path('app/invoices/' . $invoice->invoice_number . '.pdf');

        if (!file_exists($pdfPath)) {
            return response()->json(['message' => 'Invoice PDF not found on server'], 404);
        }

        return response()->download($pdfPath);
    }
}
