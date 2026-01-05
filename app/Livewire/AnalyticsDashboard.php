<?php

namespace App\Livewire;

use App\Models\AnalyticsSnapshot;
use App\Models\Exam;
use App\Services\AnalyticsService;
use App\Services\InsightsService;
use Carbon\Carbon;
use Livewire\Component;

class AnalyticsDashboard extends Component
{
    public Exam $exam;

    public $selectedPeriod = 'weekly';
    public $startDate;
    public $endDate;
    public $selectedMetric = 'performance';

    public $currentSnapshot = null;
    public $historicalSnapshots = [];
    public $trends = [];
    public $insights = [];
    public $comparison = null;
    public $showInsightsPanel = true;

    protected $listeners = ['refreshAnalytics'];

    public function mount(Exam $exam)
    {
        $this->authorize('view', $exam);
        $this->exam = $exam;

        $this->startDate = now()->subMonths(1)->format('Y-m-d');
        $this->endDate = now()->format('Y-m-d');

        $this->loadAnalytics();
    }

    public function render()
    {
        return view('livewire.analytics-dashboard', [
            'currentSnapshot' => $this->currentSnapshot,
            'historicalSnapshots' => $this->historicalSnapshots,
            'trends' => $this->trends,
            'insights' => $this->insights,
            'comparison' => $this->comparison,
        ]);
    }

    public function loadAnalytics(AnalyticsService $analyticsService = null)
    {
        $analyticsService = $analyticsService ?? app(AnalyticsService::class);
        $insightsService = app(InsightsService::class);
        
        // Get current snapshot
        $this->currentSnapshot = AnalyticsSnapshot::where('exam_id', $this->exam->id)
            ->latest('snapshot_date')
            ->first();

        if (!$this->currentSnapshot) {
            $this->currentSnapshot = $analyticsService->generateSnapshot($this->exam);
        }

        // Get historical snapshots
        $startDate = Carbon::parse($this->startDate);
        $endDate = Carbon::parse($this->endDate);

        $this->historicalSnapshots = AnalyticsSnapshot::where('exam_id', $this->exam->id)
            ->whereBetween('snapshot_date', [$startDate, $endDate])
            ->orderBy('snapshot_date')
            ->get();

        // Generate AI insights
        if ($this->currentSnapshot) {
            $this->insights = $insightsService->generateInsights($this->currentSnapshot);
            $this->comparison = $insightsService->compareWithPrevious($this->exam);
        }

        // Build trends
        $this->buildTrends();
    }

    public function updateDateRange()
    {
        $this->loadAnalytics();
    }

    public function changePeriod($period)
    {
        $this->selectedPeriod = $period;
        match ($period) {
            'week' => $this->startDate = now()->subWeek()->format('Y-m-d'),
            'month' => $this->startDate = now()->subMonth()->format('Y-m-d'),
            'quarter' => $this->startDate = now()->subMonths(3)->format('Y-m-d'),
            'year' => $this->startDate = now()->subYear()->format('Y-m-d'),
            default => $this->startDate = now()->subMonths(1)->format('Y-m-d'),
        };
        $this->endDate = now()->format('Y-m-d');
        $this->loadAnalytics();
    }

    public function downloadReport()
    {
        return response()->streamDownload(function () {
            echo $this->generateReport();
        }, 'analytics-report-' . $this->exam->id . '.csv');
    }

    public function refreshAnalytics(AnalyticsService $analyticsService)
    {
        $analyticsService->generateSnapshot($this->exam);
        $this->loadAnalytics($analyticsService);
    }

    private function buildTrends()
    {
        $this->trends = [
            'dates' => $this->historicalSnapshots->pluck('snapshot_date')->map(fn($d) => $d->format('M d'))->values()->toArray(),
            'scores' => $this->historicalSnapshots->pluck('average_score')->values()->toArray(),
            'passRates' => $this->historicalSnapshots->pluck('pass_rate')->values()->toArray(),
            'confidence' => $this->historicalSnapshots->pluck('average_confidence')->values()->toArray(),
            'engagement' => $this->historicalSnapshots->pluck('average_time_spent')->values()->toArray(),
        ];
    }

    private function generateReport(): string
    {
        $csv = "ANALYTICS REPORT: " . strtoupper($this->exam->title) . "\n";
        $csv .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n";
        $csv .= "Period: " . $this->startDate . " to " . $this->endDate . "\n";
        $csv .= "=" . str_repeat("=", 80) . "\n\n";

        // SUMMARY STATISTICS
        if ($this->currentSnapshot) {
            $csv .= "SUMMARY STATISTICS\n";
            $csv .= "Metric,Value\n";
            $csv .= "Total Students," . $this->currentSnapshot->total_students . "\n";
            $csv .= "Submitted," . $this->currentSnapshot->students_submitted . "\n";
            $csv .= "Average Score," . $this->currentSnapshot->average_score . "\n";
            $csv .= "Median Score," . $this->currentSnapshot->median_score . "\n";
            $csv .= "Max Score," . $this->currentSnapshot->max_score . "\n";
            $csv .= "Min Score," . ($this->currentSnapshot->min_score ?? 'N/A') . "\n";
            $csv .= "Pass Rate," . $this->currentSnapshot->pass_rate . "%\n";
            $csv .= "Average Confidence," . $this->currentSnapshot->average_confidence . "%\n";
            $csv .= "Score Variance (Std Dev)," . $this->currentSnapshot->std_deviation . "\n\n";

            // GRADING SUMMARY
            $csv .= "GRADING SUMMARY\n";
            $csv .= "Metric,Count\n";
            $csv .= "Auto-Graded Questions," . $this->currentSnapshot->questions_auto_graded . "\n";
            $csv .= "AI-Graded Questions," . $this->currentSnapshot->questions_ai_graded . "\n";
            $csv .= "Grades Approved," . $this->currentSnapshot->grades_approved . "\n";
            $csv .= "Pending Review," . $this->currentSnapshot->grades_pending_review . "\n";
            $csv .= "Grades Overridden," . $this->currentSnapshot->grades_overridden . "\n\n";

            // ENGAGEMENT METRICS
            $csv .= "ENGAGEMENT METRICS\n";
            $csv .= "Metric,Value\n";
            $csv .= "Average Time Spent (minutes)," . round($this->currentSnapshot->average_time_spent / 60, 1) . "\n";
            $csv .= "Early Submissions (before 80%)," . $this->currentSnapshot->early_submissions . "\n";
            $csv .= "Last Minute Submissions (final 5%)," . $this->currentSnapshot->last_minute_submissions . "\n\n";
        }

        // AI INSIGHTS
        if (!empty($this->insights)) {
            $csv .= "AI INSIGHTS & FINDINGS\n";
            $csv .= str_repeat("=", 80) . "\n\n";

            // Key Findings
            if (!empty($this->insights['key_findings'])) {
                $csv .= "KEY FINDINGS\n";
                foreach ($this->insights['key_findings'] as $finding) {
                    $csv .= "- [" . strtoupper($finding['severity']) . "] " . $finding['title'] . "\n";
                    $csv .= "  " . $finding['description'] . "\n";
                }
                $csv .= "\n";
            }

            // At-Risk Students
            if (!empty($this->insights['at_risk_students'])) {
                $csv .= "AT-RISK STUDENTS (" . count($this->insights['at_risk_students']) . ")\n";
                $csv .= "Student Name,Score %,Score,Risk Level,Time (min),Questions Attempted\n";
                foreach ($this->insights['at_risk_students'] as $student) {
                    $csv .= '"' . $student['student_name'] . '",' . 
                           $student['percentage'] . ',' . 
                           $student['score'] . ',' . 
                           strtoupper($student['risk_level']) . ',' . 
                           round($student['time_spent'], 1) . ',' . 
                           $student['questions_attempted'] . "/" . $student['total_questions'] . "\n";
                }
                $csv .= "\n";
            }

            // Learning Groups
            if (!empty($this->insights['learning_groups'])) {
                $csv .= "LEARNER SEGMENTATION\n";
                $csv .= "Group,Count,Percentage,Suggestion\n";
                foreach ($this->insights['learning_groups'] as $groupName => $group) {
                    $csv .= ucfirst($groupName) . ',' . 
                           $group['count'] . ',' . 
                           round($group['percentage'], 1) . '%,' . 
                           '"' . $group['suggestion'] . '"' . "\n";
                }
                $csv .= "\n";
            }

            // Topic Recommendations
            if (!empty($this->insights['topic_recommendations'])) {
                $csv .= "TOPIC RECOMMENDATIONS\n";
                $csv .= "Bloom Level,Mastery %,Priority,Action\n";
                foreach ($this->insights['topic_recommendations'] as $rec) {
                    $csv .= str_replace('_', ' ', ucfirst($rec['bloom_level'])) . ',' . 
                           $rec['mastery_percent'] . ',' . 
                           strtoupper($rec['priority']) . ',' . 
                           '"' . $rec['action'] . '"' . "\n";
                }
                $csv .= "\n";
            }

            // Performance Anomalies
            if (!empty($this->insights['performance_anomalies'])) {
                $csv .= "PERFORMANCE ANOMALIES\n";
                foreach ($this->insights['performance_anomalies'] as $anomaly) {
                    $csv .= "- " . $anomaly['title'] . "\n";
                    $csv .= "  " . $anomaly['description'] . "\n";
                }
                $csv .= "\n";
            }

            // Improvement Areas
            if (!empty($this->insights['improvement_areas'])) {
                $csv .= "IMPROVEMENT AREAS\n";
                foreach ($this->insights['improvement_areas'] as $improvement) {
                    $csv .= "- " . $improvement['area'] . " (" . strtoupper($improvement['priority']) . ")\n";
                    $csv .= "  " . $improvement['description'] . "\n";
                    if (!empty($improvement['suggestions'])) {
                        $csv .= "  Suggestions:\n";
                        foreach ($improvement['suggestions'] as $suggestion) {
                            $csv .= "    * " . $suggestion . "\n";
                        }
                    }
                }
                $csv .= "\n";
            }
        }

        // PERFORMANCE TRENDS
        if ($this->historicalSnapshots->count() > 0) {
            $csv .= "HISTORICAL PERFORMANCE TRENDS\n";
            $csv .= "=" . str_repeat("=", 80) . "\n";
            $csv .= "Date,Average Score,Pass Rate,Confidence,Avg Time (min)\n";
            foreach ($this->historicalSnapshots as $snapshot) {
                $csv .= $snapshot->snapshot_date->format('Y-m-d') . "," .
                       $snapshot->average_score . "," .
                       $snapshot->pass_rate . "," .
                       $snapshot->average_confidence . "," .
                       round($snapshot->average_time_spent / 60, 1) . "\n";
            }
            $csv .= "\n";
        }

        // Comparative Analysis
        if (!empty($this->comparison) && $this->comparison['status'] === 'success') {
            $csv .= "COMPARISON WITH PREVIOUS EXAM\n";
            $csv .= "=" . str_repeat("=", 80) . "\n";
            $csv .= "Metric,Previous,Current,Change\n";
            $comp = $this->comparison['comparison'];
            $csv .= "Average Score," . 
                   $comp['average_score']['previous'] . "," . 
                   $comp['average_score']['current'] . "," . 
                   ($comp['average_score']['change'] >= 0 ? '+' : '') . 
                   round($comp['average_score']['change'], 2) . " (" . round($comp['average_score']['change_percent'], 1) . "%)\n";
            $csv .= "Pass Rate," . 
                   $comp['pass_rate']['previous'] . "%," . 
                   $comp['pass_rate']['current'] . "%," . 
                   ($comp['pass_rate']['change'] >= 0 ? '+' : '') . 
                   round($comp['pass_rate']['change'], 1) . "%\n";
            $csv .= "Std Deviation," . 
                   $comp['std_deviation']['previous'] . "," . 
                   $comp['std_deviation']['current'] . "," . 
                   $comp['std_deviation']['trend'] . "\n";
        }

        return $csv;
    }

    public function getPerformanceMetricsAttribute()
    {
        if (!$this->currentSnapshot) return null;

        return [
            'average_score' => $this->currentSnapshot->average_score,
            'median_score' => $this->currentSnapshot->median_score,
            'pass_rate' => $this->currentSnapshot->pass_rate,
            'std_deviation' => $this->currentSnapshot->std_deviation,
        ];
    }

    public function getEngagementMetricsAttribute()
    {
        if (!$this->currentSnapshot) return null;

        return [
            'avg_time' => round($this->currentSnapshot->average_time_spent / 60, 1), // convert to minutes
            'early' => $this->currentSnapshot->early_submissions,
            'last_minute' => $this->currentSnapshot->last_minute_submissions,
        ];
    }

    public function getGradingMetricsAttribute()
    {
        if (!$this->currentSnapshot) return null;

        return [
            'auto_graded' => $this->currentSnapshot->questions_auto_graded,
            'ai_graded' => $this->currentSnapshot->questions_ai_graded,
            'confidence' => $this->currentSnapshot->average_confidence,
            'pending' => $this->currentSnapshot->grades_pending_review,
            'approved' => $this->currentSnapshot->grades_approved,
        ];
    }
}
