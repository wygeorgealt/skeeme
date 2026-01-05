<?php

namespace App\Livewire;

use App\Models\School;
use App\Services\SubscriptionService;
use Livewire\Component;

class SubscriptionManager extends Component
{
    public School $school;
    public array $status = [];
    public array $plans = [];
    public string $selectedPlan = '';
    public bool $showUpgradeModal = false;

    public function mount(SubscriptionService $subscriptionService)
    {
        $this->status = $subscriptionService->getSubscriptionStatus($this->school);
        $this->plans = $subscriptionService->getAvailablePlans();
    }

    public function openUpgradeModal(string $plan)
    {
        $this->selectedPlan = $plan;
        $this->showUpgradeModal = true;
    }

    public function closeUpgradeModal()
    {
        $this->showUpgradeModal = false;
        $this->selectedPlan = '';
    }

    public function upgradePlan(SubscriptionService $subscriptionService)
    {
        if (!$this->selectedPlan) {
            $this->addError('plan', 'Please select a plan');
            return;
        }

        try {
            $subscriptionService->changePlan($this->school, $this->selectedPlan);

            $this->status = $subscriptionService->getSubscriptionStatus($this->school);
            $this->closeUpgradeModal();

            $this->toastSuccess('Plan upgraded successfully!', 'Upgrade Complete');
        } catch (\Exception $e) {
            $this->addError('upgrade', $e->getMessage());
        }
    }

    public function cancelSubscription(SubscriptionService $subscriptionService)
    {
        try {
            $subscriptionService->cancelSubscription($this->school);

            $this->status = $subscriptionService->getSubscriptionStatus($this->school);

            $this->toastSuccess('Subscription cancelled successfully!', 'Cancellation Complete');
        } catch (\Exception $e) {
            $this->addError('cancel', $e->getMessage());
        }
    }

    public function renewSubscription(SubscriptionService $subscriptionService)
    {
        try {
            $subscriptionService->renewSubscription($this->school);

            $this->status = $subscriptionService->getSubscriptionStatus($this->school);

            $this->toastSuccess('Subscription renewed successfully!', 'Renewal Complete');
        } catch (\Exception $e) {
            $this->addError('renew', $e->getMessage());
        }
    }

    public function render()
    {
        return view('livewire.subscription-manager');
    }
}
