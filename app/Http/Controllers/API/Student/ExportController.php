<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use TCPDF;

class ExportController extends Controller
{
    /**
     * Export a specific quiz session to PDF.
     */
    public function quizExport($id)
    {
        $session = QuizSession::where('user_id', auth()->id())
            ->with('questions')
            ->findOrFail($id);

        return $this->generatePdf(
            "Quiz Report: " . $session->topic,
            view('pdf.study_report', ['session' => $session, 'type' => 'quiz'])->render(),
            "skeeme_quiz_{$id}.pdf"
        );
    }

    /**
     * Export ephemeral scan results to PDF.
     */
    public function scanExport(Request $request)
    {
        $request->validate([
            'results' => 'required|array',
        ]);

        $results = $request->input('results');

        return $this->generatePdf(
            "Scan & Solve Report",
            view('pdf.study_report', ['results' => $results, 'type' => 'scan'])->render(),
            "skeeme_scan_" . now()->format('Ymd_His') . ".pdf"
        );
    }

    /**
     * Helper to generate PDF using TCPDF.
     */
    protected function generatePdf($title, $html, $filename)
    {
        try {
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            // Document info
            $pdf->SetCreator('Skeeme AI');
            $pdf->SetAuthor('Skeeme');
            $pdf->SetTitle($title);
            $pdf->SetSubject('Study Report');

            // Remove default header/footer
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            // Set margins
            $pdf->SetMargins(15, 15, 15);
            $pdf->SetAutoPageBreak(TRUE, 15);

            // Add a page
            $pdf->AddPage();

            // Set font
            $pdf->SetFont('helvetica', '', 10);

            // Write HTML
            $pdf->writeHTML($html, true, false, true, false, '');

            // Output base64
            $content = $pdf->Output($filename, 'S');
            return response()->json([
                'base64' => base64_encode($content),
                'filename' => $filename
            ]);

        } catch (\Exception $e) {
            Log::error("PDF Generation Failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to generate PDF'], 500);
        }
    }
}
