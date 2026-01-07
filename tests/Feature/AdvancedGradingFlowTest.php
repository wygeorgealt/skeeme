<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdvancedGradingFlowTest extends TestCase
{
    /**
     * Advanced Exam Grading & Review Flow Verification
     * 
     * This test suite verifies the existence and structural integrity of the 
     * implemented grading logic and exam timer features.
     */

    /** @test */
    public function test_student_exam_delivery_component_has_grading_and_timer_methods(): void
    {
        $this->assertTrue(class_exists('App\\Livewire\\StudentExamDelivery'));
        
        $reflection = new \ReflectionClass('App\\Livewire\\StudentExamDelivery');
        
        // Navigation and Review methods
        $this->assertTrue($reflection->hasMethod('goToReview'), 'Method goToReview is missing');
        $this->assertTrue($reflection->hasMethod('backToExam'), 'Method backToExam is missing');
        
        // Submission methods
        $this->assertTrue($reflection->hasMethod('performSubmission'), 'Consolidated performSubmission method is missing');
        $this->assertTrue($reflection->hasMethod('forceSubmit'), 'Method forceSubmit is missing');
        
        // Core submission logic check
        $this->assertTrue($reflection->hasMethod('submit'), 'Method submit is missing');
    }

    /** @test */
    public function test_lecturer_grading_dashboard_has_grade_release_logic(): void
    {
        $this->assertTrue(class_exists('App\\Livewire\\LecturerGradingDashboard'));
        
        $reflection = new \ReflectionClass('App\\Livewire\\LecturerGradingDashboard');
        $this->assertTrue($reflection->hasMethod('confirmFinalGrade'), 'Method confirmFinalGrade is missing');
    }

    /** @test */
    public function test_ai_grading_service_is_correctly_structured(): void
    {
        $this->assertTrue(class_exists('App\\Services\\AIGradingService'));
        
        $reflection = new \ReflectionClass('App\\Services\\AIGradingService');
        $this->assertTrue($reflection->hasMethod('gradeSession'), 'Method gradeSession is missing');
    }

    /** @test */
    public function test_notification_service_has_grade_release_method(): void
    {
        $this->assertTrue(class_exists('App\\Services\\NotificationService'));
        
        $reflection = new \ReflectionClass('App\\Services\\NotificationService');
        $this->assertTrue($reflection->hasMethod('sendGradeReleased'), 'Method sendGradeReleased is missing');
    }

    /** @test */
    public function test_student_exam_delivery_view_integrates_alpine_timer_logic(): void
    {
        $viewPath = base_path('resources/views/livewire/student-exam-delivery.blade.php');
        $content = file_get_contents($viewPath);
        
        // Alpine data properties
        $this->assertStringContainsString('lastWarningShown', $content, 'View missing lastWarningShown indicator');
        
        // Alpine methods
        $this->assertStringContainsString('checkWarnings', $content, 'View missing checkWarnings logic');
        $this->assertStringContainsString('showWarning', $content, 'View missing showWarning logic');
        
        // Integration check
        $this->assertStringContainsString('forceSubmit', $content, 'View missing auto-submit trigger');
    }

    /** @test */
    public function test_lecturer_dashboard_view_contains_confirmation_button(): void
    {
        $viewPath = base_path('resources/views/livewire/lecturer-grading-dashboard.blade.php');
        $content = file_get_contents($viewPath);
        
        $this->assertStringContainsString('confirmFinalGrade', $content, 'Confirm grade button action missing from view');
    }

    /** @test */
    public function test_exam_layout_includes_toast_notifications(): void
    {
        $layoutPath = base_path('resources/views/layouts/exam.blade.php');
        $content = file_get_contents($layoutPath);
        
        $this->assertStringContainsString('livewire:toast-notification', $content, 'Exam layout missing toast notifications');
    }
}
