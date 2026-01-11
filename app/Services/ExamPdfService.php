<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Question;
use App\Models\ExamAnswer;
use TCPDF;

class ExamPdfService
{
    /**
     * Generate a PDF question paper for an exam
     */
    public function generateQuestionPaper(Exam $exam): string
    {
        $pdf = $this->createBasePdf('Question Paper - ' . $exam->title);
        $this->addExamHeader($pdf, $exam);
        $this->addInstructions($pdf, $exam);
        $this->addQuestions($pdf, $exam);
        
        return $pdf->Output('', 'S');
    }

    /**
     * Generate a PDF for a student's marked script
     */
    public function generateMarkedScript(ExamSession $session): string
    {
        $exam = $session->exam;
        $student = $session->student;
        
        $pdf = $this->createBasePdf('Marked Script - ' . $student->name . ' - ' . $exam->title);
        $this->addScriptHeader($pdf, $session);
        $this->addStudentSummary($pdf, $session);
        $this->addMarkedAnswers($pdf, $session);
        
        return $pdf->Output('', 'S');
    }

    private function createBasePdf(string $title): TCPDF
    {
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('Skeeme');
        $pdf->SetAuthor('Skeeme Assessment Intelligence');
        $pdf->SetTitle($title);
        
        $pdf->SetMargins(20, 20, 20);
        $pdf->SetHeaderMargin(10);
        $pdf->SetFooterMargin(15);
        $pdf->SetAutoPageBreak(true, 25);
        
        // Add default font
        $pdf->SetFont('helvetica', '', 10);
        
        $pdf->AddPage();
        return $pdf;
    }

    private function addExamHeader(TCPDF $pdf, Exam $exam): void
    {
        $school = $exam->lecturer->school;
        
        // School Name Center
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, strtoupper($school->name ?? 'SKEEME ASSESSMENT SYSTEM'), 0, 1, 'C');
        
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'FACULTY OF ' . strtoupper($exam->course->faculty ?? 'EXAMINATION SERVICES'), 0, 1, 'C');
        $pdf->Cell(0, 8, 'DEPARTMENT OF ' . strtoupper($exam->course->department ?? 'STUDIES'), 0, 1, 'C');
        
        $pdf->Ln(5);
        $pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(5);
        
        // Exam Details Table-like Layout
        $pdf->SetFont('helvetica', 'B', 10);
        $leftCol = 120;
        $rightCol = 50;
        
        $pdf->Cell($leftCol, 7, 'COURSE: ' . ($exam->course->name ?? 'N/A'), 0, 0, 'L');
        $pdf->Cell($rightCol, 7, 'CODE: ' . ($exam->course->code ?? 'N/A'), 0, 1, 'R');
        
        $pdf->Cell($leftCol, 7, 'EXAMINATION: ' . $exam->title, 0, 0, 'L');
        $pdf->Cell($rightCol, 7, 'TIME ALLOWED: ' . $exam->duration . ' MINS', 0, 1, 'R');
        
        $pdf->Cell($leftCol, 7, 'LECTURER: ' . ($exam->lecturer->name ?? 'N/A'), 0, 0, 'L');
        $pdf->Cell($rightCol, 7, 'DATE: ' . ($exam->exam_date?->format('F d, Y') ?? 'N/A'), 0, 1, 'R');
        
        $pdf->Ln(5);
        $pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(5);
    }

    private function addScriptHeader(TCPDF $pdf, ExamSession $session): void
    {
        $this->addExamHeader($pdf, $session->exam);
        
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetTextColor(79, 70, 229); // Indigo
        $pdf->Cell(0, 10, 'STUDENT ASSESSMENT SCRIPT', 0, 1, 'C');
        $pdf->SetTextColor(0, 0, 0);
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(40, 7, 'STUDENT NAME:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(0, 7, strtoupper($session->student->name), 0, 1, 'L');
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(40, 7, 'MATRIC NO / ID:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(0, 7, $session->student->student_id ?? $session->student->id, 0, 1, 'L');
        
        $pdf->Ln(5);
        $pdf->Line(20, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(5);
    }

    private function addInstructions(TCPDF $pdf, Exam $exam): void
    {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 7, 'INSTRUCTIONS TO CANDIDATES:', 0, 1, 'L');
        
        $pdf->SetFont('helvetica', '', 9);
        $pdf->MultiCell(0, 5, $exam->description ?? '1. Answer all questions unless otherwise stated. 2. Mobile phones and electronic gadgets are strictly prohibited. 3. Ensure you submit your script to the invigilator before leaving.', 0, 'L');
        
        $pdf->Ln(5);
    }

    private function addStudentSummary(TCPDF $pdf, ExamSession $session): void
    {
        $pdf->SetFillColor(249, 250, 251);
        $pdf->Rect(20, $pdf->GetY(), 170, 20, 'F');
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetXY(25, $pdf->GetY() + 5);
        $pdf->Cell(40, 5, 'TOTAL SCORE:', 0, 0);
        
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->SetTextColor(16, 185, 129); // Emerald
        $pdf->Cell(30, 5, $session->score . ' / ' . $session->exam->total_marks, 0, 0);
        
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetX(120);
        $pdf->Cell(30, 5, 'PERCENTAGE:', 0, 0);
        $pdf->Cell(20, 5, number_format(($session->score / max(1, $session->exam->total_marks)) * 100, 1) . '%', 0, 1);
        
        $pdf->Ln(10);
    }

    private function addQuestions(TCPDF $pdf, Exam $exam): void
    {
        $questions = $exam->questions()
            ->withPivot('order', 'marks')
            ->orderBy('pivot_order')
            ->get();
            
        foreach ($questions as $index => $question) {
            $this->renderQuestion($pdf, $question, $index + 1, $question->pivot->marks);
        }
    }

    private function addMarkedAnswers(TCPDF $pdf, ExamSession $session): void
    {
        $answers = $session->examAnswers()
            ->with('question')
            ->get()
            ->sortBy('question_index');
            
        foreach ($answers as $index => $answer) {
            $this->renderMarkedAnswer($pdf, $answer, $index + 1);
        }
    }

    private function renderQuestion(TCPDF $pdf, Question $question, int $num, $marks): void
    {
        if ($pdf->GetY() > 250) {
            $pdf->AddPage();
        }
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(10, 7, $num . '.', 0, 0, 'L');
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(150, 7, $question->question_text, 0, 'L', false, 0);
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(10, 7, '[' . $marks . ' Marks]', 0, 1, 'R');
        $pdf->Ln(2);
        
        // Options for MCQ
        if ($question->question_type === 'multiple_choice' && is_array($question->options)) {
            $pdf->SetX(30);
            foreach ($question->options as $idx => $option) {
                $letter = chr(65 + $idx);
                $pdf->SetX(30);
                $pdf->Cell(10, 6, '(' . $letter . ')', 0, 0);
                $pdf->Cell(0, 6, $option, 0, 1);
            }
        } elseif ($question->question_type === 'true_false') {
            $pdf->SetX(30);
            $pdf->Cell(0, 6, '(A) TRUE', 0, 1);
            $pdf->SetX(30);
            $pdf->Cell(0, 6, '(B) FALSE', 0, 1);
        } else {
            // Essay/Short Answer - add some space
            $pdf->Ln(20);
        }
        
        $pdf->Ln(5);
    }

    private function renderMarkedAnswer(TCPDF $pdf, ExamAnswer $answer, int $num): void
    {
        if ($pdf->GetY() > 240) {
            $pdf->AddPage();
        }
        
        $question = $answer->question;
        $examId = $answer->examSession->exam_id;
        
        // Get max marks from pivot table
        $maxMarks = 10;
        if ($question) {
            $maxMarks = \DB::table('exam_questions')
                ->where('exam_id', $examId)
                ->where('question_id', $question->id)
                ->value('marks') ?? 10;
        }
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(10, 7, $num . '.', 0, 0, 'L');
        
        $pdf->SetFont('helvetica', '', 10);
        $qText = $question ? $question->question_text : 'Question data unavailable';
        $pdf->MultiCell(140, 7, $qText, 0, 'L', false, 0);
        
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(79, 70, 229);
        $pdf->Cell(20, 7, $answer->marks_obtained . ' / ' . $maxMarks, 0, 1, 'R');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Ln(2);
        
        // Student's answer
        $pdf->SetX(30);
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(107, 114, 128);
        $pdf->Cell(0, 5, 'STUDENT ANSWER:', 0, 1);
        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetX(30);
        $pdf->MultiCell(150, 5, $answer->student_answer ?? '(No answer provided)', 0, 'L');
        
        // Correct answer (if MC/TF)
        if ($question && in_array($question->question_type, ['multiple_choice', 'true_false'])) {
            $pdf->SetX(30);
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->SetTextColor(16, 185, 129);
            $pdf->Cell(0, 5, 'CORRECT ANSWER: ' . (is_array($question->correct_answer) ? implode(', ', $question->correct_answer) : $question->correct_answer), 0, 1);
            $pdf->SetTextColor(0, 0, 0);
        }
        
        // Feedback
        if ($answer->feedback) {
            $pdf->Ln(2);
            $pdf->SetX(30);
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->SetTextColor(79, 70, 229);
            $pdf->Cell(0, 5, 'LECTURER FEEDBACK:', 0, 1);
            $pdf->SetFont('helvetica', 'I', 9);
            $pdf->SetTextColor(55, 65, 81);
            $pdf->SetX(30);
            $pdf->MultiCell(150, 5, $answer->feedback, 0, 'L');
            $pdf->SetTextColor(0, 0, 0);
        }

        // AI Advice if present
        if ($answer->aiGrading) {
            $pdf->Ln(2);
            $pdf->SetX(30);
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->SetTextColor(124, 58, 237); // Purple
            $pdf->Cell(0, 5, 'AI ANALYSIS:', 0, 1);
            $pdf->SetFont('helvetica', '', 9);
            $pdf->SetTextColor(76, 29, 149);
            $pdf->SetX(30);
            $pdf->MultiCell(150, 5, $answer->aiGrading->reasoning, 0, 'L');
            $pdf->SetTextColor(0, 0, 0);
        }
        
        $pdf->Ln(5);
        $pdf->Line(30, $pdf->GetY(), 190, $pdf->GetY(), ['color' => [243, 244, 246]]);
        $pdf->Ln(5);
    }
}
