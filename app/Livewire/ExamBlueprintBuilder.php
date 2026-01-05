<?php

namespace App\Livewire;

use App\Models\Exam;
use App\Models\ExamBlueprint;
use App\Models\BlueprintRequirement;
use Livewire\Component;

class ExamBlueprintBuilder extends Component
{
    public Exam $exam;
    public ?ExamBlueprint $blueprint = null;
    
    public string $blueprintName = '';
    public string $blueprintDescription = '';
    public int $totalQuestions = 0;
    public float $totalMarks = 0;
    
    public array $difficulties = ['easy' => 0, 'medium' => 0, 'hard' => 0];
    public array $questionTypes = [];
    public array $topics = [];
    public array $requirements = [];
    
    public bool $showBlueprintForm = false;
    public bool $showRequirementForm = false;
    public bool $showComplianceCheck = false;
    
    public float $complianceScore = 0;
    public array $complianceDetails = [];

    public function mount(Exam $exam)
    {
        $this->exam = $exam;
        $this->blueprint = $exam->blueprint;
        
        if ($this->blueprint) {
            $this->loadBlueprintData();
        }

        $this->loadAvailableOptions();
    }

    /**
     * Load blueprint data into form
     */
    private function loadBlueprintData(): void
    {
        if (!$this->blueprint) {
            return;
        }

        $this->blueprintName = $this->blueprint->name;
        $this->blueprintDescription = $this->blueprint->description ?? '';
        $this->totalQuestions = $this->blueprint->total_questions;
        $this->totalMarks = $this->blueprint->total_marks;
        
        $this->difficulties = $this->blueprint->difficulty_distribution ?? ['easy' => 0, 'medium' => 0, 'hard' => 0];
        $this->questionTypes = $this->blueprint->question_type_distribution ?? [];
        $this->topics = $this->blueprint->topic_distribution ?? [];
        
        $this->requirements = $this->blueprint->requirements()
            ->get()
            ->map(fn($req) => [
                'id' => $req->id,
                'topic' => $req->topic,
                'difficulty' => $req->difficulty_level,
                'type' => $req->question_type,
                'count' => $req->required_count,
                'marks' => $req->required_marks,
            ])
            ->toArray();
    }

    /**
     * Load available topics and question types
     */
    private function loadAvailableOptions(): void
    {
        // Get unique topics from course questions
        $this->topics = $this->exam->course->questions()
            ->distinct('topic')
            ->pluck('topic')
            ->filter()
            ->toArray();

        // Get unique question types
        $this->questionTypes = $this->exam->questions()
            ->distinct('question_type')
            ->pluck('question_type')
            ->toArray();
    }

    /**
     * Create or update blueprint
     */
    public function saveBlueprintDefaults()
    {
        $this->validate([
            'blueprintName' => 'required|string|max:255',
            'totalQuestions' => 'required|integer|min:1',
            'totalMarks' => 'required|numeric|min:0',
        ]);

        // Validate difficulty percentages sum to 100
        $diffSum = array_sum($this->difficulties);
        if ($diffSum != 100) {
            session()->flash('error', 'Difficulty distribution must sum to 100%');
            return;
        }

        // Validate question type percentages sum to 100
        if (!empty($this->questionTypes)) {
            $typeSum = array_sum($this->questionTypes);
            if ($typeSum != 100) {
                session()->flash('error', 'Question type distribution must sum to 100%');
                return;
            }
        }

        // Validate topic percentages sum to 100
        if (!empty($this->topics)) {
            $topicSum = array_sum($this->topics);
            if ($topicSum != 100) {
                session()->flash('error', 'Topic distribution must sum to 100%');
                return;
            }
        }

        $this->blueprint = ExamBlueprint::updateOrCreate(
            ['exam_id' => $this->exam->id],
            [
                'name' => $this->blueprintName,
                'description' => $this->blueprintDescription,
                'total_questions' => $this->totalQuestions,
                'total_marks' => $this->totalMarks,
                'difficulty_distribution' => $this->difficulties,
                'question_type_distribution' => $this->questionTypes,
                'topic_distribution' => $this->topics,
            ]
        );

        session()->flash('success', 'Blueprint saved successfully!');
        $this->showBlueprintForm = false;
    }

    /**
     * Add requirement to blueprint
     */
    public function addRequirement($topic, $difficulty, $type, $count = 1, $marks = 1)
    {
        if (!$this->blueprint) {
            session()->flash('error', 'Please create a blueprint first');
            return;
        }

        BlueprintRequirement::create([
            'exam_blueprint_id' => $this->blueprint->id,
            'topic' => $topic,
            'difficulty_level' => $difficulty,
            'question_type' => $type,
            'required_count' => $count,
            'required_marks' => $marks,
        ]);

        $this->loadBlueprintData();
        session()->flash('success', 'Requirement added!');
        $this->showRequirementForm = false;
    }

    /**
     * Remove requirement
     */
    public function removeRequirement($requirementId)
    {
        BlueprintRequirement::destroy($requirementId);
        $this->loadBlueprintData();
        session()->flash('success', 'Requirement removed!');
    }

    /**
     * Check exam compliance with blueprint
     */
    public function checkCompliance()
    {
        if (!$this->blueprint) {
            session()->flash('error', 'No blueprint to check compliance against');
            return;
        }

        $this->complianceScore = $this->blueprint->getComplianceScore();
        
        // Generate compliance details
        $questions = $this->exam->questions;
        $this->complianceDetails = [
            'total_questions' => [
                'required' => $this->blueprint->total_questions,
                'actual' => $questions->count(),
                'met' => abs($questions->count() - $this->blueprint->total_questions) <= 1,
            ],
            'total_marks' => [
                'required' => $this->blueprint->total_marks,
                'actual' => $questions->sum('marks'),
                'met' => abs($questions->sum('marks') - $this->blueprint->total_marks) <= 1,
            ],
            'difficulties' => $this->getDifficultyCompliance(),
            'question_types' => $this->getTypeCompliance(),
            'topics' => $this->getTopicCompliance(),
        ];

        $this->showComplianceCheck = true;
    }

    /**
     * Get difficulty level compliance
     */
    private function getDifficultyCompliance(): array
    {
        $questions = $this->exam->questions;
        $diffCount = $questions->groupBy('difficulty_level')->map->count();
        
        $compliance = [];
        foreach ($this->difficulties as $difficulty => $percentage) {
            $expected = ceil(($percentage / 100) * $this->blueprint->total_questions);
            $actual = $diffCount[$difficulty] ?? 0;
            $compliance[$difficulty] = [
                'percentage' => $percentage,
                'expected' => $expected,
                'actual' => $actual,
                'met' => abs($actual - $expected) <= 1,
            ];
        }
        
        return $compliance;
    }

    /**
     * Get question type compliance
     */
    private function getTypeCompliance(): array
    {
        $questions = $this->exam->questions;
        $typeCount = $questions->groupBy('question_type')->map->count();
        
        $compliance = [];
        foreach ($this->questionTypes as $type => $percentage) {
            $expected = ceil(($percentage / 100) * $this->blueprint->total_questions);
            $actual = $typeCount[$type] ?? 0;
            $compliance[$type] = [
                'percentage' => $percentage,
                'expected' => $expected,
                'actual' => $actual,
                'met' => abs($actual - $expected) <= 1,
            ];
        }
        
        return $compliance;
    }

    /**
     * Get topic compliance
     */
    private function getTopicCompliance(): array
    {
        $questions = $this->exam->questions;
        $topicCount = $questions->groupBy('topic')->map->count();
        
        $compliance = [];
        foreach ($this->topics as $topic => $percentage) {
            $expected = ceil(($percentage / 100) * $this->blueprint->total_questions);
            $actual = $topicCount[$topic] ?? 0;
            $compliance[$topic] = [
                'percentage' => $percentage,
                'expected' => $expected,
                'actual' => $actual,
                'met' => abs($actual - $expected) <= 1,
            ];
        }
        
        return $compliance;
    }

    public function render()
    {
        return view('livewire.exam-blueprint-builder', [
            'blueprint' => $this->blueprint,
            'availableTopics' => $this->getAvailableTopics(),
            'availableTypes' => $this->questionTypes,
            'complianceScore' => $this->complianceScore,
            'complianceDetails' => $this->complianceDetails,
        ]);
    }

    /**
     * Get topics available in course
     */
    private function getAvailableTopics(): array
    {
        return $this->exam->course->questions()
            ->distinct('topic')
            ->pluck('topic')
            ->filter()
            ->toArray();
    }
}
