<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\AdaptiveRoutingRule;
use App\Services\AdaptiveExamService;
use Livewire\Component;

class AdaptiveExamBuilder extends Component
{
    public Exam $exam;
    public $pools = [];
    public $rules = [];
    public $allQuestions = [];
    public $isAdaptive = false;
    public $adaptiveType = 'branching'; // linear, branching, pool_based
    
    // Pool creation
    public $newPoolName = '';
    public $newPoolDifficulty = 'moderate';
    public $newPoolDescription = '';
    public $showPoolModal = false;
    
    // Rule creation
    public $newRuleName = '';
    public $newRuleSequence = 1;
    public $newRuleThreshold = 0.7;
    public $newRuleOperator = '>=';
    public $newRulePoolId = null;
    public $newRuleQuestionCount = 1;
    public $showRuleModal = false;
    
    // Pool management
    public $selectedPoolForQuestions = null;
    public $selectedQuestions = [];
    public $showAssignModal = false;
    public $editingPoolId = null;
    public $editingRuleId = null;
    
    public $activeTab = 'overview';

    protected AdaptiveExamService $adaptiveService;

    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->adaptiveService = app(AdaptiveExamService::class);
        $this->loadData();
    }

    public function loadData(): void
    {
        $this->isAdaptive = $this->exam->is_adaptive;
        $this->adaptiveType = $this->exam->adaptive_type ?? 'branching';
        $this->pools = $this->adaptiveService->getExamPools($this->exam)->toArray();
        $this->rules = $this->adaptiveService->getExamRoutingRules($this->exam)->toArray();
        $this->allQuestions = $this->exam->questions()->get()->toArray();
    }

    public function toggleAdaptiveMode(): void
    {
        if ($this->isAdaptive) {
            $this->adaptiveService->disableAdaptiveMode($this->exam);
        } else {
            $this->adaptiveService->enableAdaptiveMode($this->exam, $this->adaptiveType);
        }
        $this->isAdaptive = !$this->isAdaptive;
        $this->dispatch('notify', message: 'Adaptive mode ' . ($this->isAdaptive ? 'enabled' : 'disabled'));
    }

    public function createPool(): void
    {
        $this->validate([
            'newPoolName' => 'required|string|max:255',
            'newPoolDifficulty' => 'required|in:easy,moderate,difficult,very_difficult',
        ]);

        $pool = $this->adaptiveService->createPool(
            $this->exam,
            $this->newPoolName,
            $this->newPoolDifficulty,
            $this->newPoolDescription ?: null
        );

        $this->resetPoolForm();
        $this->showPoolModal = false;
        $this->loadData();
        $this->dispatch('notify', message: 'Pool created successfully');
    }

    public function assignQuestionsToPool(): void
    {
        if (!$this->selectedPoolForQuestions || empty($this->selectedQuestions)) {
            return;
        }

        $pool = QuestionPool::find($this->selectedPoolForQuestions);
        $this->adaptiveService->addQuestionsToPool($pool, $this->selectedQuestions);

        $this->selectedPoolForQuestions = null;
        $this->selectedQuestions = [];
        $this->showAssignModal = false;
        $this->loadData();
        $this->dispatch('notify', message: 'Questions assigned to pool');
    }

    public function createRule(): void
    {
        $this->validate([
            'newRuleName' => 'required|string|max:255',
            'newRuleSequence' => 'required|integer|min:1',
            'newRuleThreshold' => 'required|numeric|min:0|max:1',
            'newRuleOperator' => 'required|in:>=,>,<,<=,==',
            'newRulePoolId' => 'required|integer',
            'newRuleQuestionCount' => 'required|integer|min:1',
        ]);

        $pool = QuestionPool::find($this->newRulePoolId);
        
        $this->adaptiveService->createRoutingRule(
            $this->exam,
            $this->newRuleName,
            $this->newRuleSequence,
            $this->newRuleThreshold,
            $this->newRuleOperator,
            $pool,
            $this->newRuleQuestionCount
        );

        $this->resetRuleForm();
        $this->showRuleModal = false;
        $this->loadData();
        $this->dispatch('notify', message: 'Routing rule created');
    }

    public function deletePool($poolId): void
    {
        $pool = QuestionPool::find($poolId);
        if ($pool) {
            $pool->delete();
            $this->loadData();
            $this->dispatch('notify', message: 'Pool deleted');
        }
    }

    public function deleteRule($ruleId): void
    {
        $rule = AdaptiveRoutingRule::find($ruleId);
        if ($rule) {
            $rule->delete();
            $this->loadData();
            $this->dispatch('notify', message: 'Rule deleted');
        }
    }

    public function setActiveTab($tab): void
    {
        $this->activeTab = $tab;
    }

    private function resetPoolForm(): void
    {
        $this->newPoolName = '';
        $this->newPoolDifficulty = 'moderate';
        $this->newPoolDescription = '';
    }

    private function resetRuleForm(): void
    {
        $this->newRuleName = '';
        $this->newRuleSequence = 1;
        $this->newRuleThreshold = 0.7;
        $this->newRuleOperator = '>=';
        $this->newRulePoolId = null;
        $this->newRuleQuestionCount = 1;
    }

    public function render()
    {
        $stats = $this->adaptiveService->getAdaptiveStatistics($this->exam);
        return view('livewire.adaptive-exam-builder', ['stats' => $stats]);
    }
}
