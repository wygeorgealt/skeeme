<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdminRegistrationFlowTest extends TestCase
{
    /**
     * Admin Registration & Onboarding Flow Tests
     * 
     * Tests the complete flow from registration through onboarding
     * for school admin users.
     */

    public function test_registration_page_is_accessible(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_role_selection_page_is_accessible_after_auth(): void
    {
        $response = $this->get('/role-selection');
        // Not authenticated, should redirect to login
        $response->assertStatus(302);
    }

    public function test_admin_onboarding_route_exists(): void
    {
        $response = $this->get('/onboarding/admin');
        // Route exists but may redirect due to middleware
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_forgot_password_route_exists(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);
    }

    public function test_register_otp_route_exists(): void
    {
        $response = $this->get('/register/verify-email');
        // Route exists but may redirect
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_register_resend_otp_endpoint_exists(): void
    {
        $response = $this->post('/register/resend-otp');
        // Endpoint exists
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_register_verify_otp_endpoint_exists(): void
    {
        $response = $this->post('/register/verify-otp', [
            'otp' => '000000'
        ]);
        // Endpoint exists
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_role_selection_controller_exists(): void
    {
        $this->assertTrue(class_exists('App\\Http\\Controllers\\RoleSelectionController'));
    }

    public function test_role_selection_controller_has_required_methods(): void
    {
        $controller = new \App\Http\Controllers\RoleSelectionController();
        
        $this->assertTrue(method_exists($controller, 'show'));
        $this->assertTrue(method_exists($controller, 'selectRole'));
    }

    public function test_admin_onboarding_livewire_component_exists(): void
    {
        $this->assertTrue(class_exists('App\\Livewire\\AdminOnboarding'));
    }

    public function test_role_selection_post_route_exists(): void
    {
        $response = $this->post('/role-selection', [
            'role' => 'admin'
        ]);
        // Route exists
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_admin_onboarding_component_has_mount_method(): void
    {
        $component = new \App\Livewire\AdminOnboarding();
        $this->assertTrue(method_exists($component, 'mount'));
    }

    public function test_admin_onboarding_component_has_next_step_method(): void
    {
        $component = new \App\Livewire\AdminOnboarding();
        $this->assertTrue(method_exists($component, 'nextStep'));
    }

    public function test_admin_onboarding_component_has_complete_method(): void
    {
        $component = new \App\Livewire\AdminOnboarding();
        $this->assertTrue(method_exists($component, 'complete'));
    }

    public function test_admin_onboarding_component_has_select_plan_method(): void
    {
        $component = new \App\Livewire\AdminOnboarding();
        $this->assertTrue(method_exists($component, 'selectPlan'));
    }

    public function test_redirect_based_on_role_middleware_exists(): void
    {
        $this->assertTrue(class_exists('App\\Http\\Middleware\\RedirectBasedOnRole'));
    }

    public function test_subscription_model_exists(): void
    {
        $this->assertTrue(class_exists('App\\Models\\Subscription'));
    }

    public function test_school_model_exists(): void
    {
        $this->assertTrue(class_exists('App\\Models\\School'));
    }

    public function test_otp_controller_exists_for_registration(): void
    {
        $this->assertTrue(class_exists('App\\Http\\Controllers\\OtpController'));
        $controller = new \App\Http\Controllers\OtpController();
        $this->assertTrue(method_exists($controller, 'showRegisterOtp'));
        $this->assertTrue(method_exists($controller, 'verifyRegisterOtp'));
    }

    public function test_admin_dashboard_route_exists(): void
    {
        $response = $this->get('/dashboard');
        // Route exists but may redirect due to middleware
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_registration_flow_routes_are_protected(): void
    {
        // Onboarding routes should require authentication
        $response = $this->get('/onboarding/admin');
        $this->assertNotEquals(200, $response->getStatusCode()); // Should redirect
    }

    public function test_otp_mail_class_exists_for_registration(): void
    {
        $this->assertTrue(class_exists('App\\Mail\\OtpMail'));
    }

    public function test_fortify_routes_are_available(): void
    {
        // Test that Laravel Fortify routes exist
        $response = $this->get('/register');
        $response->assertStatus(200);

        $response = $this->get('/login');
        $response->assertStatus(200);
    }
}
