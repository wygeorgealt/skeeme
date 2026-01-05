<?php

namespace App\Services\Integrations;

use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class MicrosoftProvider extends AbstractIntegrationProvider
{
    protected function refreshToken()
    {
        $response = Http::asForm()->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => $this->account->refresh_token,
            'client_id' => config('services.graph.client_id'),
            'client_secret' => config('services.graph.client_secret'),
            'scope' => implode(' ', $this->account->scopes ?? []),
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
            ->post("https://graph.microsoft.com/v1.0/me/onlineMeetings", [
                'subject' => $data['topic'] ?? 'Skeeme Class Session',
                'startDateTime' => $data['start_time'], // ISO 8601
                'endDateTime' => Carbon::parse($data['start_time'])->addMinutes($data['duration'] ?? 60)->toIso8601String(),
            ]);

        return $response->json();
    }
}
