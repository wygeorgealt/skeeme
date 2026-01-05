<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Display subscription plans
     */
    public function index(): View
    {
        $plans = $this->subscriptionService->getAvailablePlans();

        return view('subscriptions.pricing', compact('plans'));
    }

    /**
     * Show subscription management for a school
     */
    public function show(School $school): View
    {
        $this->authorize('view', $school);

        $status = $this->subscriptionService->getSubscriptionStatus($school);
        $plans = $this->subscriptionService->getAvailablePlans();

        return view('subscriptions.manage', compact('school', 'status', 'plans'));
    }

    /**
     * Subscribe to a plan
     */
    public function subscribe(Request $request): RedirectResponse
    {
        $request->validate([
            'plan' => 'required|string|in:' . implode(',', array_keys($this->subscriptionService->getAvailablePlans())),
            'school_id' => 'required|exists:schools,id',
        ]);

        $school = School::findOrFail($request->school_id);

        $this->authorize('update', $school);

        try {
            $subscription = $this->subscriptionService->createSubscription(
                $school,
                $request->plan
            );

            return redirect()->back()->with('success', 'Subscription created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create subscription: ' . $e->getMessage());
        }
    }

    /**
     * Change subscription plan
     */
    public function changePlan(Request $request, School $school): RedirectResponse
    {
        $this->authorize('update', $school);

        $request->validate([
            'plan' => 'required|string|in:' . implode(',', array_keys($this->subscriptionService->getAvailablePlans())),
        ]);

        try {
            $subscription = $this->subscriptionService->changePlan($school, $request->plan);

            return redirect()->back()->with('success', 'Plan changed successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to change plan: ' . $e->getMessage());
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(School $school): RedirectResponse
    {
        $this->authorize('update', $school);

        try {
            $this->subscriptionService->cancelSubscription($school);

            return redirect()->back()->with('success', 'Subscription cancelled successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to cancel subscription: ' . $e->getMessage());
        }
    }

    /**
     * Renew subscription
     */
    public function renew(School $school): RedirectResponse
    {
        $this->authorize('update', $school);

        try {
            $subscription = $this->subscriptionService->renewSubscription($school);

            return redirect()->back()->with('success', 'Subscription renewed successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to renew subscription: ' . $e->getMessage());
        }
    }

    /**
     * Handle payment callback (webhook)
     */
    public function paymentCallback(Request $request): void
    {
        // TODO: Implement payment callback handling
        // This will handle webhooks from payment providers (Paystack, Stripe)
        // Verify payment, update subscription status, send notifications
    }
}
