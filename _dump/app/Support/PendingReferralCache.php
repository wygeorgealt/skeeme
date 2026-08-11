<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class PendingReferralCache
{
    public static function store(int $userId, string $referralCode): void
    {
        Cache::put(
            "pending_referral:{$userId}",
            strtoupper(trim($referralCode)),
            now()->addDays(7)
        );
    }

    public static function pull(int $userId): ?string
    {
        $code = Cache::pull("pending_referral:{$userId}");

        return $code ? (string) $code : null;
    }
}
