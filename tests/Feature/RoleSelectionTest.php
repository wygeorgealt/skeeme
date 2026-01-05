<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class RoleSelectionTest extends TestCase
{
    /**
     * Test that role selection blade view exists
     */
    public function test_role_selection_blade_exists()
    {
        $this->assertTrue(file_exists(resource_path('views/role-selection.blade.php')));
    }

    /**
     * Test admin role selection endpoint exists
     */
    public function test_admin_role_selection_post_route_exists()
    {
        $response = $this->post('/role-selection', ['role' => 'admin']);
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    /**
     * Test lecturer role selection endpoint exists
     */
    public function test_lecturer_role_selection_post_route_exists()
    {
        $response = $this->post('/role-selection', ['role' => 'lecturer']);
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    /**
     * Test role selection route is named correctly
     */
    public function test_role_selection_route_names()
    {
        $this->assertTrue(route('role-selection') !== null);
        $this->assertTrue(route('role-selection.store') !== null);
    }

    /**
     * Test role selection controller class exists
     */
    public function test_role_selection_controller_exists()
    {
        $this->assertTrue(class_exists('App\Http\Controllers\RoleSelectionController'));
    }

    /**
     * Test role selection controller has required methods
     */
    public function test_role_selection_controller_has_required_methods()
    {
        $controller = new \App\Http\Controllers\RoleSelectionController();
        $this->assertTrue(method_exists($controller, 'show'));
        $this->assertTrue(method_exists($controller, 'selectRole'));
    }

    /**
     * Test role selection middleware exists
     */
    public function test_redirect_based_on_role_middleware_exists()
    {
        $this->assertTrue(class_exists('App\Http\Middleware\RedirectBasedOnRole'));
    }

    /**
     * Test role selection routes are protected
     */
    public function test_role_selection_routes_are_protected()
    {
        // Unauthenticated access should redirect to login
        $response = $this->get('/role-selection');
        $response->assertStatus(302);
        $response->assertRedirect('/login');
    }

    /**
     * Test role selection has proper Laravel routing
     */
    public function test_role_selection_routes_in_web_file()
    {
        $routes = file_get_contents(base_path('routes/web.php'));
        $this->assertStringContainsString('role-selection', $routes);
    }

    /**
     * Test role selection POST handler exists
     */
    public function test_role_selection_store_handler()
    {
        // Verify the selectRole method is callable (test existence)
        $controller = app(\App\Http\Controllers\RoleSelectionController::class);
        $this->assertTrue(method_exists($controller, 'selectRole'));
    }

    /**
     * Test role selection blade uses Flux components
     */
    public function test_role_selection_blade_uses_flux_components()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('x-layouts.auth', $blade);
        $this->assertStringContainsString('x-auth-header', $blade);
    }

    /**
     * Test role selection blade has form with POST method
     */
    public function test_role_selection_blade_has_form_structure()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('method="POST"', $blade);
        $this->assertStringContainsString('role-selection.store', $blade);
    }

    /**
     * Test role selection blade has admin and lecturer buttons
     */
    public function test_role_selection_blade_has_role_buttons()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('Admin', $blade);
        $this->assertStringContainsString('Lecturer', $blade);
        $this->assertStringContainsString('value="admin"', $blade);
        $this->assertStringContainsString('value="lecturer"', $blade);
    }

    /**
     * Test role selection blade has proper styling classes
     */
    public function test_role_selection_blade_styling()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('bg-stone-800', $blade);
        $this->assertStringContainsString('border-stone-700', $blade);
        $this->assertStringContainsString('grid-cols-2', $blade);
    }

    /**
     * Test role selection blade has CSRF protection
     */
    public function test_role_selection_blade_has_csrf()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('@csrf', $blade);
    }

    /**
     * Test role selection blade has error display
     */
    public function test_role_selection_blade_has_error_handling()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('$errors->any()', $blade);
    }

    /**
     * Test role selection blade has emoji icons
     */
    public function test_role_selection_blade_has_emoji_icons()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('🏫', $blade);
        $this->assertStringContainsString('👨‍🏫', $blade);
    }

    /**
     * Test role selection blade has descriptive text
     */
    public function test_role_selection_blade_has_descriptions()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('Manage your school', $blade);
        $this->assertStringContainsString('Teach and manage courses', $blade);
    }

    /**
     * Test role selection blade has info box
     */
    public function test_role_selection_blade_has_info_note()
    {
        $blade = file_get_contents(resource_path('views/role-selection.blade.php'));
        $this->assertStringContainsString('role preferences', $blade);
    }
}
