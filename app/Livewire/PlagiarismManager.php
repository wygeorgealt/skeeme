<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\PlagiarismCheck;
use App\Services\PlagiarismDetectionService;
use Livewire\Component;
use Livewire\Attributes\Computed;

class PlagiarismManager extends Component
{
    public Exam $exam;
    public PlagiarismDetectionService $plagiarismService;
    
    public string $selectedCheckId = '';
    public array $plagiarismChecks = [];
    public array $examReport = [];
    public string $filterStatus = 'all'; // all, flagged, clean
    public string $sortBy = 'score_desc'; // score_asc, score_desc, date_asc, date_desc
    public bool $showSettings = false;
    public bool $showDetails = false;
    
    // Settings form
    public bool $plagiarism_check_enabled = true;
    public float $plagiarism_threshold = 0.5;
    public string $check_mode = 'real_time';
    public string $penalty_for_flagged = 'warning';
    public ?int $penalty_marks = 5;
    public string $plagiarism_service = 'internal';
    
    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->plagiarismService = app(PlagiarismDetectionService::class);
        
        $this->loadChecks();
        $this->loadReport();
        $this->loadSettings();
    }
    
    public function loadChecks()
    {
        try {
            $query = PlagiarismCheck::where('exam_id', $this->exam->id)->with(['session', 'question']);
            
            // Apply filters
            if ($this->filterStatus === 'flagged') {
                $query->where('plagiarism_status', 'flagged');
            } elseif ($this->filterStatus === 'clean') {
                $query->whereIn('plagiarism_status', ['checked'])->where('plagiarism_score', '<', $this->plagiarism_threshold);
            }
            
            // Apply sorting
            $query = match($this->sortBy) {
                'score_asc' => $query->orderBy('plagiarism_score'),
                'score_desc' => $query->orderByDesc('plagiarism_score'),
                'date_asc' => $query->orderBy('checked_at'),
                'date_desc' => $query->orderByDesc('checked_at'),
                default => $query->orderByDesc('plagiarism_score'),
            };
            
            $this->plagiarismChecks = $query->get()
                ->map(function ($check) {
                    return [
                        'id' => $check->id,
                        'question_id' => $check->question_id,
                        'question_text' => substr($check->question->question_text ?? 'Untitled', 0, 100),
                        'student_answer' => substr($check->student_answer, 0, 200),
                        'plagiarism_score' => $check->plagiarism_score,
                        'plagiarism_status' => $check->plagiarism_status,
                        'severity' => $check->getSeverityLevel(),
                        'severity_label' => $check->getSeverityLabel(),
                        'flagged_at' => $check->flagged_at?->format('M d, Y H:i'),
                        'checked_at' => $check->checked_at?->format('M d, Y H:i'),
                        'penalty_applied' => $check->penalty_applied,
                        'session' => $check->session->student->name ?? 'Unknown Student',
                    ];
                })
                ->all();
        } catch (\Exception $e) {
            $this->plagiarismChecks = [];
        }
    }
    
    public function loadReport()
    {
        try {
            $this->examReport = $this->plagiarismService->getExamReport($this->exam);
        } catch (\Exception $e) {
            $this->examReport = [];
        }
    }
    
    public function loadSettings()
    {
        $settings = $this->plagiarismService->getSettings($this->exam);
        
        if ($settings) {
            $this->plagiarism_check_enabled = $settings->plagiarism_check_enabled;
            $this->plagiarism_threshold = $settings->plagiarism_threshold;
            $this->check_mode = $settings->check_mode;
            $this->penalty_for_flagged = $settings->penalty_for_flagged;
            $this->penalty_marks = $settings->penalty_marks;
            $this->plagiarism_service = $settings->plagiarism_service;
        }
    }
    
    public function saveSettings()
    {
        try {
            $settings = $this->plagiarismService->getSettings($this->exam) 
                ?? new \App\Models\ExamPlagiarismSettings();
            
            $settings->fill([
                'exam_id' => $this->exam->id,
                'plagiarism_check_enabled' => $this->plagiarism_check_enabled,
                'plagiarism_threshold' => $this->plagiarism_threshold,
                'check_mode' => $this->check_mode,
                'penalty_for_flagged' => $this->penalty_for_flagged,
                'penalty_marks' => $this->penalty_marks,
                'plagiarism_service' => $this->plagiarism_service,
            ])->save();
            
            $this->plagiarismService->clearCache($this->exam);
            $this->dispatch('notify', message: 'Plagiarism settings saved successfully');
            $this->showSettings = false;
        } catch (\Exception $e) {
            $this->dispatch('notify-error', message: 'Failed to save settings: ' . $e->getMessage());
        }
    }
    
    public function selectCheck(string $checkId)
    {
        $this->selectedCheckId = $checkId;
        $this->showDetails = true;
    }
    
    public function closeDetails()
    {
        $this->showDetails = false;
        $this->selectedCheckId = '';
    }
    
    public function toggleFilter(string $status)
    {
        $this->filterStatus = $status;
        $this->loadChecks();
    }
    
    public function setSortBy(string $sort)
    {
        $this->sortBy = $sort;
        $this->loadChecks();
    }
    
    public function runCheck()
    {
        try {
            $this->dispatch('notify', message: 'Running plagiarism checks...');
            
            // Trigger background job for all unchecked answers
            foreach ($this->exam->sessions as $session) {
                foreach ($session->answers as $answer) {
                    if (!PlagiarismCheck::where('exam_session_id', $session->id)
                        ->where('question_id', $answer->question_id)
                        ->exists()) {
                        
                        $this->plagiarismService->checkAnswer(
                            $session,
                            $answer->question,
                            $answer->student_answer,
                            async: true
                        );
                    }
                }
            }
            
            $this->loadChecks();
            $this->loadReport();
            $this->dispatch('notify', message: 'Plagiarism checks completed');
        } catch (\Exception $e) {
            $this->dispatch('notify-error', message: 'Failed to run checks: ' . $e->getMessage());
        }
    }
    
    public function refreshChecks()
    {
        $this->loadChecks();
        $this->loadReport();
        $this->dispatch('notify', message: 'Checks refreshed');
    }
    
    #[Computed]
    public function selectedCheck()
    {
        if (empty($this->selectedCheckId)) {
            return null;
        }
        
        return collect($this->plagiarismChecks)
            ->firstWhere('id', $this->selectedCheckId);
    }
    
    public function getSeverityColor(string $severity): string
    {
        return match($severity) {
            'critical' => 'bg-red-100 text-red-800',
            'high' => 'bg-orange-100 text-orange-800',
            'medium' => 'bg-yellow-100 text-yellow-800',
            'low' => 'bg-blue-100 text-blue-800',
            default => 'bg-green-100 text-green-800',
        };
    }
    
    public function getSeverityIcon(string $severity): string
    {
        return match($severity) {
            'critical' => '🚨',
            'high' => '⚠️',
            'medium' => '⚡',
            'low' => 'ℹ️',
            default => '✓',
        };
    }
    
    public function render()
    {
        return view('livewire.plagiarism-manager', [
            'filteredChecks' => $this->plagiarismChecks,
            'selectedCheck' => $this->selectedCheck,
            'examReport' => $this->examReport,
        ]);
    }
}
