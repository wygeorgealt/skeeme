<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Services\StudentPerformanceService;
use Livewire\Component;
use Livewire\Attributes\Computed;

class StudentPerformanceReports extends Component
{
    public Exam $exam;
    public StudentPerformanceService $performanceService;
    
    public array $classPerformance = [];
    public array $topPerformers = [];
    public array $bottomPerformers = [];
    public array $scoreDistribution = [];
    public array $gradeDistribution = [];
    public array $questionPerformance = [];
    public array $performanceTrends = [];
    
    public string $activeTab = 'overview'; // overview, distribution, questions, trends
    public string $exportFormat = 'csv'; // csv, pdf
    public bool $showExportModal = false;
    
    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->performanceService = app(StudentPerformanceService::class);
        
        $this->loadReports();
    }
    
    public function loadReports()
    {
        try {
            $this->classPerformance = $this->performanceService->getClassPerformance($this->exam);
            $this->topPerformers = $this->performanceService->getTopPerformers($this->exam);
            $this->bottomPerformers = $this->performanceService->getBottomPerformers($this->exam);
            $this->scoreDistribution = $this->performanceService->getScoreDistribution($this->exam);
            $this->gradeDistribution = $this->performanceService->getGradeDistribution($this->exam);
            $this->questionPerformance = $this->performanceService->getQuestionPerformance($this->exam);
            $this->performanceTrends = $this->performanceService->getPerformanceTrends($this->exam);
        } catch (\Exception $e) {
            $this->dispatch('notify-error', ...['message' => 'Failed to load reports: ' . $e->getMessage()]);
        }
    }
    
    public function setActiveTab(string $tab)
    {
        $this->activeTab = $tab;
    }
    
    public function exportReport()
    {
        try {
            if ($this->exportFormat === 'csv') {
                $this->exportToCSV();
            } elseif ($this->exportFormat === 'pdf') {
                $this->exportToPDF();
            }
            
            $this->showExportModal = false;
            $this->dispatch('notify', ...['message' => 'Report exported successfully']);
        } catch (\Exception $e) {
            $this->dispatch('notify-error', ...['message' => 'Export failed: ' . $e->getMessage()]);
        }
    }
    
    private function exportToCSV()
    {
        $filename = 'performance_report_' . $this->exam->id . '_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $csv = "Performance Report - {$this->exam->title}\n";
        $csv .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";
        
        // Class Performance
        $csv .= "CLASS PERFORMANCE\n";
        $csv .= "Total Students,Average Score,Highest,Lowest,Pass Rate\n";
        $csv .= "{$this->classPerformance['total_students']},";
        $csv .= "{$this->classPerformance['average_score']},";
        $csv .= "{$this->classPerformance['highest_score']},";
        $csv .= "{$this->classPerformance['lowest_score']},";
        $csv .= "{$this->classPerformance['pass_rate']}%\n\n";
        
        // Top Performers
        $csv .= "TOP 10 PERFORMERS\n";
        $csv .= "Rank,Student Name,Marks,Percentage\n";
        foreach ($this->topPerformers as $index => $performer) {
            $csv .= ($index + 1) . ",";
            $csv .= $performer['student_name'] . ",";
            $csv .= $performer['marks'] . ",";
            $csv .= $performer['percentage'] . "%\n";
        }
        
        $csv .= "\n";
        
        // Grade Distribution
        $csv .= "GRADE DISTRIBUTION\n";
        $csv .= "Grade,Count,Percentage\n";
        foreach ($this->gradeDistribution as $grade => $data) {
            $csv .= "$grade,{$data['count']},{$data['percentage']}%\n";
        }
        
        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, $filename, ['Content-Type' => 'text/csv']);
    }
    
    private function exportToPDF()
    {
        // TODO: Implement PDF export using DomPDF or similar
        // This is a placeholder for future implementation
        $filename = 'performance_report_' . $this->exam->id . '_' . now()->format('Y-m-d_H-i-s') . '.pdf';
        
        // For now, return CSV as fallback
        $this->exportToCSV();
    }
    
    public function getGradeColor(string $grade): string
    {
        return match($grade) {
            'A' => 'bg-green-100 text-green-800',
            'B' => 'bg-blue-100 text-blue-800',
            'C' => 'bg-yellow-100 text-yellow-800',
            'D' => 'bg-orange-100 text-orange-800',
            'F' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
    
    public function getPercentageColor(float $percentage): string
    {
        if ($percentage >= 90) return 'text-green-500';
        if ($percentage >= 80) return 'text-blue-500';
        if ($percentage >= 70) return 'text-yellow-500';
        if ($percentage >= 60) return 'text-orange-500';
        return 'text-red-500';
    }
    
    public function render()
    {
        return view('livewire.student-performance-reports', [
            'classPerformance' => $this->classPerformance,
            'topPerformers' => $this->topPerformers,
            'bottomPerformers' => $this->bottomPerformers,
            'scoreDistribution' => $this->scoreDistribution,
            'gradeDistribution' => $this->gradeDistribution,
            'questionPerformance' => $this->questionPerformance,
            'performanceTrends' => $this->performanceTrends,
        ]);
    }
}
