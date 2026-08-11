<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class TeamApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login()
    {
        $admin = User::factory()->create(['role' => 'admin', 'password' => bcrypt('password')]);

        $response = $this->postJson('/api/v1/team/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_non_admin_cannot_login_to_team_api()
    {
        $user = User::factory()->create(['role' => 'student', 'password' => bcrypt('password')]);

        $response = $this->postJson('/api/v1/team/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_view_dashboard_stats()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/team/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_users',
                'active_students',
                'total_exams'
            ]);
    }
}
