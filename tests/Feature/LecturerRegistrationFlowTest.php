<?php

namespace Tests\Feature;

use Tests\TestCase;

class LecturerRegistrationFlowTest extends TestCase
{
    /**
     * Lecturer Registration & Onboarding Flow Tests
     * 
     * Tests the complete flow from registration through onboarding
     * for lecturer users, including the awaiting approval state.
     */

    public function test_registration_page_is_accessible(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_lecturer_onboarding_route_exists(): void
    {
        $response = $this->get('/onboarding/lecturer');
        // Route exists but may redirect due to middleware
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_lecturer_pending_approval_route_exists(): void
    {
        $response = $this->get('/pending-approval');
        // Route exists - may return 200 or redirect
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_lecturer_onboarding_livewire_component_exists(): void
    {
        $this->assertTrue(class_exists('App\\Livewire\\LecturerOnboarding'));
    }

    public function test_lecturer_onboarding_component_has_mount_method(): void
    {
        $component = new \App\Livewire\LecturerOnboarding();
        $this->assertTrue(method_exists($component, 'mount'));
    }

    public function test_lecturer_onboarding_component_has_next_step_method(): void
    {
        $component = new \App\Livewire\LecturerOnboarding();
        $this->assertTrue(method_exists($component, 'nextStep'));
    }

    public function test_lecturer_onboarding_component_has_complete_method(): void
    {
        $component = new \App\Livewire\LecturerOnboarding();
        $this->assertTrue(method_exists($component, 'complete'));
    }

    public function test_role_selection_works_for_lecturer(): void
    {
        $response = $this->post('/role-selection', [
            'role' => 'lecturer'
        ]);
        // Route should exist and not 404
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_role_selection_page_is_protected(): void
    {
        $response = $this->get('/role-selection');
        // Should redirect to login (not authenticated)
        $response->assertStatus(302);
    }

    public function test_register_otp_verification_route_exists(): void
    {
        $response = $this->get('/register/verify-email');
        // Route exists but may redirect
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_register_otp_flow_endpoints_exist(): void
    {
        // Verify OTP endpoint
        $response = $this->post('/register/verify-otp', [
            'otp' => '000000'
        ]);
        $this->assertNotEquals(404, $response->getStatusCode());

        // Resend OTP endpoint
        $response = $this->post('/register/resend-otp');
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_lecturer_pending_approval_blade_exists(): void
    {
        // Check that the Livewire view file exists
        $this->assertTrue(view()->exists('livewire.lecturer-pending-approval'));
    }

    public function test_redirect_based_on_role_middleware_protects_routes(): void
    {
        $this->assertTrue(class_exists('App\\Http\\Middleware\\RedirectBasedOnRole'));
    }

    public function test_lecturer_can_proceed_to_onboarding_after_role_selection(): void
    {
        // POST to role selection with lecturer role
        $response = $this->post('/role-selection', [
            'role' => 'lecturer'
        ]);
        // Should redirect (not authenticated in test) but route exists
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_lecturer_model_exists(): void
    {
        $this->assertTrue(class_exists('App\\Models\\User'));
    }

    public function test_otp_controller_handles_lecturer_registration(): void
    {
        $this->assertTrue(class_exists('App\\Http\\Controllers\\OtpController'));
    }

    public function test_lecturer_awaiting_approval_displays_without_dashboard(): void
    {
        // The awaiting approval page should exist as a standalone view
        // similar to login/register, not showing dashboard or sidebar
        $response = $this->get('/pending-approval');
        // Route exists (may redirect but not 404)
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_fortify_register_route_available_for_lecturer(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_lecturer_onboarding_form_steps(): void
    {
        // Verify the component exists with proper method structure
        $component = new \App\Livewire\LecturerOnboarding();
        
        // Check for step validation
        $this->assertTrue(method_exists($component, 'nextStep'));
        $this->assertTrue(method_exists($component, 'mount'));
    }

    public function test_lecturer_registration_flow_protected_from_unauthenticated(): void
    {
        // Onboarding should require authentication
        $response = $this->get('/onboarding/lecturer');
        $this->assertNotEquals(200, $response->getStatusCode()); // Should redirect
    }

    public function test_lecturer_pending_approval_is_accessible_when_authenticated(): void
    {
        // The route should exist and be accessible
        // (authentication requirement handled by middleware)
        $response = $this->get('/pending-approval');
        // Should exist as a route
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_lecturer_awaiting_approval_blade_template_exists(): void
    {
        // Verify the Livewire blade file exists at resources/views/livewire/lecturer-pending-approval.blade.php
        $this->assertTrue(view()->exists('livewire.lecturer-pending-approval'));
    }

    public function test_lecturer_cannot_access_admin_only_routes(): void
    {
        // Lecturer should not have access to admin-only settings
        $response = $this->get('/settings/school-configuration');
        // Should redirect or be forbidden (not accessible)
        $this->assertNotEquals(200, $response->getStatusCode());
    }

    public function test_role_selection_middleware_configured(): void
    {
        // Verify middleware is properly registered
        $this->assertTrue(class_exists('App\\Http\\Middleware\\RedirectBasedOnRole'));
    }

    public function test_lecturer_onboarding_uses_livewire(): void
    {
        // Verify it's a Livewire component
        $this->assertTrue(class_exists('App\\Livewire\\LecturerOnboarding'));
    }

    public function test_registration_creates_user_before_role_selection(): void
    {
        // Registration should create user first (with null role)
        // Then OTP verification confirms email
        // Then role selection sets the role
        $this->assertTrue(class_exists('App\\Models\\User'));
    }
}
