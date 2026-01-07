<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ZoomService
{
    protected $accountId;
    protected $clientId;
    protected $clientSecret;
    protected $baseUrl = 'https://api.zoom.us/v2';

    public function __construct()
    {
        $this->accountId = env('ZOOM_ACCOUNT_ID');
        $this->clientId = env('ZOOM_CLIENT_ID');
        $this->clientSecret = env('ZOOM_CLIENT_SECRET');
    }

    /**
     * Get the OAuth Access Token using Server-to-Server flow.
     */
    protected function getAccessToken()
    {
        return Cache::remember('zoom_access_token', 3500, function () {
            $response = Http::asForm()
                ->withBasicAuth($this->clientId, $this->clientSecret)
                ->post("https://zoom.us/oauth/token", [
                    'grant_type' => 'account_credentials',
                    'account_id' => $this->accountId,
                ]);

            if ($response->failed()) {
                throw new \Exception('Zoom Authentication Failed: ' . $response->body());
            }

            return $response->json()['access_token'];
        });
    }

    /**
     * Create a Zoom meeting.
     */
    public function createMeeting($topic, $startTime, $duration = 40)
    {
        $token = $this->getAccessToken();

        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/users/me/meetings", [
                'topic' => $topic,
                'type' => 2, // Scheduled meeting
                'start_time' => $startTime, // ISO 8601 format
                'duration' => $duration,
                'settings' => [
                    'host_video' => true,
                    'participant_video' => true,
                    'join_before_host' => false,
                    'mute_upon_entry' => true,
                    'waiting_room' => true,
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception('Zoom Meeting Creation Failed: ' . $response->body());
        }

        return $response->json();
    }
}
