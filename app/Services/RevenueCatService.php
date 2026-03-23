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
    public function grantEntitlement(string $appUserId, string $entitlementId, ?string $expirationDate = null): bool
    {
        Log::info("RevenueCat: Granting Entitlement", [
            'app_user_id' => $appUserId,
            'entitlement' => $entitlementId
        ]);

        $user = User::where('id', $appUserId)
            ->orWhere('rc_app_user_id', $appUserId)
            ->first();

        if (!$user) {
            Log::error("RevenueCat: User not found for ID: " . $appUserId);
            return false;
        }

        return DB::transaction(function () use ($user, $entitlementId, $expirationDate) {
            // 1. Update User Status
            // Assuming 'unlimited_access' is the ID for the main subscription
            if ($entitlementId === 'unlimited_access') {
                $user->update([
                    'is_unlimited_student' => true,
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

            // 3. Optional: Refill credits if not unlimited
            if (!$user->is_unlimited_student) {
                $user->increment('credits', 1000);
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

        $user = User::where('id', $appUserId)
            ->orWhere('rc_app_user_id', $appUserId)
            ->first();

        if (!$user) return false;

        // Map your Product IDs to credit amounts
        $creditMap = [
            'skeeme_credits_1000' => 1000,
            'skeeme_credits_5000' => 5000,
            'skeeme_credits_20000' => 20000,
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

        $user = User::where('id', $appUserId)
            ->orWhere('rc_app_user_id', $appUserId)
            ->first();

        if (!$user) return false;

        return DB::transaction(function () use ($user, $entitlementId) {
            if ($entitlementId === 'unlimited_access') {
                $user->update(['is_unlimited_student' => false]);
            }

            IndividualSubscription::where('user_id', $user->id)
                ->where('plan_name', $entitlementId)
                ->update(['status' => 'expired']);

            return true;
        });
    }
}
