<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class AiJobCache
{
    public const TTL_SECONDS = 1800;

    public static function register(string $jobId, int $userId): void
    {
        Cache::put("ai_job_owner:{$jobId}", $userId, self::TTL_SECONDS);
    }

    public static function ownerId(string $jobId): ?int
    {
        $owner = Cache::get("ai_job_owner:{$jobId}");

        return $owner !== null ? (int) $owner : null;
    }
}
