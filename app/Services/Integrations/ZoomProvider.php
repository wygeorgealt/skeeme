<?php

namespace App\Services\Integrations;

use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class ZoomProvider extends AbstractIntegrationProvider
{
    protected function refreshToken()
    {
        $response = Http::asForm()->post('https://zoom.us/oauth/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => $this->account->refresh_token,
            'client_id' => config('services.zoom.client_id'),
            'client_secret' => config('services.zoom.client_secret'),
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $this->account->update([
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? $this->account->refresh_token,
                'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
            ]);
        }
    }

    public function createMeeting(array $data)
    {
        $this->ensureValidToken();

        $response = Http::withToken($this->account->access_token)
            ->post("https://api.zoom.us/v2/users/me/meetings", [
                'topic' => $data['topic'] ?? 'Skeeme Class Session',
                'type' => 2, // Scheduled meeting
                'start_time' => $data['start_time'], // ISO 8601
                'duration' => $data['duration'] ?? 60,
                'settings' => [
                    'host_video' => true,
                    'participant_video' => true,
                    'join_before_host' => true,
                    'mute_upon_entry' => true,
                ],
            ]);

        return $response->json();
    }
}
