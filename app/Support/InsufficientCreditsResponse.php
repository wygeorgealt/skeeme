<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class InsufficientCreditsResponse
{
    public static function make(int $required, int $available, string $message): JsonResponse
    {
        return response()->json([
            'error' => 'insufficient_credits',
            'message' => $message,
            'required' => $required,
            'available' => $available,
            'shortfall' => max(0, $required - $available),
        ], 402);
    }
}
