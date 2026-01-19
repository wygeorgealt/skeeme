<?php

namespace App\Livewire\Landing;

use Livewire\Component;
use App\Models\User;
use App\Services\DeepseekAIService;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use Livewire\WithFileUploads;
use App\Services\FileExtractionService;

class StudentAiProduct extends Component
{
    use WithFileUploads;

    public $topic = '';
    public $generatedQuestions = [];
    public $isGenerating = false;
    public $showSignupModal = false;
    public $showUpgradeModal = false;
    public $file;
    
    public $questionCount = 10;
    public $questionTypes = ['multiple_choice'];
    public $selectedAnswers = []; // Tracks index => selected_option

    // Cookie name for guest tracking
    const GUEST_COOKIE = 'skeeme_guest_quiz_usage';

    public function selectAnswer($index, $option)
    {
        // Only allow selecting if not already answered
        if (!isset($this->selectedAnswers[$index])) {
            $this->selectedAnswers[$index] = $option;
        }
    }

    public function updatedQuestionCount($value)
    {
        if (empty($value)) return;
        
        if ($value > 50) {
            $this->questionCount = 50;
        } elseif ($value < 10) {
            $this->questionCount = 10;
        }
    }

    public function mount()
    {
        // Check if coming back from login
        if (session()->has('open_quiz_modal')) {
            // maybe later restore state
        }
    }

    public function generate(DeepseekAIService $aiService, FileExtractionService $extractionService)
    {
        $this->validate([
            'topic' => 'required_without:file|nullable|max:100',
            'file' => 'required_without:topic|nullable|file|mimes:pdf,docx,txt,md|max:10240', // 10MB limit
            'questionCount' => 'required|integer|min:10|max:50',
            'questionTypes' => 'required|array|min:1',
        ]);

        if (!$this->checkAccess()) {
            return;
        }

        $this->isGenerating = true;
        $this->selectedAnswers = []; // Reset selections

        try {
            $sourceContent = '';

            // Handle File Extraction if present
            if ($this->file) {
                $sourceContent = $extractionService->extractText($this->file->getRealPath());
                
                if (!$sourceContent) {
                    throw new \Exception("Could not extract text from the uploaded file.");
                }
            } else {
                $sourceContent = $this->topic;
            }

            // Map UI types to Service types
            $types = [];
            foreach ($this->questionTypes as $type) {
                if ($type === 'mcq') $types[] = 'multiple_choice';
                if ($type === 'theory') $types[] = 'essay';
            }
            
            // Call AI Service
            $questions = $aiService->generateQuestions(
                [$sourceContent], 
                $this->questionCount, 
                'medium', 
                $types ?: ['multiple_choice'], 
                $this->topic 
            );

            // Shuffling Logic
            foreach ($questions as &$q) {
                if ($q['question_type'] === 'multiple_choice' && !empty($q['options'])) {
                    $originalCorrectKey = $q['correct_answer']; // e.g. "A"
                    $keyMap = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'E' => 4];
                    $correctIndex = $keyMap[strtoupper($originalCorrectKey)] ?? 0;
                    
                    // Get the actual text of the correct answer
                    $correctText = $q['options'][$correctIndex] ?? $q['options'][0] ?? '';
                    
                    // Shuffle options
                    shuffle($q['options']);
                    
                    // Store the text instead of the letter for easier validation
                    $q['correct_answer'] = $correctText;
                }
            }

            $this->generatedQuestions = $questions;
            
            // Deduct usage
            $this->deductUsage();

            // Clear file after successful generation
            $this->file = null;

        } catch (\Exception $e) {
            Log::error("Quiz Gen Error: " . $e->getMessage());
            $this->dispatch('showToastr', [
                'type' => 'error',
                'message' => 'Failed to generate quiz. ' . $e->getMessage()
            ]);
        } finally {
            $this->isGenerating = false;
        }
    }

    public function resetQuestions()
    {
        $this->generatedQuestions = [];
        $this->selectedAnswers = [];
    }
    
    public function checkAccess()
    {
        // Developer Exclusion for local testing
        if (app()->environment('local')) {
            return true;
        }

        // 1. If Guest
        if (!Auth::check()) {
            $usage = Cookie::get(self::GUEST_COOKIE, 0);
            if ($usage >= 1) {
                $this->showSignupModal = true;
                return false;
            }

            // Guests cannot use file uploads (Advanced Feature)
            if ($this->file) {
                $this->showSignupModal = true; 
                return false;
            }

            return true;
        }

        // 2. If Logged In User
        $user = Auth::user();
        
        // Unlimited Plan
        if ($user->is_unlimited_student) {
            return true;
        }

        // Free Plan (Credit Check)
        // Cost: 50 credits per generation
        if ($user->credits < 50) {
            $this->showUpgradeModal = true;
            return false;
        }

        // Allowed to use files if registered (Credits deducted)
        return true;
    }

    public function deductUsage()
    {
        // 1. Guest
        if (!Auth::check()) {
            // Set cookie for 1 year efficiently
            Cookie::queue(self::GUEST_COOKIE, 1, 525600); // 1 year
            return;
        }

        // 2. Logged In
        $user = Auth::user();
        if (!$user->is_unlimited_student) {
            $user->decrement('credits', 50);
        }
    }

    public function render()
    {
        return view('livewire.landing.student-ai-generator');
    }
}
