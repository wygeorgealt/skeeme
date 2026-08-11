<?php

namespace App\Services\Integrations;

use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class GoogleProvider extends AbstractIntegrationProvider
{
    protected function refreshToken()
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => $this->account->refresh_token,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $this->account->update([
                'access_token' => $data['access_token'],
                'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
            ]);
        }
    }

    public function createCalendarEvent(array $data)
    {
        $this->ensureValidToken();

        $payload = [
            'summary' => $data['topic'] ?? 'Skeeme Event',
            'description' => $data['description'] ?? 'Event from Skeeme.',
            'start' => ['dateTime' => $data['start_time']],
            'end' => ['dateTime' => $data['end_time'] ?? Carbon::parse($data['start_time'])->addHours(1)->toIso8601String()],
        ];

        if (isset($data['recurrence'])) {
            $payload['recurrence'] = $data['recurrence'];
        }

        $response = Http::withToken($this->account->access_token)
            ->post("https://www.googleapis.com/calendar/v3/calendars/primary/events", $payload);

        return $response->json();
    }

    public function createMeeting(array $data)
    {
        $this->ensureValidToken();

        // For Google, we'll create a Calendar Event with Google Meet
        $response = Http::withToken($this->account->access_token)
            ->post("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1", [
                'summary' => $data['topic'] ?? 'Skeeme Class Session',
                'description' => $data['description'] ?? 'Automated class session from Skeeme.',
                'start' => ['dateTime' => $data['start_time']],
                'end' => ['dateTime' => Carbon::parse($data['start_time'])->addMinutes($data['duration'] ?? 60)->toIso8601String()],
                'conferenceData' => [
                    'createRequest' => [
                        'requestId' => uniqid(),
                        'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
                    ],
                ],
            ]);

        return $response->json();
    }
}
