<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ExamSession;
use App\Models\ExamAnswer;
use App\Models\ExamSessionRecovery;
use Mockery\MockInterface;
use App\Services\SessionRecoveryService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SessionRecoveryTest extends TestCase
{
    use DatabaseTransactions;

    protected SessionRecoveryService $recoveryService;
    protected User $student;
    protected ExamSession $examSession;

    protected function setUp(): void
    {
        parent::setUp();

        $this->recoveryService = app(SessionRecoveryService::class);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->examSession = ExamSession::factory()->create(['student_id' => $this->student->id]);
    }

    #[Test]
    public function system_logs_connection_loss()
    {
        $recovery = $this->recoveryService->logConnectionLoss(
            $this->examSession,
            $this->student,
            lastQuestionIndex: 5,
            autoSavedData: ['5' => ['response' => 'answer text']]
        );

        $this->assertDatabaseHas('exam_session_recoveries', [
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'last_question_index' => 5,
        ]);

        $this->assertTrue($recovery->isPending());
        $this->assertNotNull($recovery->connection_lost_at);
    }

    #[Test]
    public function auto_save_stores_answer_data()
    {
        $answerData = [
            'question_id' => 1,
            'response' => 'This is my answer',
            'marked' => false,
        ];

        $this->recoveryService->autoSaveAnswer(
            $this->examSession,
            $this->student,
            questionIndex: 1,
            answerData: $answerData
        );

        $recovery = ExamSessionRecovery::where('exam_session_id', $this->examSession->id)->first();

        $this->assertNotNull($recovery);
        $this->assertEquals($answerData, $recovery->auto_saved_data['1']);
        $this->assertIsString($recovery->auto_saved_data['last_saved_at']);
    }

    #[Test]
    public function auto_save_updates_existing_recovery()
    {
        $this->recoveryService->autoSaveAnswer($this->examSession, $this->student, 1, ['response' => 'First answer']);
        $this->recoveryService->autoSaveAnswer($this->examSession, $this->student, 2, ['response' => 'Second answer']);

        $recovery = ExamSessionRecovery::where('exam_session_id', $this->examSession->id)->first();

        $this->assertEquals(2, $recovery->last_question_index);
        $this->assertCount(3, $recovery->auto_saved_data); // 2 answers + last_saved_at
    }

    #[Test]
    public function system_can_recover_session_from_auto_saved_data()
    {
        $autoSavedData = [
            '1' => ['question_id' => 1, 'response' => 'Answer 1'],
            '2' => ['question_id' => 2, 'response' => 'Answer 2'],
        ];

        $recovery = ExamSessionRecovery::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'last_question_index' => 2,
            'auto_saved_data' => $autoSavedData,
            'connection_lost_at' => now(),
        ]);

        $recovered = $this->recoveryService->recoverSession($recovery);

        $this->assertTrue($recovered->is_recovered);
        $this->assertNotNull($recovered->recovered_at);

        // Check that answers were restored
        $answers = ExamAnswer::where('exam_session_id', $this->examSession->id)->get();
        $this->assertGreaterThanOrEqual(2, $answers->count());
    }

    #[Test]
    public function system_retrieves_pending_recovery_data()
    {
        $recovery1 = ExamSessionRecovery::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'last_question_index' => 5,
            'connection_lost_at' => now(),
            'is_recovered' => false,
        ]);

        $recovery2 = ExamSessionRecovery::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'last_question_index' => 3,
            'connection_lost_at' => now(),
            'is_recovered' => true, // Already recovered
        ]);

        $pending = $this->recoveryService->getRecoveryData($this->examSession, $this->student);

        $this->assertEquals($recovery1->id, $pending->id);
    }

    #[Test]
    public function system_validates_answer_before_submission()
    {
        $validationRules = [
            'required' => true,
            'min_length' => ['value' => 10],
        ];

        $validAnswer = ['response' => 'This is a valid answer'];
        $invalidAnswer = ['response' => 'Short'];

        $validErrors = $this->recoveryService->validateAnswer($validAnswer, $validationRules);
        $invalidErrors = $this->recoveryService->validateAnswer($invalidAnswer, $validationRules);

        $this->assertEmpty($validErrors);
        $this->assertNotEmpty($invalidErrors);
        $this->assertArrayHasKey('response', $invalidErrors);
    }

    #[Test]
    public function system_validates_multiple_choice_answers()
    {
        $validationRules = [
            'multiple_choice' => [
                'options' => ['A', 'B', 'C', 'D'],
            ],
        ];

        $validAnswer = ['response' => 'A'];
        $invalidAnswer = ['response' => 'E'];

        $validErrors = $this->recoveryService->validateAnswer($validAnswer, $validationRules);
        $invalidErrors = $this->recoveryService->validateAnswer($invalidAnswer, $validationRules);

        $this->assertEmpty($validErrors);
        $this->assertNotEmpty($invalidErrors);
    }

    #[Test]
    public function system_clears_recovery_data_after_submission()
    {
        ExamSessionRecovery::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'last_question_index' => 10,
        ]);

        $this->assertDatabaseHas('exam_session_recoveries', [
            'exam_session_id' => $this->examSession->id,
        ]);

        $this->recoveryService->clearRecoveryData($this->examSession, $this->student);

        $this->assertDatabaseMissing('exam_session_recoveries', [
            'exam_session_id' => $this->examSession->id,
        ]);
    }

    #[Test]
    public function student_can_retrieve_pending_recovery_sessions()
    {
        $session1 = ExamSession::factory()->create(['student_id' => $this->student->id]);
        $session2 = ExamSession::factory()->create(['student_id' => $this->student->id]);
        $otherStudentSession = ExamSession::factory()->create();

        ExamSessionRecovery::create([
            'exam_session_id' => $session1->id,
            'student_id' => $this->student->id,
            'connection_lost_at' => now(),
            'is_recovered' => false,
        ]);

        ExamSessionRecovery::create([
            'exam_session_id' => $session2->id,
            'student_id' => $this->student->id,
            'connection_lost_at' => now(),
            'is_recovered' => true, // Already recovered
        ]);

        ExamSessionRecovery::create([
            'exam_session_id' => $otherStudentSession->id,
            'student_id' => User::factory()->create()->id,
            'connection_lost_at' => now(),
            'is_recovered' => false,
        ]);

        $pending = $this->recoveryService->getPendingRecoverySessions($this->student);

        $this->assertCount(1, $pending);
        $this->assertEquals($session1->id, $pending[0]->exam_session_id);
    }

    #[Test]
    public function recovery_statistics_are_calculated_correctly()
    {
        // Clear any existing recoveries from other tests
        ExamSessionRecovery::truncate();
        
        ExamSessionRecovery::factory(5)->create(['is_recovered' => true]);
        ExamSessionRecovery::factory(3)->create(['is_recovered' => false, 'connection_lost_at' => now()]);
        ExamSessionRecovery::factory(2)->create(['is_recovered' => false, 'connection_lost_at' => null]);

        $stats = $this->recoveryService->getRecoveryStats();

        $this->assertEquals(10, $stats['total_recoveries']);
        $this->assertEquals(5, $stats['successful_recoveries']);
        $this->assertEquals(3, $stats['pending_recoveries']);
        $this->assertEquals(50, $stats['recovery_success_rate']);
    }

    #[Test]
    public function time_lost_in_minutes_is_calculated()
    {
        $recovery = ExamSessionRecovery::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'connection_lost_at' => now()->subMinutes(30),
            'recovered_at' => now(),
            'is_recovered' => true,
        ]);

        $this->assertEquals(30, $recovery->time_lost_minutes);
    }
}
