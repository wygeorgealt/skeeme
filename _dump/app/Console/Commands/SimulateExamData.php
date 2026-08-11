<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Exam;
use App\Models\Course;
use App\Models\User;
use App\Models\ExamSession;
use App\Models\ExamAnswer;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Services\DeepseekAIService;
use App\Models\ExamQuestion;
use App\Models\AIGrading;
use App\Models\Grade;

class SimulateExamData extends Command
{
    protected $signature = 'skeeme:simulate-exams {--clear : Clear existing data before simulating}';
    protected $description = 'Simulate exam data for testing lecturer grading';

    public function handle(DeepseekAIService $aiService)
    {
        $lecturer = User::where('email', 'lecturer1@pro.com')->first();
        if (!$lecturer) {
            $this->error('Lecturer not found.');
            return;
        }

        $course = Course::where('name', 'like', '%Computer Science%')->first();
        if (!$course) {
            $this->error('Computer Science course not found.');
            return;
        }

        if ($this->option('clear')) {
            $this->info('Clearing existing exam data...');
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            ExamAnswer::truncate();
            AIGrading::truncate();
            Grade::truncate();
            ExamSession::truncate();
            ExamQuestion::truncate();
            // We usually keep the questions in the bank but for "clear" we might want to wipe them if they were simulated
            Question::where('source', 'ai_generated')->delete(); 
            Exam::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->info('Generating high-fidelity questions via AI...');
        $topic = "Introduction to Computer Science (Binary, Logic Gates, Algorithms, Complexity, Data Structures)";
        
        try {
            $aiQuestions = $aiService->generateQuestions(
                [$topic],
                5,
                'mixed',
                ['multiple_choice', 'essay', 'short_answer', 'true_false']
            );
        } catch (\Exception $e) {
            $this->error('AI Question Generation failed: ' . $e->getMessage());
            $this->info('Falling back to static data...');
            $aiQuestions = $this->getFallbackQuestions();
        }

        $this->info('Creating exam...');
        $exam = Exam::create([
            'course_id' => $course->id,
            'lecturer_id' => $lecturer->id,
            'title' => 'Introduction to Computer Science (Final Exam)',
            'description' => 'A comprehensive final assessment covering the core principles of computer science.',
            'exam_date' => now()->subDays(1),
            'end_date' => now()->addDays(7),
            'duration' => 90,
            'total_marks' => count($aiQuestions) * 10,
            'passing_marks' => (count($aiQuestions) * 10) * 0.4,
            'status' => 'published',
            'release_results_immediately' => false,
        ]);

        $this->info('Adding AI-generated questions to exam...');
        $savedQuestions = [];
        foreach ($aiQuestions as $idx => $qData) {
            $question = Question::create([
                'question_text' => $qData['question_text'],
                'question_type' => $qData['question_type'],
                'difficulty_level' => $qData['difficulty_level'] ?? 'medium',
                'options' => $qData['options'],
                'correct_answer' => $qData['correct_answer'],
                'explanation' => $qData['explanation'] ?? '',
                'created_by' => $lecturer->id,
                'source' => 'ai_generated',
            ]);

            ExamQuestion::create([
                'exam_id' => $exam->id,
                'question_id' => $question->id,
                'order' => $idx + 1,
                'marks' => 10,
            ]);

            // Generate answer variations (Personas)
            $this->info("Generating answer personas for: " . Str::limit($qData['question_text'], 30));
            $savedQuestions[] = [
                'model' => $question,
                'personas' => $this->generateAnswerPersonas($aiService, $qData)
            ];
        }

        $students = User::where('role', 'student')
            ->whereHas('enrollments', function($q) use ($course) {
                $q->where('course_id', $course->id);
            })->get();

        if ($students->isEmpty()) {
            $this->warn('No students found in this course. Using all students in school.');
            $students = User::where('role', 'student')
                ->where('school_id', $lecturer->school_id)
                ->limit(10)
                ->get();
        }

        $this->info('Simulating realistic attempts for ' . $students->count() . ' students...');

        foreach ($students as $student) {
            $session = ExamSession::create([
                'exam_id' => $exam->id,
                'student_id' => $student->id,
                'status' => 'submitted',
                'started_at' => now()->subHours(2),
                'submitted_at' => now()->subHour(),
                'questions_answered' => count($savedQuestions),
            ]);

            $sessionAnswers = [];
            $totalMarks = 0;

            foreach ($savedQuestions as $idx => $qInfo) {
                $q = $qInfo['model'];
                
                // Assign a persona randomly: 40% Good, 40% Average, 20% Poor
                $rand = rand(1, 100);
                if ($rand <= 40) $persona = 'good';
                elseif ($rand <= 80) $persona = 'average';
                else $persona = 'poor';

                $personaData = $qInfo['personas'][$persona];
                $ans = $personaData['answer'];
                $sessionAnswers[$idx] = $ans;

                // Simple auto-marking for MCQ/TF for simulation
                $marks = 0;
                if ($q->isMultipleChoice()) {
                    $marks = ($ans === $q->correct_answer) ? 10 : 0;
                } elseif ($q->question_type === 'true_false') {
                    $marks = (strtolower($ans) === strtolower($q->correct_answer)) ? 10 : 0;
                } else {
                    $marks = $persona === 'good' ? rand(8, 10) : ($persona === 'average' ? rand(4, 7) : rand(0, 3));
                }
                
                $totalMarks += $marks;

                $answer = ExamAnswer::create([
                    'exam_session_id' => $session->id,
                    'question_id' => $q->id,
                    'question_index' => $idx,
                    'student_answer' => $ans,
                    'marks_obtained' => $marks,
                    'marking_status' => in_array($q->question_type, ['multiple_choice', 'true_false']) ? 'auto_marked' : 'ai_graded',
                    'answered_at' => now()->subMinutes(rand(10, 50)),
                    'feedback' => $personaData['analysis']['ai_feedback'] ?? 'Good attempt.',
                ]);

                // Create AIGrading record for essays/short answers to show "AI Analysis" in UI
                if (!in_array($q->question_type, ['multiple_choice', 'true_false'])) {
                    AIGrading::create([
                        'exam_answer_id' => $answer->id,
                        'exam_session_id' => $session->id,
                        'grading_method' => 'ai_essay',
                        'marks_awarded' => $marks,
                        'confidence_score' => $personaData['analysis']['confidence'] ?? 85.00,
                        'confidence_threshold' => 75.00,
                        'reasoning' => $personaData['analysis']['reasoning'] ?? 'Nuanced AI analysis of student content.',
                        'ai_feedback' => $personaData['analysis']['ai_feedback'] ?? 'Detailed feedback for improvement.',
                        'analysis_details' => [
                            'persona' => $persona,
                            'depth' => $persona === 'good' ? 'high' : ($persona === 'average' ? 'medium' : 'low'),
                            'relevance' => rand(60, 100),
                        ],
                        'status' => 'pending_review',
                    ]);
                }
            }

            $session->update([
                'answers' => $sessionAnswers,
                'score' => $totalMarks,
                'status' => 'graded',
                'graded_at' => now(),
            ]);
        }

        $this->info("Simulated exam '{$exam->title}' created with " . $students->count() . " high-fidelity attempts.");
    }

    protected function generateAnswerPersonas(DeepseekAIService $aiService, array $qData): array
    {
        if ($qData['question_type'] === 'multiple_choice' || $qData['question_type'] === 'true_false') {
            return [
                'good' => [
                    'answer' => $qData['correct_answer'],
                    'analysis' => ['reasoning' => 'Selected the correct option based on fundamental principles.', 'ai_feedback' => 'Excellent work.', 'confidence' => 100]
                ],
                'average' => [
                    'answer' => $qData['options'][rand(0, count($qData['options']) - 1)] ?? $qData['correct_answer'],
                    'analysis' => ['reasoning' => 'The student likely guessed or confused similar concepts.', 'ai_feedback' => 'Review the distinction between options.', 'confidence' => 95]
                ],
                'poor' => [
                    'answer' => 'I do not know',
                    'analysis' => ['reasoning' => 'Student indicated lack of knowledge.', 'ai_feedback' => 'Please study this topic further.', 'confidence' => 100]
                ],
            ];
        }

        // For essay/short answer, use AI to generate personas
        // For essay/short answer, use AI to generate personas
        $prompt = "For the question: '{$qData['question_text']}', generate three types of student responses with associated AI analysis:
        1. 'good': A high-quality, correct, and detailed answer.
        2. 'average': A partially correct answer that misses some key points.
        3. 'poor': A confused or incorrect answer.
        
        For each response, provide:
        - 'answer': The student's text.
        - 'reasoning': A detailed TECHNICAL ANALYSIS addressed to the LECTURER explaining WHY this answer got its mark. Be clinical, observant, and use phrases like 'The student demonstrated...', 'I recommend focusing on...', etc.
        - 'ai_feedback': Encouraging and helpful feedback addressed directly to the STUDENT (e.g., 'Great job!', 'Try to focus more on binary conversion next time').
        - 'confidence': A number between 1 and 100.

        Return as JSON with keys 'good', 'average', 'poor'. Each key should contain an object with 'answer', 'reasoning', 'ai_feedback', and 'confidence'.";

        try {
            $response = $aiService->generateText($prompt, "You are a simulation engine. Return ONLY valid JSON.");
            $json = json_decode($this->extractJson($response), true);
            
            $result = [];
            foreach (['good', 'average', 'poor'] as $p) {
                $result[$p] = [
                    'answer' => $json[$p]['answer'] ?? "Simulation: $p answer.",
                    'analysis' => [
                        'reasoning' => $json[$p]['reasoning'] ?? "Deep analysis of the $p response content.",
                        'ai_feedback' => $json[$p]['ai_feedback'] ?? "Constructive feedback for the $p response.",
                        'confidence' => $json[$p]['confidence'] ?? 85
                    ]
                ];
            }
            return $result;
        } catch (\Exception $e) {
            return [
                'good' => [
                    'answer' => 'Simulation: Good answer.',
                    'analysis' => ['reasoning' => 'Correct and detailed.', 'ai_feedback' => 'Well done.', 'confidence' => 90]
                ],
                'average' => [
                    'answer' => 'Simulation: Average answer.',
                    'analysis' => ['reasoning' => 'Partially correct.', 'ai_feedback' => 'Keep trying.', 'confidence' => 80]
                ],
                'poor' => [
                    'answer' => 'Simulation: Poor answer.',
                    'analysis' => ['reasoning' => 'Incorrect concepts.', 'ai_feedback' => 'Review is needed.', 'confidence' => 70]
                ],
            ];
        }
    }

    protected function extractJson($text)
    {
        if (preg_match('/\{.*\}/s', $text, $matches)) {
            return $matches[0];
        }
        return $text;
    }

    protected function getFallbackQuestions(): array
    {
        return [
            [
                'question_text' => 'What is the time complexity of searching in a balanced BST?',
                'question_type' => 'multiple_choice',
                'options' => ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
                'correct_answer' => 'O(log n)',
            ],
            [
                'question_text' => 'Describe the role of the CPU in a computer system.',
                'question_type' => 'essay',
                'options' => null,
                'correct_answer' => 'The Central Processing Unit (CPU) is the primary component of a computer that acts as its "brain," executing instructions of a computer program by performing the basic arithmetic, logical, control and input/output (I/O) operations specified by the instructions.',
            ]
        ];
    }
}
