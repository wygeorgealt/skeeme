<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\AnalyticsSnapshot;
use App\Models\Question;
use TCPDF;

class AnalyticsPdfService
{
    /**
     * Generate a comprehensive PDF report for an exam
     */
    public function generateReport(Exam $exam, AnalyticsSnapshot $snapshot, array $insights): string
    {
        // Create new PDF document
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

        // Set document information
        $pdf->SetCreator('Skeeme');
        $pdf->SetAuthor('Skeeme AI Advisor');
        $pdf->SetTitle('Exam Performance Report - ' . $exam->title);
        $pdf->SetSubject('Exam Analytics');

        // Set margins
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetHeaderMargin(5);
        $pdf->SetFooterMargin(10);
        $pdf->SetAutoPageBreak(true, 25);

        // Add a page
        $pdf->AddPage();

        // Header Section
        $this->addHeader($pdf, $exam, $snapshot);

        // Executive Summary
        $this->addExecutiveSummary($pdf, $snapshot);

        // Performance Distribution & Groups
        $this->addLearnerSegmentation($pdf, $insights);

        // AI Advisor Insights
        $this->addAIInsights($pdf, $insights);

        // Question Performance Table
        $this->addQuestionAnalysis($pdf, $snapshot);

        // Footer is automatically handled if SetPrintFooter is true, 
        // but we'll add a custom timestamp at the bottom of the last page or via footer callback
        
        return $pdf->Output('', 'S');
    }

    private function addHeader(TCPDF $pdf, Exam $exam, AnalyticsSnapshot $snapshot): void
    {
        $pdf->SetFont('helvetica', 'B', 24);
        $pdf->SetTextColor(79, 70, 229); // Indigo-600
        $pdf->Cell(0, 15, 'Performance Report', 0, 1, 'L');
        
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell(0, 8, $exam->title, 0, 1, 'L');
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(0, 5, 'Course: ' . ($exam->course->name ?? 'General'), 0, 1, 'L');
        $pdf->Cell(0, 5, 'Lecturer: ' . ($exam->lecturer->first_name ?? '') . ' ' . ($exam->lecturer->last_name ?? ''), 0, 1, 'L');
        $pdf->Cell(0, 5, 'Report Generated: ' . now()->format('M d, Y H:i'), 0, 1, 'L');
        
        $pdf->Ln(10);
        $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
        $pdf->Ln(5);
    }

    private function addExecutiveSummary(TCPDF $pdf, AnalyticsSnapshot $snapshot): void
    {
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 10, 'Executive Summary', 0, 1, 'L');
        
        $pdf->SetFillColor(249, 250, 251);
        $pdf->SetFont('helvetica', '', 10);
        
        // Grid setup
        $w = 45;
        $h = 20;
        
        $this->drawMetricCard($pdf, 'Average Score', $snapshot->average_score . '%', 15, $pdf->GetY());
        $this->drawMetricCard($pdf, 'Pass Rate', $snapshot->pass_rate . '%', 15 + $w, $pdf->GetY());
        $this->drawMetricCard($pdf, 'Total Students', $snapshot->total_students, 15 + ($w * 2), $pdf->GetY());
        $this->drawMetricCard($pdf, 'Avg. Time', round(($snapshot->average_time_spent ?? 0) / 60) . 'm', 15 + ($w * 3), $pdf->GetY());
        
        $pdf->Ln($h + 10);
    }

    private function drawMetricCard(TCPDF $pdf, string $label, $value, $x, $y): void
    {
        $pdf->SetXY($x, $y);
        $pdf->SetFillColor(249, 250, 251);
        $pdf->Rect($x, $y, 42, 18, 'F');
        
        $pdf->SetXY($x, $y + 3);
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetTextColor(107, 114, 128);
        $pdf->Cell(42, 5, strtoupper($label), 0, 0, 'C');
        
        $pdf->SetXY($x, $y + 8);
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetTextColor(17, 24, 39);
        $pdf->Cell(42, 7, $value, 0, 0, 'C');
    }

    private function addLearnerSegmentation(TCPDF $pdf, array $insights): void
    {
        if (empty($insights['learning_groups'])) return;
        
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell(0, 10, 'Student Performance Groups', 0, 1, 'L');
        
        $pdf->SetFont('helvetica', '', 9);
        $groups = $insights['learning_groups'];
        
        $pdf->SetFillColor(255, 255, 255);
        $pdf->SetDrawColor(229, 231, 235);
        
        foreach (['advanced', 'proficient', 'developing', 'beginning'] as $key) {
            if (!isset($groups[$key])) continue;
            
            $group = $groups[$key];
            $color = match($key) {
                'advanced' => [16, 185, 129],
                'proficient' => [59, 130, 246],
                'developing' => [245, 158, 11],
                'beginning' => [239, 68, 68],
                default => [107, 114, 128],
            };
            
            $pdf->SetFillColor(252, 252, 252);
            $pdf->Cell(50, 8, ucfirst($key), 1, 0, 'L', true);
            $pdf->Cell(20, 8, $group['count'] . ' students', 1, 0, 'C');
            $pdf->Cell(110, 8, $group['suggestion'], 1, 1, 'L');
        }
        
        $pdf->Ln(5);
    }

    private function addAIInsights(TCPDF $pdf, array $insights): void
    {
        $pdf->AddPage(); // Start AI section on new page
        
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetTextColor(124, 58, 237); // Purple-600
        $pdf->Cell(0, 10, 'AI Advisor Insights', 0, 1, 'L');
        $pdf->SetTextColor(0, 0, 0);
        
        // Key Findings
        if (!empty($insights['key_findings'])) {
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(0, 8, 'Key Findings', 0, 1, 'L');
            
            foreach ($insights['key_findings'] as $finding) {
                $pdf->SetFont('helvetica', 'B', 10);
                $pdf->Cell(0, 6, '• ' . $finding['title'], 0, 1, 'L');
                $pdf->SetFont('helvetica', '', 9);
                $pdf->MultiCell(0, 5, $finding['description'], 0, 'L');
                $pdf->Ln(2);
            }
            $pdf->Ln(5);
        }

        // Recommended Actions (Deep Reasoning)
        if (!empty($insights['improvement_areas'])) {
            $pdf->SetFont('helvetica', 'B', 12);
            $pdf->Cell(0, 8, 'Recommended Actions & Deep Reasoning', 0, 1, 'L');
            
            foreach ($insights['improvement_areas'] as $improvement) {
                $pdf->SetFillColor(245, 243, 255);
                $pdf->SetFont('helvetica', 'B', 10);
                $pdf->Cell(0, 8, ' ' . $improvement['area'], 0, 1, 'L', true);
                
                if (isset($improvement['question_id'])) {
                    $pdf->SetFont('helvetica', 'I', 8);
                    $pdf->SetTextColor(107, 114, 128);
                    $pdf->Cell(0, 5, ' Question ' . ($improvement['question_number'] ?? ''), 0, 1, 'L');
                    $pdf->SetTextColor(0, 0, 0);
                }

                $pdf->SetFont('helvetica', '', 9);
                if (isset($improvement['question_text'])) {
                    $pdf->SetTextColor(75, 85, 99);
                    $pdf->MultiCell(0, 5, '"' . $improvement['question_text'] . '"', 0, 'L');
                    $pdf->SetTextColor(0, 0, 0);
                }

                $pdf->Ln(2);
                $pdf->SetFont('helvetica', 'B', 9);
                $pdf->SetTextColor(79, 70, 229);
                $pdf->Cell(0, 5, 'Pedagogical Advice:', 0, 1, 'L');
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetFont('helvetica', '', 9);
                
                foreach ($improvement['suggestions'] as $suggestion) {
                    $pdf->MultiCell(0, 5, '→ ' . $suggestion, 0, 'L');
                }
                $pdf->Ln(5);
            }
        }
    }

    private function addQuestionAnalysis(TCPDF $pdf, AnalyticsSnapshot $snapshot): void
    {
        if (empty($snapshot->question_performance)) return;
        
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 10, 'Detailed Question Performance', 0, 1, 'L');
        
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetFillColor(243, 244, 246);
        
        $pdf->Cell(15, 8, 'No.', 1, 0, 'C', true);
        $pdf->Cell(140, 8, 'Question Text', 1, 0, 'L', true);
        $pdf->Cell(25, 8, 'Success %', 1, 1, 'C', true);
        
        $pdf->SetFont('helvetica', '', 8);
        foreach ($snapshot->question_performance as $qId => $perf) {
            $qText = $perf['text'] ?? 'Question ' . ($perf['number'] ?? '');
            $success = ($perf['total'] > 0) ? ($perf['correct'] / $perf['total']) * 100 : 0;
            
            // Handle page breaks manually for cells if needed, but MultiCell handles wrapping.
            $currentY = $pdf->GetY();
            if ($currentY > 260) {
                $pdf->AddPage();
                $pdf->SetFont('helvetica', 'B', 9);
                $pdf->Cell(15, 8, 'No.', 1, 0, 'C', true);
                $pdf->Cell(140, 8, 'Question Text', 1, 0, 'L', true);
                $pdf->Cell(25, 8, 'Success %', 1, 1, 'C', true);
                $pdf->SetFont('helvetica', '', 8);
            }
            
            $h = $pdf->getStringHeight(140, $qText);
            $h = max($h, 8);
            
            $pdf->Cell(15, $h, $perf['number'] ?? '-', 1, 0, 'C');
            $pdf->MultiCell(140, $h, $qText, 1, 'L', false, 0);
            $pdf->Cell(25, $h, round($success, 1) . '%', 1, 1, 'C');
        }
    }
}
