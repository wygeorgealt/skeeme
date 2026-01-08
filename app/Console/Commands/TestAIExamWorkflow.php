<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class TestAIExamWorkflow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exam:test-ai-workflow';


    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the full AI exam workflow: generation, simulation, AI grading, and manual review.';

    /**
     * Execute the console command.
     */
    public function handle(\App\Services\AIQuestionGeneratorService $generator, \App\Services\AIGradingService $grader)
    {
        $this->info('Starting End-to-End AI Exam Workflow Test...');

        // 1. Setup Student
        $studentEmail = 'parma.mahomes@skeeme.com';
        $student = \App\Models\User::where('email', $studentEmail)->first();
        if (!$student) {
            $this->error("Student $studentEmail not found.");
            return;
        }
        $this->info("Found Student: {$student->name}");

        // 2. Setup Course & Lecturer
        $lecturer = \App\Models\User::where('role', 'lecturer')->first();
        if (!$lecturer) {
            $this->error('No lecturer found to assign to test.');
            return;
        }

        $course = \App\Models\Course::firstOrCreate(
            ['name' => 'AI System Testing 101'],
            [
                'code' => 'AI101',
                'description' => 'A course created for AI workflow testing.',
                'school_id' => $student->school_id,
                'created_by' => $lecturer->id,
            ]
        );
        $this->info("Using Course: {$course->name}");

        // 3. Create Question Pool and Questions Manually
        $pool = \App\Models\QuestionPool::create([
            'course_id' => $course->id,
            'lecturer_id' => $lecturer->id,
            'name' => 'Photosynthesis Test Pool',
            'description' => 'Internal test pool for AI generation.',
            'status' => 'published',
        ]);

        $this->info('Creating test questions manually...');
        
        // Create 3 questions: 1 MCQ, 2 Theory
        $questions = [];
        
        // Question 1: MCQ
        $questions[] = \App\Models\Question::create([
            'question_pool_id' => $pool->id,
            'question_type' => 'multiple_choice',
            'question_text' => 'What is the primary function of chlorophyll in photosynthesis?',
            'options' => [
                ['id' => 'A', 'text' => 'To absorb sunlight', 'is_correct' => true],
                ['id' => 'B', 'text' => 'To produce oxygen', 'is_correct' => false],
                ['id' => 'C', 'text' => 'To store energy', 'is_correct' => false],
                ['id' => 'D', 'text' => 'To release carbon dioxide', 'is_correct' => false],
            ],
            'correct_answer' => ['A'],
            'marks' => 10,
            'bloom_level' => 'understand',
            'status' => 'published',
        ]);

        // Question 2: Theory (with model answer)
        $questions[] = \App\Models\Question::create([
            'question_pool_id' => $pool->id,
            'question_type' => 'essay',
            'question_text' => 'Explain the role of carbon dioxide in photosynthesis.',
            'correct_answer' => [
                'model_answer' => 'Carbon dioxide is one of the essential raw materials for photosynthesis. Plants absorb CO2 from the atmosphere through stomata in their leaves. During the light-independent reactions (Calvin cycle), CO2 is fixed and converted into glucose using the energy from ATP and NADPH produced in the light-dependent reactions.',
                'rubric' => [
                    'completeness' => 3,
                    'accuracy' => 4,
                    'clarity' => 3
                ]
            ],
            'marks' => 10,
            'bloom_level' => 'apply',
            'status' => 'published',
        ]);

        // Question 3: Theory (another one)
        $questions[] = \App\Models\Question::create([
            'question_pool_id' => $pool->id,
            'question_type' => 'essay',
            'question_text' => 'Describe what happens in the chloroplasts during photosynthesis.',
            'correct_answer' => [
                'model_answer' => 'Chloroplasts are the sites of photosynthesis. They contain chlorophyll which absorbs light energy. The light-dependent reactions occur in the thylakoid membranes where water is split, oxygen is released, and ATP and NADPH are produced. The light-independent reactions (Calvin cycle) occur in the stroma where CO2 is fixed to produce glucose.',
                'rubric' => [
                    'completeness' => 4,
                    'accuracy' => 4,
                    'reasoning' => 2
                ]
            ],
            'marks' => 10,
            'bloom_level' => 'analyze',
            'status' => 'published',
        ]);

        $this->info('Created ' . count($questions) . ' test questions.');

        // 4. Create Exam
        $exam = \App\Models\Exam::create([
            'course_id' => $course->id,
            'lecturer_id' => $lecturer->id,
            'title' => 'Biology: Photosynthesis Quiz',
            'description' => 'A test to verify AI grading capabilities.',
            'exam_date' => now()->addDays(1),
            'end_date' => now()->addDays(2),
            'total_marks' => 30, // 3 questions, 10 marks each
            'duration' => 60,
            'status' => 'published',
            'release_results_immediately' => false,
            'questions' => collect($questions)->map(function($q, $index) {
                return [
                    'id' => $q->id,
                    'type' => $q->question_type,
                    'text' => $q->question_text,
                    'marks' => 10,
                    'options' => $q->options,
                    'correct_answer' => $q->correct_answer,
                    'index' => $index
                ];
            })->toArray()
        ]);
        $this->info("Created Exam: {$exam->title}");

        // 5. Simulate Student Attempt
        $session = \App\Models\ExamSession::create([
            'exam_id' => $exam->id,
            'student_id' => $student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $this->info('Simulating student answers...');
        
        foreach ($questions as $index => $q) {
            $studentAnswer = '';
            if ($q->question_type === 'multiple_choice') {
                // Get correct option id
                $correctOption = collect($q->options)->firstWhere('is_correct', true);
                $studentAnswer = $correctOption['id'] ?? 'A';
            } elseif ($index === 1) {
                // First Theory: Partially Correct/Vague
                $studentAnswer = "It uses sunlight to make energy and maybe some gas called carbon dioxide.";
            } else {
                // Second Theory: Totally Wrong/Irrelevant
                $studentAnswer = "I think photosynthesis is about how cars drive using fuel.";
            }

            \App\Models\ExamAnswer::create([
                'exam_session_id' => $session->id,
                'question_id' => $q->id,
                'question_index' => $index,
                'student_answer' => $studentAnswer,
            ]);
        }

        $session->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'questions_answered' => 3
        ]);
        $this->info('Student attempt submitted.');

        // 6. AI Grading
        $this->info('Starting AI Grading...');
        $gradingResults = $grader->gradeSession($session);

        $this->info("AI Grading Complete. Score: {$session->score}/30");
        foreach ($session->examAnswers as $ans) {
            $this->line("  Q{$ans->question_index} ({$ans->marking_status}): {$ans->marks_obtained} marks - Feedback: " . Str::limit($ans->feedback, 50));
        }

        // 7. Simulate Lecturer Review
        $this->info('Simulating Lecturer Manual Review...');
        $firstTheory = $session->examAnswers->where('question_index', 1)->first();
        if ($firstTheory) {
            $firstTheory->update([
                'marks_obtained' => 7.0, // Overriding AI from 1.5 to 7
                'feedback' => 'Good understanding of CO2 role. You correctly identified it as a raw material. More detail on the Calvin cycle would improve your answer.',
                'marking_status' => 'manual_graded'
            ]);
            $this->info('Manually adjusted Q1 score from 1.5 to 7.0 marks.');
        }

        // Recalculate and Publish
        $newTotal = $session->examAnswers->sum('marks_obtained');
        $session->update([
            'score' => $newTotal,
            'status' => 'graded',
            'graded_at' => now()
        ]);

        $this->info("Final Score: {$session->score}/30 (Status: {$session->status})");
        $this->info('Test Workflow Completed Successfully!');
        $this->info('');
        $this->info('Summary:');
        $this->info('  - MCQ: 10/10 (auto-graded)');
        $this->info('  - Theory 1: 7/10 (AI: 1.5, Lecturer Override: 7.0)');
        $this->info('  - Theory 2: 0/10 (AI-graded, totally wrong answer)');
    }
}
