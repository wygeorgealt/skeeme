<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ExamSession;
use App\Models\GradingMetrics;
use App\Services\GradingMetricsService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GradingMetricsTest extends TestCase
{
    use DatabaseTransactions;

    protected GradingMetricsService $metricsService;
    protected User $lecturer;
    protected ExamSession $examSession;

    protected function setUp(): void
    {
        parent::setUp();

        $this->metricsService = app(GradingMetricsService::class);
        $this->lecturer = User::factory()->create(['role' => 'lecturer']);
        $this->examSession = ExamSession::factory()->create(['status' => 'submitted']);
    }

    #[Test]
    public function lecturer_can_start_grading_session()
    {
        $metrics = $this->metricsService->startGrading($this->examSession, $this->lecturer);

        $this->assertDatabaseHas('grading_metrics', [
            'exam_session_id' => $this->examSession->id,
            'lecturer_id' => $this->lecturer->id,
        ]);

        $this->assertNotNull($metrics->grading_started_at);
        $this->assertNull($metrics->grading_completed_at);
    }

    #[Test]
    public function lecturer_can_complete_grading_session()
    {
        $metrics = $this->metricsService->startGrading($this->examSession, $this->lecturer);
        
        sleep(2); // Simulate time spent grading

        $completed = $this->metricsService->completeGrading($this->examSession, $this->lecturer);

        $this->assertNotNull($completed->grading_completed_at);
        $this->assertGreaterThan(0, $completed->total_time_seconds);
        $this->assertTrue($completed->isComplete());
    }

    #[Test]
    public function metrics_tracks_question_level_details()
    {
        $this->metricsService->startGrading($this->examSession, $this->lecturer);

        $this->metricsService->updateQuestionMetrics(
            $this->examSession,
            $this->lecturer,
            questionIndex: 1,
            timeSpentSeconds: 45,
            addedComment: true,
            revised: false
        );

        $metrics = GradingMetrics::where('exam_session_id', $this->examSession->id)->first();

        $this->assertEquals(1, $metrics->question_index);
        $this->assertEquals(45, $metrics->time_per_question_seconds);
        $this->assertEquals(1, $metrics->comments_added);
        $this->assertEquals(0, $metrics->revision_count);
    }

    #[Test]
    public function metrics_tracks_revision_count()
    {
        $this->metricsService->startGrading($this->examSession, $this->lecturer);

        $this->metricsService->updateQuestionMetrics(
            $this->examSession,
            $this->lecturer,
            questionIndex: 1,
            timeSpentSeconds: 60,
            addedComment: false,
            revised: true
        );

        $this->metricsService->updateQuestionMetrics(
            $this->examSession,
            $this->lecturer,
            questionIndex: 1,
            timeSpentSeconds: 75,
            addedComment: false,
            revised: true
        );

        $metrics = GradingMetrics::where('exam_session_id', $this->examSession->id)->first();

        $this->assertEquals(2, $metrics->revision_count);
    }

    #[Test]
    public function lecturer_statistics_are_calculated_correctly()
    {
        // Create multiple grading sessions
        for ($i = 0; $i < 3; $i++) {
            $session = ExamSession::factory()->create(['status' => 'submitted']);
            $metrics = $this->metricsService->startGrading($session, $this->lecturer);
            $metrics->update([
                'grading_completed_at' => now(),
                'total_time_seconds' => 3600, // 1 hour
                'question_index' => 20,
                'comments_added' => 15,
                'revision_count' => 3,
            ]);
        }

        $stats = $this->metricsService->getLecturerStatistics($this->lecturer);

        $this->assertEquals(3, $stats['total_exams_graded']);
        $this->assertEquals(3, $stats['total_time_hours']);
        $this->assertEquals(60, $stats['average_time_per_exam_minutes']);
        $this->assertEquals(180, $stats['average_time_per_question_seconds']);
        $this->assertEquals(45, $stats['total_comments_added']);
    }

    #[Test]
    public function comparative_analytics_show_lecturer_performance()
    {
        // Create fast grading lecturer
        $fastLecturer = User::factory()->create(['role' => 'lecturer']);
        
        // Current lecturer - slower
        $slowSession = ExamSession::factory()->create();
        $metrics = $this->metricsService->startGrading($slowSession, $this->lecturer);
        $metrics->update([
            'grading_completed_at' => now(),
            'total_time_seconds' => 7200, // 2 hours
            'question_index' => 20,
            'comments_added' => 5,
            'revision_count' => 2,
        ]);

        // Fast lecturer - faster
        $fastSession = ExamSession::factory()->create();
        $fastMetrics = $this->metricsService->startGrading($fastSession, $fastLecturer);
        $fastMetrics->update([
            'grading_completed_at' => now(),
            'total_time_seconds' => 3600, // 1 hour
            'question_index' => 20,
            'comments_added' => 10,
            'revision_count' => 1,
        ]);

        $analytics = $this->metricsService->getComparativeAnalytics($this->lecturer);

        $this->assertFalse($analytics['comparison']['faster_than_average']);
        $this->assertGreaterThan(0, $analytics['comparison']['time_difference_minutes']);
        $this->assertFalse($analytics['comparison']['more_detailed_feedback']);
    }

    #[Test]
    public function consistency_score_is_calculated_based_on_revisions()
    {
        $metrics = GradingMetrics::factory()->create([
            'lecturer_id' => $this->lecturer->id,
            'revision_count' => 0,
        ]);

        $this->assertEquals(100, $metrics->consistency_score);

        $metrics->update(['revision_count' => 2]);
        $this->assertEquals(90, $metrics->consistency_score);

        $metrics->update(['revision_count' => 5]);
        $this->assertEquals(75, $metrics->consistency_score);
    }

    #[Test]
    public function average_time_per_question_is_calculated()
    {
        $metrics = GradingMetrics::factory()->create([
            'total_time_seconds' => 3600,
            'question_index' => 20,
        ]);

        $this->assertEquals(180, $metrics->average_time_per_question);
    }

    #[Test]
    public function grading_metrics_returns_complete_flag()
    {
        $incompleteMetrics = GradingMetrics::factory()->create([
            'grading_completed_at' => null,
        ]);

        $completeMetrics = GradingMetrics::factory()->create([
            'grading_completed_at' => now(),
        ]);

        $this->assertFalse($incompleteMetrics->isComplete());
        $this->assertTrue($completeMetrics->isComplete());
    }

    #[Test]
    public function total_time_in_minutes_is_calculated()
    {
        $metrics = GradingMetrics::factory()->create([
            'total_time_seconds' => 3600, // 1 hour
        ]);

        $this->assertEquals(60, $metrics->total_time_minutes);
    }
}
