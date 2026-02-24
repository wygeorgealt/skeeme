<?php

namespace Tests\Feature\Webhooks;

use Tests\TestCase;
use App\Models\Course;
use App\Models\School;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class ZoomWebhookTest extends TestCase
{
    use DatabaseTransactions;

    public function test_url_validation_event()
    {
        config(['services.zoom.secret_token' => 'test_secret']);

        $response = $this->postJson('/api/v1/webhooks/zoom', [
            'event' => 'endpoint.url_validation',
            'payload' => [
                'plainToken' => 'test_token'
            ]
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['plainToken', 'encryptedToken']);
                 
        $expectedEncryptedToken = hash_hmac('sha256', 'test_token', 'test_secret');
        $this->assertEquals($expectedEncryptedToken, $response->json('encryptedToken'));
    }

    public function test_recording_completed_event_updates_course()
    {
        $school = School::factory()->create();

        $course = Course::factory()->create([
            'school_id' => $school->id,
            'zoom_meeting_id' => '123456789',
            'zoom_start_url' => 'http://zoom.us/start',
            'zoom_join_url' => 'http://zoom.us/join',
            'zoom_recording_url' => null,
        ]);

        $response = $this->postJson('/api/v1/webhooks/zoom', [
            'event' => 'recording.completed',
            'payload' => [
                'object' => [
                    'id' => '123456789',
                    'share_url' => 'http://zoom.us/recording',
                ]
            ]
        ]);

        $response->assertStatus(200);

        $course->refresh();
        $this->assertEquals('http://zoom.us/recording', $course->zoom_recording_url);
        $this->assertNull($course->zoom_start_url);
        $this->assertNull($course->zoom_join_url);
    }
}
