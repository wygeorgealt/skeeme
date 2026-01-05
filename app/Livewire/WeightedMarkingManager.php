<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\Question;
use App\Services\WeightedMarkingService;
use Livewire\Component;

class WeightedMarkingManager extends Component
{
    public Exam $exam;
    public $questions = [];
    public $weights = [];
    public $editingId = null;
    public $newWeight = 1.0;
    public $newTotalMarks = 1;
    public $newNotes = '';
    public $showSettingsModal = false;
    public $distributionMode = 'uniform'; // uniform, custom, by_topic
    public $totalExamMarks = 0;
    public $hasWeights = false;

    protected $listeners = ['refreshWeights'];

    protected WeightedMarkingService $weightingService;

    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->weightingService = app(WeightedMarkingService::class);
        $this->loadWeights();
    }

    public function loadWeights(): void
    {
        $this->questions = $this->exam->questions()->get()->toArray();
        
        $weights = $this->weightingService->getExamWeights($this->exam);
        $this->weights = $weights->keyBy('question_id')->toArray();
        $this->totalExamMarks = $this->weightingService->getTotalPossibleMarks($this->exam);
        $this->hasWeights = $this->weightingService->hasWeightsConfigured($this->exam);
    }

    public function editWeight($questionId): void
    {
        $this->editingId = $questionId;
        
        if (isset($this->weights[$questionId])) {
            $weight = $this->weights[$questionId];
            $this->newWeight = $weight['weight'];
            $this->newTotalMarks = $weight['total_marks'];
            $this->newNotes = $weight['marking_notes'] ?? '';
        }
    }

    public function saveWeight($questionId): void
    {
        $this->validate([
            'newWeight' => 'required|numeric|min:0.1|max:10',
            'newTotalMarks' => 'required|integer|min:1|max:100',
        ]);

        $question = Question::find($questionId);
        
        $this->weightingService->setQuestionWeight(
            $this->exam,
            $question,
            $this->newWeight,
            $this->newTotalMarks,
            $this->newNotes ?: null
        );

        $this->resetEditingForm();
        $this->loadWeights();
        $this->dispatch('notify', message: 'Weight updated successfully');
    }

    public function cancelEdit(): void
    {
        $this->resetEditingForm();
    }

    private function resetEditingForm(): void
    {
        $this->editingId = null;
        $this->newWeight = 1.0;
        $this->newTotalMarks = 1;
        $this->newNotes = '';
    }

    public function applyUniformWeights(): void
    {
        $this->validate(['newTotalMarks' => 'required|integer|min:1']);
        
        $this->weightingService->applyUniformWeights($this->exam, $this->newTotalMarks);
        $this->loadWeights();
        $this->showSettingsModal = false;
        $this->dispatch('notify', message: 'Uniform weights applied');
    }

    public function resetWeights(): void
    {
        $this->weightingService->resetWeights($this->exam);
        $this->loadWeights();
        $this->dispatch('notify', message: 'Weights reset to defaults');
    }

    public function getWeightPercentage($questionId): float
    {
        if ($this->totalExamMarks == 0) {
            return 0;
        }

        if (!isset($this->weights[$questionId])) {
            return 0;
        }

        $weight = $this->weights[$questionId];
        $questionMarks = $weight['weight'] * $weight['total_marks'];
        
        return round(($questionMarks / $this->totalExamMarks) * 100, 2);
    }

    public function getGradeColor($weight): string
    {
        if ($weight >= 0.3) return 'green';
        if ($weight >= 0.15) return 'blue';
        return 'gray';
    }

    public function render()
    {
        return view('livewire.weighted-marking-manager', [
            'weightBreakdown' => $this->weightingService->getWeightBreakdown($this->exam),
        ]);
    }
}
