<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Support\Facades\Log;

class ZoomWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $event = $request->input('event');
        $payload = $request->input('payload');

        // 1. Handle Endpoint Validation
        if ($event === 'endpoint.url_validation') {
            $plainToken = $payload['plainToken'];
            $encryptedToken = hash_hmac('sha256', $plainToken, config('services.zoom.secret_token'));
            
            return response()->json([
                'plainToken' => $plainToken,
                'encryptedToken' => $encryptedToken
            ], 200);
        }

        // 2. Handle Recording Completed (Post-Class Rewind)
        if ($event === 'recording.completed') {
            $meetingId = $payload['object']['id'];
            $recordingUrl = $payload['object']['share_url'] ?? null;

            $course = Course::where('zoom_meeting_id', (string)$meetingId)->first();

            if ($course && $recordingUrl) {
                $course->update([
                    'zoom_recording_url' => $recordingUrl,
                    // Optionally clear start/join urls as session is over
                    'zoom_join_url' => null,
                    'zoom_start_url' => null,
                ]);

                Log::info("Zoom Recording Linked for Course: {$course->name}");
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}
