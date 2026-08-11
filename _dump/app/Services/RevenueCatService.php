<?php

namespace App\Services;

use App\Models\User;
use App\Models\IndividualSubscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RevenueCatService
{
    /**
     * Handle a subscription entitlement update (Initial Purchase or Renewal)
     */
    public function grantEntitlement(string $appUserId, string $entitlementId, string $eventType = 'INITIAL_PURCHASE', ?string $expirationDate = null): bool
    {
        Log::info("RevenueCat: Granting Entitlement", [
            'app_user_id' => $appUserId,
            'entitlement' => $entitlementId
        ]);

        $user = User::where('id', '=', $appUserId)
            ->orWhere('rc_app_user_id', '=', $appUserId)
            ->first();

        if (!$user) {
            Log::error("RevenueCat: User not found for ID: " . $appUserId);
            return false;
        }

        return DB::transaction(function () use ($user, $entitlementId, $eventType, $expirationDate) {
            // 1. Update User Status
            if ($entitlementId === 'Skeeme_Pro') {
                $user->update([
                    'subscription_tier' => 'pro',
                    'rc_app_user_id' => $user->rc_app_user_id ?? $user->id,
                ]);
            } elseif ($entitlementId === 'Skeeme_Max') {
                $user->update([
                    'subscription_tier' => 'max',
                    'rc_app_user_id' => $user->rc_app_user_id ?? $user->id,
                ]);
            }

            // 2. Log or Create Subscription Record
            IndividualSubscription::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'plan_name' => $entitlementId,
                    'status' => 'active',
                    'start_date' => now(),
                    'expiry_date' => $expirationDate ? date('Y-m-d', $expirationDate / 1000) : now()->addMonth(),
                ]
            );

            // 3. Add Credits (Only on Purchase or Renewal)
            if (in_array($eventType, ['INITIAL_PURCHASE', 'RENEWAL'])) {
                if ($entitlementId === 'Skeeme_Pro') {
                    $user->increment('credits', 20000);
                } elseif ($entitlementId === 'Skeeme_Max') {
                    $user->increment('credits', 100000);
                }
            }

            return true;
        });
    }

    /**
     * Handle one-time credit purchases (Consumables)
     */
    public function grantConsumable(string $appUserId, string $productId): bool
    {
        Log::info("RevenueCat: Granting Consumable", [
            'app_user_id' => $appUserId,
            'product_id' => $productId
        ]);

        $user = User::where('id', '=', $appUserId)
            ->orWhere('rc_app_user_id', '=', $appUserId)
            ->first();

        if (!$user) return false;

        // Map your Product IDs to credit amounts
        $creditMap = [
            'skeeme_credits_1000' => 1000,
            'skeeme_credits_5000' => 5000,
            'skeeme_credits_10000' => 10000,
        ];

        $amount = $creditMap[$productId] ?? 0;

        if ($amount > 0) {
            $user->increment('credits', $amount);
            return true;
        }

        return false;
    }

    /**
     * Handle a subscription cancellation or expiration
     */
    public function revokeEntitlement(string $appUserId, string $entitlementId): bool
    {
        Log::info("RevenueCat: Revoking Entitlement", [
            'app_user_id' => $appUserId,
            'entitlement' => $entitlementId
        ]);

        $user = User::where('id', '=', $appUserId)
            ->orWhere('rc_app_user_id', '=', $appUserId)
            ->first();

        if (!$user) return false;

        return DB::transaction(function () use ($user, $entitlementId) {
            if (in_array($entitlementId, ['Skeeme_Pro', 'Skeeme_Max'])) {
                $user->update(['subscription_tier' => 'free']);
            }

            IndividualSubscription::where('user_id', $user->id)
                ->where('plan_name', $entitlementId)
                ->update(['status' => 'expired']);

            return true;
        });
    }
}
