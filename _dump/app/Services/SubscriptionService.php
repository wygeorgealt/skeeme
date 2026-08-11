<?php

namespace App\Services;

use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    /**
     * Create a new subscription for a school
     */
    public function createSubscription(School $school, string $planName, array $options = []): Subscription
    {
        $planConfig = config("subscriptions.plans.{$planName}");

        if (!$planConfig) {
            throw new \InvalidArgumentException("Invalid plan: {$planName}");
        }

        // Deactivate existing active subscription
        $school->subscriptions()->where('is_active', true)->update(['is_active' => false]);

        $startDate = $options['start_date'] ?? now();
        $duration = $options['duration_days'] ?? 30; // Default 30 days
        $expiryDate = $startDate->copy()->addDays($duration);

        return $school->subscriptions()->create([
            'plan_name' => $planName,
            'student_limit' => $planConfig['student_limit'],
            'price' => $planConfig['price'],
            'start_date' => $startDate,
            'expiry_date' => $expiryDate,
            'is_active' => true,
        ]);
    }

    /**
     * Upgrade or downgrade a subscription
     */
    public function changePlan(School $school, string $newPlanName): Subscription
    {
        $currentSubscription = $school->activeSubscription;

        if (!$currentSubscription) {
            throw new \Exception('No active subscription found for this school');
        }

        // Allow same plan only if it's a renewal (less than 30 days remaining)
        $daysRemaining = $currentSubscription->daysRemaining();
        if ($newPlanName === $currentSubscription->plan_name && $daysRemaining > 30) {
            throw new \Exception('School is already on this plan and it is not time to renew yet');
        }

        if (!$currentSubscription->canUpgradeTo($newPlanName) && !$currentSubscription->canDowngradeTo($newPlanName)) {
            throw new \Exception('Invalid plan change');
        }

        DB::transaction(function () use ($school, $newPlanName, $currentSubscription) {
            // Deactivate current subscription
            $currentSubscription->update(['is_active' => false]);

            // Create new subscription
            $this->createSubscription($school, $newPlanName, [
                'start_date' => now(),
            ]);
        });

        return $school->fresh()->activeSubscription;
    }

    /**
     * Cancel a subscription
     */
    public function cancelSubscription(School $school): bool
    {
        $subscription = $school->activeSubscription;

        if (!$subscription) {
            return false;
        }

        return $subscription->update(['is_active' => false]);
    }

    /**
     * Check if school can add students based on current plan
     */
    public function canAddStudents(School $school, int $additionalStudents = 1): bool
    {
        return $school->canAddStudents($additionalStudents);
    }

    /**
     * Check if user can access a feature
     */
    public function canAccessFeature(User $user, string $feature): bool
    {
        return $user->canAccessFeature($feature);
    }

    /**
     * Get subscription status for a school
     */
    public function getSubscriptionStatus(School $school): array
    {
        $subscription = $school->activeSubscription;

        if (!$subscription) {
            return [
                'has_subscription' => false,
                'plan' => null,
                'is_expired' => true,
                'days_remaining' => 0,
                'student_limit' => 0,
                'current_students' => 0,
                'can_add_students' => false,
            ];
        }

        $currentStudents = $school->users()->where('role', 'student')->count();
        $studentLimit = $subscription->getStudentLimit();

        return [
            'has_subscription' => true,
            'plan' => $subscription->plan_name,
            'is_expired' => $subscription->isExpired(),
            'days_remaining' => $subscription->daysRemaining(),
            'student_limit' => $studentLimit,
            'current_students' => $currentStudents,
            'can_add_students' => $this->canAddStudents($school),
            'features' => $subscription->getPlanDetails()['features'] ?? [],
        ];
    }

    /**
     * Renew subscription
     */
    public function renewSubscription(School $school): Subscription
    {
        $currentSubscription = $school->activeSubscription;

        if (!$currentSubscription) {
            throw new \Exception('No active subscription to renew');
        }

        return $this->createSubscription($school, $currentSubscription->plan_name, [
            'start_date' => $currentSubscription->expiry_date,
        ]);
    }

    /**
     * Get available plans
     */
    public function getAvailablePlans(): array
    {
        return config('subscriptions.plans', []);
    }

    /**
     * Check for expired subscriptions and handle them
     */
    public function handleExpiredSubscriptions(): void
    {
        $expiredSubscriptions = Subscription::active()
            ->where('expiry_date', '<=', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->update(['is_active' => false]);

            Log::info("Subscription expired for school ID: {$subscription->school_id}");

            // TODO: Send notification to school admin
            // TODO: Optionally downgrade to free plan or restrict access
        }
    }

    /**
     * Calculate prorated amount for plan change
     */
    public function calculateProratedAmount(School $school, string $newPlan): float
    {
        $currentSubscription = $school->activeSubscription;

        if (!$currentSubscription) {
            return 0;
        }

        $newPlanConfig = config("subscriptions.plans.{$newPlan}");
        $currentPlanConfig = config("subscriptions.plans.{$currentSubscription->plan_name}");

        if (!$newPlanConfig || !$currentPlanConfig) {
            return 0;
        }

        $daysRemaining = $currentSubscription->daysRemaining();
        $totalDays = $currentSubscription->start_date->diffInDays($currentSubscription->expiry_date);

        if ($totalDays == 0) {
            return 0;
        }

        $currentDailyRate = $currentPlanConfig['price'] / $totalDays;
        $newDailyRate = $newPlanConfig['price'] / $totalDays;

        $proratedDifference = ($newDailyRate - $currentDailyRate) * $daysRemaining;

        return max(0, $proratedDifference);
    }
}
