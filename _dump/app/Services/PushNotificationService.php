<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send a cross-platform push notification to an Expo app.
     *
     * @param string $token The user's Expo Push Token
     * @param string $title 
     * @param string $body
     * @param array $data Optional JSON data payload
     * @return bool
     */
    public function send(string $token, string $title, string $body, array $data = [])
    {
        if (!$this->isValidExpoToken($token)) {
            Log::warning("Invalid Expo push token: {$token}");
            return false;
        }

        $payload = [
            'to' => $token,
            'title' => $title,
            'body' => $body,
            'sound' => 'default',
        ];

        if (!empty($data)) {
            $payload['data'] = (object) $data;
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post(self::EXPO_PUSH_URL, $payload);

            if ($response->successful()) {
                return true;
            }

            Log::error('Expo Push Notification Failed: ' . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error('Expo Push Notification Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send to multiple tokens at once using chunking for Expo guidelines.
     */
    public function sendMultiple(array $tokens, string $title, string $body, array $data = [])
    {
        $validTokens = array_filter($tokens, [$this, 'isValidExpoToken']);
        if (empty($validTokens)) {
            return false;
        }

        $payloads = [];
        foreach ($validTokens as $token) {
            $payload = [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'sound' => 'default',
            ];

            if (!empty($data)) {
                $payload['data'] = (object) $data;
            }

            $payloads[] = $payload;
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post(self::EXPO_PUSH_URL, $payloads);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Expo Push Notification Exception: ' . $e->getMessage());
            return false;
        }
    }

    private function isValidExpoToken(string $token): bool
    {
        return str_starts_with($token, 'ExponentPushToken[') || str_starts_with($token, 'ExpoPushToken[');
    }
}
