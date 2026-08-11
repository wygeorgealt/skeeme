<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Services\ExamPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ExamReportController extends Controller
{
    protected $pdfService;

    public function __construct(ExamPdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Download the question paper for an exam.
     */
    public function downloadQuestionPaper(Exam $exam)
    {
        // Permission Check: Admin or Lecturer of the course
        $user = Auth::user();
        if ($user->role !== 'admin' && $exam->lecturer_id !== $user->id) {
            abort(403, 'Unauthorized access to question paper.');
        }

        $pdfContent = $this->pdfService->generateQuestionPaper($exam);
        $filename = 'Question_Paper_' . str_replace(' ', '_', $exam->title) . '.pdf';

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $filename . '"');
    }

    /**
     * Download the marked script for a student session.
     */
    public function downloadMarkedScript(ExamSession $session)
    {
        $user = Auth::user();
        $exam = $session->exam;

        // Permission Check: Admin, Lecturer of course, or the Student themselves
        $isAuthorized = $user->role === 'admin' || 
                        $exam->lecturer_id === $user->id || 
                        $session->student_id === $user->id;

        if (!$isAuthorized) {
            abort(403, 'Unauthorized access to marked script.');
        }

        // Additional Logic for Students: Results must be published unless immediate release is on
        if ($user->role === 'student' && 
            $session->status !== 'published' && 
            !($session->status === 'graded' && $exam->release_results_immediately)) {
            abort(403, 'Your result has not been finalized yet.');
        }

        $pdfContent = $this->pdfService->generateMarkedScript($session);
        $filename = 'Marked_Script_' . str_replace(' ', '_', $session->student->name) . '_' . date('Ymd') . '.pdf';

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $filename . '"');
    }
}
