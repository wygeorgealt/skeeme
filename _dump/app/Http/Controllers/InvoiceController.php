<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\InvoicePdfService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class InvoiceController extends Controller
{
    protected InvoicePdfService $pdfService;

    public function __construct(InvoicePdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Download invoice as PDF
     */
    public function download(Invoice $invoice): Response
    {
        // Check if user is authorized to download this invoice
        if (!$this->isAuthorizedToView($invoice)) {
            throw new AuthorizationException('Unauthorized to download this invoice.');
        }

        $pdf = $this->pdfService->generatePdf($invoice);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $this->getFileName($invoice) . '"',
        ]);
    }

    /**
     * View invoice in browser
     */
    public function view(Invoice $invoice)
    {
        // Check if user is authorized to view this invoice
        if (!$this->isAuthorizedToView($invoice)) {
            throw new AuthorizationException('Unauthorized to view this invoice.');
        }

        $pdf = $this->pdfService->generatePdf($invoice);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $this->getFileName($invoice) . '"',
        ]);
    }

    /**
     * Check if user is authorized to view this invoice
     */
    private function isAuthorizedToView(Invoice $invoice): bool
    {
        $user = auth()->user();

        // Admin can view all invoices
        if ($user->hasRole('admin')) {
            return true;
        }

        // School owner/manager can view their school's invoices
        if ($invoice->school_id && $user->school_id === $invoice->school_id) {
            return true;
        }

        // Student can view their own invoices
        if ($invoice->user_id && $user->id === $invoice->user_id) {
            return true;
        }

        return false;
    }

    /**
     * Get file name for invoice
     */
    private function getFileName(Invoice $invoice): string
    {
        return 'Invoice-' . $invoice->invoice_number . '.pdf';
    }
}
