<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\School;
use TCPDF;

class InvoicePdfService
{
    /**
     * Generate PDF for an invoice
     */
    public function generatePdf(Invoice $invoice): string
    {
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        
        // Set document information
        $pdf->SetCreator('Skeeme');
        $pdf->SetAuthor($invoice->school->name ?? config('app.name', 'Skeeme'));
        $pdf->SetTitle('Invoice ' . $invoice->invoice_number);
        $pdf->SetSubject('Invoice for subscription');
        
        // Set margins
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetAutoPageBreak(true, 15);
        
        // Add a page
        $pdf->AddPage();
        
        // Set font
        $pdf->SetFont('helvetica', '', 11);
        
        // Header section with school info and invoice details
        $this->addHeader($pdf, $invoice);
        
        // Invoice details table
        $this->addInvoiceDetails($pdf, $invoice);
        
        // Line items table
        $this->addLineItems($pdf, $invoice);
        
        // Totals section
        $this->addTotals($pdf, $invoice);
        
        // Payment information and terms
        $this->addPaymentInfo($pdf, $invoice);
        
        // Notes/terms
        $this->addNotes($pdf, $invoice);
        
        // Footer
        $this->addFooter($pdf, $invoice);
        
        return $pdf->Output('', 'S'); // Return as string
    }
    
    /**
     * Save PDF to file storage
     */
    public function savePdf(Invoice $invoice): string
    {
        $pdfContent = $this->generatePdf($invoice);
        $fileName = $this->generateFileName($invoice);
        $filePath = storage_path('invoices/' . $fileName);
        
        // Create directory if not exists
        if (!is_dir(storage_path('invoices'))) {
            mkdir(storage_path('invoices'), 0755, true);
        }
        
        file_put_contents($filePath, $pdfContent);
        
        // Update invoice with file path
        $invoice->update(['file_path' => 'invoices/' . $fileName]);
        
        return $filePath;
    }
    
    /**
     * Get file path from storage
     */
    public function getFilePath(Invoice $invoice): string
    {
        if ($invoice->file_path && file_exists(storage_path($invoice->file_path))) {
            return storage_path($invoice->file_path);
        }
        
        return $this->savePdf($invoice);
    }
    
    /**
     * Generate file name for invoice
     */
    private function generateFileName(Invoice $invoice): string
    {
        return 'Invoice-' . $invoice->invoice_number . '-' . time() . '.pdf';
    }
    
    /**
     * Add header section
     */
    private function addHeader(TCPDF &$pdf, Invoice $invoice): void
    {
        // Company/School name and logo area
        $pdf->SetFont('helvetica', 'B', 20);
        $issuerName = $invoice->school->name ?? config('app.name', 'Skeeme');
        $pdf->Cell(0, 10, $issuerName, 0, 1, 'L');
        
        $pdf->SetFont('helvetica', '', 10);
        $issuerEmail = $invoice->school->email ?? config('mail.from.address', 'hello@skeeme.com');
        $pdf->Cell(0, 5, 'Email: ' . $issuerEmail, 0, 1, 'L');

        if ($invoice->school && $invoice->school->phone) {
            $pdf->Cell(0, 5, 'Phone: ' . $invoice->school->phone, 0, 1, 'L');
        }
        
        $pdf->Ln(5);
        
        // Invoice title and number on the right
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetXY(120, 20);
        $pdf->Cell(75, 10, 'INVOICE', 0, 1, 'R');
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetXY(120, 30);
        $pdf->Cell(75, 5, 'Invoice #: ' . $invoice->invoice_number, 0, 1, 'R');
        
        $pdf->SetXY(120, 35);
        $pdf->Cell(75, 5, 'Date: ' . $invoice->invoice_date->format('M d, Y'), 0, 1, 'R');
        
        if ($invoice->due_date) {
            $pdf->SetXY(120, 40);
            $pdf->Cell(75, 5, 'Due Date: ' . $invoice->due_date->format('M d, Y'), 0, 1, 'R');
        }
        
        // Status badge
        $statusColor = $this->getStatusColor($invoice->status);
        $pdf->SetXY(120, 45);
        $pdf->SetFillColor($statusColor['r'], $statusColor['g'], $statusColor['b']);
        $pdf->Cell(75, 6, strtoupper($invoice->status), 0, 1, 'C', true);
        
        $pdf->Ln(10);
    }
    
    /**
     * Add invoice details section
     */
    private function addInvoiceDetails(TCPDF &$pdf, Invoice $invoice): void
    {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        
        // Bill to section
        $pdf->Cell(90, 6, 'BILL TO:', 0, 0, 'L', true);
        $pdf->Cell(90, 6, 'INVOICE DETAILS:', 0, 1, 'L', true);
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetFillColor(255, 255, 255);
        
        // Recipient details
        if ($invoice->user) {
            $billingInfo = ($invoice->user->name ?: 'Student') . "\n" . 
                          ($invoice->user->email ?? '');
        } else {
            $billingInfo = ($invoice->school->name ?? 'School') . "\n" . 
                          ($invoice->school->address ?? 'Address not provided') . "\n" .
                          ($invoice->school->city ?? '') . ', ' . 
                          ($invoice->school->country ?? '');
        }

        $pdf->MultiCell(90, 5, $billingInfo, 0, 'L');
        
        // Move to right column
        $pdf->SetXY(110, $pdf->GetY() - 15);
        
        // Invoice details
        $details = "Plan: " . ($invoice->plan_name ?? 'N/A') . "\n";
        $details .= "Subscription: " . ($invoice->subscription_id ? "ID: {$invoice->subscription_id}" : 'N/A') . "\n";
        $details .= "Currency: " . ($invoice->currency ?? 'NGN') . "\n";
        $details .= "Description: " . ($invoice->description ?? 'Subscription charge');
        
        $pdf->MultiCell(90, 5, $details, 0, 'L');
        
        $pdf->Ln(5);
    }
    
    /**
     * Add line items table
     */
    private function addLineItems(TCPDF &$pdf, Invoice $invoice): void
    {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(50, 50, 50);
        $pdf->SetTextColor(255, 255, 255);
        
        // Table header
        $pdf->Cell(80, 7, 'Description', 1, 0, 'L', true);
        $pdf->Cell(35, 7, 'Quantity', 1, 0, 'C', true);
        $pdf->Cell(35, 7, 'Unit Price', 1, 0, 'R', true);
        $pdf->Cell(35, 7, 'Amount', 1, 1, 'R', true);
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFillColor(240, 240, 240);
        
        // Line items
        $description = $invoice->description ?? 'Subscription Charge';
        $amount = $invoice->amount ?? 0;
        
        $pdf->Cell(80, 6, $description, 1, 0, 'L', true);
        $pdf->Cell(35, 6, '1', 1, 0, 'C', true);
        $pdf->Cell(35, 6, number_format($amount, 2), 1, 0, 'R', true);
        $pdf->Cell(35, 6, number_format($amount, 2), 1, 1, 'R', true);
        
        $pdf->Ln(3);
    }
    
    /**
     * Add totals section
     */
    private function addTotals(TCPDF &$pdf, Invoice $invoice): void
    {
        $pdf->SetFont('helvetica', '', 10);
        
        // Subtotal
        $pdf->SetX(115);
        $pdf->Cell(60, 6, 'Subtotal:', 0, 0, 'R');
        $pdf->Cell(35, 6, $invoice->currency . ' ' . number_format($invoice->amount ?? 0, 2), 0, 1, 'R');
        
        // Discount if any
        if ($invoice->discount_amount && $invoice->discount_amount > 0) {
            $pdf->SetX(115);
            $pdf->Cell(60, 6, 'Discount:', 0, 0, 'R');
            $pdf->SetTextColor(220, 53, 69);
            $pdf->Cell(35, 6, '-' . $invoice->currency . ' ' . number_format($invoice->discount_amount, 2), 0, 1, 'R');
            $pdf->SetTextColor(0, 0, 0);
        }
        
        // Total
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetX(115);
        $pdf->SetFillColor(50, 50, 50);
        $pdf->SetTextColor(255, 255, 255);
        $total = ($invoice->amount ?? 0) - ($invoice->discount_amount ?? 0);
        $pdf->Cell(60, 8, 'TOTAL:', 1, 0, 'R', true);
        $pdf->Cell(35, 8, $invoice->currency . ' ' . number_format($total, 2), 1, 1, 'R', true);
        
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Ln(5);
    }
    
    /**
     * Add payment information
     */
    private function addPaymentInfo(TCPDF &$pdf, Invoice $invoice): void
    {
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 6, 'PAYMENT INFORMATION', 0, 1);
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetFillColor(240, 240, 240);
        
        if ($invoice->isPaid()) {
            $pdf->SetTextColor(40, 167, 69);
            $payment = $invoice->payments()->where('status', 'completed')->latest()->first();
            if ($payment) {
                $pdf->Cell(0, 5, '✓ PAID on ' . $payment->paid_at->format('M d, Y'), 0, 1, 'L', true);
                if ($payment->transaction_id) {
                    $pdf->Cell(0, 5, 'Transaction ID: ' . $payment->transaction_id, 0, 1, 'L');
                }
            } else {
                $pdf->Cell(0, 5, '✓ Payment Status: PAID', 0, 1, 'L', true);
            }
            $pdf->SetTextColor(0, 0, 0);
        } else {
            $pdf->SetTextColor(220, 53, 69);
            $pdf->Cell(0, 5, '● OUTSTANDING - Please remit payment', 0, 1, 'L', true);
            $pdf->SetTextColor(0, 0, 0);
        }
        
        $pdf->Ln(3);
    }
    
    /**
     * Add notes and terms
     */
    private function addNotes(TCPDF &$pdf, Invoice $invoice): void
    {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 6, 'TERMS & NOTES', 0, 1);
        
        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(100, 100, 100);
        
        $notes = "Thank you for your business!\n";
        $notes .= "This invoice is for subscription services rendered.\n";
        if ($invoice->notes) {
            $notes .= "\nNotes: " . $invoice->notes;
        }
        
        $pdf->MultiCell(0, 4, $notes, 0, 'L');
        
        $pdf->SetTextColor(0, 0, 0);
    }
    
    /**
     * Add footer
     */
    private function addFooter(TCPDF &$pdf, Invoice $invoice): void
    {
        $pdf->SetY(-30);
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(150, 150, 150);
        $pdf->SetFillColor(240, 240, 240);
        
        $pdf->Cell(0, 5, 'Generated by Skeeme on ' . now()->format('M d, Y H:i'), 0, 1, 'C', true);
        $pdf->Cell(0, 5, 'This is an electronically generated document. No signature is required.', 0, 1, 'C');
        $pdf->Cell(0, 5, 'Invoice #: ' . $invoice->invoice_number, 0, 1, 'C');
    }
    
    /**
     * Get color for invoice status
     */
    private function getStatusColor(string $status): array
    {
        return match($status) {
            'paid' => ['r' => 40, 'g' => 167, 'b' => 69],      // Green
            'pending' => ['r' => 255, 'g' => 193, 'b' => 7],    // Amber
            'overdue' => ['r' => 220, 'g' => 53, 'b' => 69],    // Red
            'draft' => ['r' => 108, 'g' => 117, 'b' => 125],    // Grey
            default => ['r' => 0, 'g' => 123, 'b' => 255],      // Blue
        };
    }
}
