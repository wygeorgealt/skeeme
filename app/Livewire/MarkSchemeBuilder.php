<?php

namespace App\Livewire;

use App\Models\MarkScheme;
use App\Models\MarkSchemeItem;
use App\Models\Question;
use Illuminate\Support\Collection;
use Livewire\Component;

class MarkSchemeBuilder extends Component
{
    public ?MarkScheme $scheme = null;
    public $schemeName = '';
    public $schemeDescription = '';
    public $schemeInstructions = '';
    public $totalMarks = 10;
    public $isPublic = false;
    public $items = [];
    public $newItemLevel = '';
    public $newItemName = '';
    public $newItemCriteria = '';
    public $newItemMarks = '';
    public $newItemExamples = '';
    public $editingItemId = null;
    public $showCloneModal = false;
    public $cloneName = '';
    public $showAssignModal = false;
    public $selectedQuestions = [];
    public $allQuestions = [];
    public $schemesList = [];
    public $activeTab = 'items'; // items, assignments, preview

    protected $listeners = ['refreshSchemes'];

    public function mount(?MarkScheme $scheme = null)
    {
        if ($scheme) {
            $this->loadScheme($scheme);
        }
        $this->loadSchemesList();
    }

    public function loadScheme(MarkScheme $scheme): void
    {
        $this->scheme = $scheme;
        $this->schemeName = $scheme->name;
        $this->schemeDescription = $scheme->description;
        $this->schemeInstructions = $scheme->instructions;
        $this->totalMarks = $scheme->total_marks;
        $this->isPublic = $scheme->is_public;
        $this->items = $scheme->items()->get()->map(fn($item) => [
            'id' => $item->id,
            'level' => $item->level,
            'level_name' => $item->level_name,
            'criteria' => $item->criteria,
            'marks_awarded' => $item->marks_awarded,
            'examples' => $item->examples,
            'sort_order' => $item->sort_order,
        ])->toArray();
    }

    public function loadSchemesList(): void
    {
        $this->schemesList = auth()->user()->markSchemes()->get()->toArray();
        $this->allQuestions = Question::with('exam')->get()->toArray();
    }

    public function createScheme(): void
    {
        $this->validate([
            'schemeName' => 'required|string|max:255',
            'totalMarks' => 'required|integer|min:1|max:100',
        ]);

        $scheme = auth()->user()->markSchemes()->create([
            'name' => $this->schemeName,
            'description' => $this->schemeDescription ?: null,
            'instructions' => $this->schemeInstructions ?: null,
            'total_marks' => $this->totalMarks,
            'is_public' => $this->isPublic,
        ]);

        $this->scheme = $scheme;
        $this->dispatch('notify', message: 'Mark scheme created successfully');
    }

    public function updateScheme(): void
    {
        if (!$this->scheme) {
            return;
        }

        $this->validate([
            'schemeName' => 'required|string|max:255',
            'totalMarks' => 'required|integer|min:1|max:100',
        ]);

        $this->scheme->update([
            'name' => $this->schemeName,
            'description' => $this->schemeDescription ?: null,
            'instructions' => $this->schemeInstructions ?: null,
            'total_marks' => $this->totalMarks,
            'is_public' => $this->isPublic,
        ]);

        $this->dispatch('notify', message: 'Mark scheme updated successfully');
    }

    public function addItem(): void
    {
        $this->validate([
            'newItemLevel' => 'required|integer|min:0',
            'newItemName' => 'required|string|max:255',
            'newItemCriteria' => 'required|string',
            'newItemMarks' => 'required|integer|min:0',
        ]);

        if (!$this->scheme) {
            $this->createScheme();
        }

        $this->scheme->addItem(
            (int)$this->newItemLevel,
            $this->newItemName,
            $this->newItemCriteria,
            (int)$this->newItemMarks,
            $this->newItemExamples ?: null
        );

        $this->resetItemForm();
        $this->loadScheme($this->scheme);
        $this->dispatch('notify', message: 'Item added successfully');
    }

    public function editItem($itemId): void
    {
        $item = MarkSchemeItem::find($itemId);
        if ($item) {
            $this->editingItemId = $itemId;
            $this->newItemLevel = $item->level;
            $this->newItemName = $item->level_name;
            $this->newItemCriteria = $item->criteria;
            $this->newItemMarks = $item->marks_awarded;
            $this->newItemExamples = $item->examples;
        }
    }

    public function saveItem(): void
    {
        $this->validate([
            'newItemLevel' => 'required|integer|min:0',
            'newItemName' => 'required|string|max:255',
            'newItemCriteria' => 'required|string',
            'newItemMarks' => 'required|integer|min:0',
        ]);

        MarkSchemeItem::find($this->editingItemId)->update([
            'level' => (int)$this->newItemLevel,
            'level_name' => $this->newItemName,
            'criteria' => $this->newItemCriteria,
            'marks_awarded' => (int)$this->newItemMarks,
            'examples' => $this->newItemExamples ?: null,
        ]);

        $this->resetItemForm();
        $this->loadScheme($this->scheme);
        $this->dispatch('notify', message: 'Item updated successfully');
    }

    public function deleteItem($itemId): void
    {
        MarkSchemeItem::find($itemId)->delete();
        $this->loadScheme($this->scheme);
        $this->dispatch('notify', message: 'Item deleted successfully');
    }

    public function cloneScheme(): void
    {
        if (!$this->scheme) {
            return;
        }

        $this->validate(['cloneName' => 'required|string|max:255']);

        $cloned = $this->scheme->clone(auth()->user(), $this->cloneName);
        $this->loadScheme($cloned);
        $this->showCloneModal = false;
        $this->cloneName = '';
        $this->dispatch('notify', message: 'Mark scheme cloned successfully');
    }

    public function assignToQuestions(): void
    {
        if (!$this->scheme || empty($this->selectedQuestions)) {
            return;
        }

        foreach ($this->selectedQuestions as $questionId) {
            $this->scheme->questions()->attach($questionId);
        }

        $this->showAssignModal = false;
        $this->selectedQuestions = [];
        $this->dispatch('notify', message: 'Scheme assigned to questions');
    }

    public function resetItemForm(): void
    {
        $this->newItemLevel = '';
        $this->newItemName = '';
        $this->newItemCriteria = '';
        $this->newItemMarks = '';
        $this->newItemExamples = '';
        $this->editingItemId = null;
    }

    public function setActiveTab($tab): void
    {
        $this->activeTab = $tab;
    }

    public function render()
    {
        return view('livewire.mark-scheme-builder', [
            'assignedQuestions' => $this->scheme?->questions()->get() ?? collect(),
        ]);
    }
}
