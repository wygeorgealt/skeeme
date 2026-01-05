<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\Question;
use App\Services\ItemAnalysisService;
use Livewire\Component;
use Livewire\Attributes\Computed;

class LecturerItemAnalysis extends Component
{
    public Exam $exam;
    public ItemAnalysisService $analysisService;
    
    public string $selectedQuestionId = '';
    public array $itemAnalyses = [];
    public array $examSummary = [];
    public bool $showRecommendations = true;
    public string $sortBy = 'difficulty'; // difficulty, discrimination, order
    public bool $showProblematicOnly = false;
    
    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->analysisService = app(ItemAnalysisService::class);
        
        // Load all item analyses
        $this->loadAnalyses();
        
        // Select first question by default
        if (!empty($this->itemAnalyses)) {
            $this->selectedQuestionId = (string) $this->itemAnalyses[0]['question_id'];
        }
    }
    
    public function loadAnalyses()
    {
        try {
            // Get comprehensive item analysis for entire exam
            $analysis = $this->analysisService->getExamItemAnalysis($this->exam);
            
            if (!$analysis || empty($analysis['questions'])) {
                $this->itemAnalyses = [];
                $this->examSummary = [];
                return;
            }
            
            // Store individual item analyses
            $this->itemAnalyses = collect($analysis['questions'])
                ->map(function ($item) {
                    return [
                        'question_id' => $item['question_id'] ?? null,
                        'question_text' => $item['question_text'] ?? 'Untitled Question',
                        'difficulty_index' => $item['difficulty_index'] ?? 0,
                        'difficulty_label' => $item['difficulty_label'] ?? 'Unknown',
                        'discrimination_index' => $item['discrimination_index'] ?? 0,
                        'discrimination_label' => $item['discrimination_label'] ?? 'Unknown',
                        'response_distribution' => $item['response_distribution'] ?? [],
                        'assessment' => $item['assessment'] ?? 'Not Assessed',
                        'recommendation' => $item['recommendation'] ?? 'No specific recommendations',
                        'correct_answer_count' => $item['correct_answer_count'] ?? 0,
                        'total_attempts' => $item['total_attempts'] ?? 0,
                    ];
                })
                ->all();
            
            // Store exam summary
            $this->examSummary = [
                'average_difficulty' => $analysis['average_difficulty'] ?? 0,
                'average_discrimination' => $analysis['average_discrimination'] ?? 0,
                'total_questions' => $analysis['total_questions'] ?? 0,
                'graded_sessions' => $analysis['graded_sessions'] ?? 0,
                'problematic_count' => $analysis['problematic_count'] ?? 0,
                'recommendations' => $analysis['recommendations'] ?? [],
                'overall_quality' => $analysis['overall_quality'] ?? 'Not Assessed',
            ];
            
        } catch (\Exception $e) {
            $this->itemAnalyses = [];
            $this->examSummary = [
                'error' => 'Unable to load item analysis. ' . $e->getMessage(),
                'total_questions' => $this->exam->questions()->count(),
            ];
        }
    }
    
    #[Computed]
    public function filteredAndSortedItems()
    {
        $items = collect($this->itemAnalyses);
        
        // Filter problematic only if requested
        if ($this->showProblematicOnly) {
            $items = $items->filter(function ($item) {
                return in_array($item['assessment'], ['Problematic', 'Poor']);
            });
        }
        
        // Sort by selected criteria
        $items = match($this->sortBy) {
            'discrimination' => $items->sortByDesc('discrimination_index'),
            'difficulty' => $items->sortByDesc('difficulty_index'),
            default => $items->sort(), // original order
        };
        
        return $items->values()->all();
    }
    
    #[Computed]
    public function selectedItem()
    {
        if (empty($this->selectedQuestionId)) {
            return null;
        }
        
        return collect($this->itemAnalyses)
            ->firstWhere('question_id', $this->selectedQuestionId);
    }
    
    public function selectQuestion(string $questionId)
    {
        $this->selectedQuestionId = $questionId;
    }
    
    public function toggleRecommendations()
    {
        $this->showRecommendations = !$this->showRecommendations;
    }
    
    public function toggleProblematicFilter()
    {
        $this->showProblematicOnly = !$this->showProblematicOnly;
    }
    
    public function setSortBy(string $sortBy)
    {
        $this->sortBy = $sortBy;
    }
    
    public function refreshAnalysis()
    {
        $this->loadAnalyses();
        $this->dispatch('notify', message: 'Item analysis refreshed');
    }
    
    /**
     * Get assessment badge color
     */
    public function getAssessmentColor(string $assessment): string
    {
        return match($assessment) {
            'Good' => 'bg-green-100 text-green-800',
            'Acceptable' => 'bg-blue-100 text-blue-800',
            'Marginal' => 'bg-yellow-100 text-yellow-800',
            'Problematic' => 'bg-orange-100 text-orange-800',
            'Poor' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
    
    /**
     * Get difficulty color
     */
    public function getDifficultyColor(float $index): string
    {
        if ($index < 0.25) return 'text-red-600';     // Very Difficult
        if ($index < 0.45) return 'text-orange-600';  // Difficult
        if ($index < 0.55) return 'text-yellow-600';  // Moderate
        if ($index < 0.75) return 'text-green-600';   // Easy
        return 'text-green-500';                       // Very Easy
    }
    
    /**
     * Get discrimination color
     */
    public function getDiscriminationColor(float $index): string
    {
        if ($index < 0) return 'text-red-600';      // Negative
        if ($index < 0.1) return 'text-orange-600'; // Poor
        if ($index < 0.2) return 'text-yellow-600'; // Marginal
        if ($index < 0.3) return 'text-blue-600';   // Acceptable
        return 'text-green-600';                     // Good/Excellent
    }
    
    /**
     * Format percentage for display
     */
    public function formatPercentage(float $value, int $decimals = 1): string
    {
        return number_format($value * 100, $decimals) . '%';
    }
    
    /**
     * Get response percentage for an option
     */
    public function getResponsePercentage(array $distribution, string $key): string
    {
        $total = array_sum($distribution);
        if ($total === 0) return '0%';
        
        $percentage = ($distribution[$key] ?? 0) / $total;
        return $this->formatPercentage($percentage);
    }
    
    public function render()
    {
        return view('livewire.lecturer-item-analysis', [
            'filteredItems' => $this->filteredAndSortedItems(),
            'selectedItem' => $this->selectedItem,
            'examSummary' => $this->examSummary,
        ]);
    }
}
