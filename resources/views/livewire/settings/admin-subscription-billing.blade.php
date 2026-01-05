<section class="w-full">
    @include('partials.settings-heading')

    <x-settings.layout 
        :heading="__('Subscription & Billing')" 
        :subheading="__('Manage your school subscription and payment information')"
    >
        @if ($subscription)
            <div class="space-y-6 my-6">
                <!-- Current Plan Status -->
                <!-- Current Plan Status -->
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6 transition-all hover:translate-y-[-2px] hover:shadow-md">
                    <div class="flex items-center justify-between">
                        <div>
                            <flux:heading size="xl" class="italic">{{ is_array($subscription->plan_name) ? 'Plan' : $subscription->plan_name }}</flux:heading>
                            <flux:subheading>Current Active Plan</flux:subheading>
                        </div>
                        @if ($this->subscriptionStatus)
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                                @if ($this->statusColor === 'red') bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800
                                @elseif ($this->statusColor === 'orange') bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800
                                @else bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 @endif">
                                {{ $this->subscriptionStatus }}
                            </span>
                        @endif
                    </div>

                    @if ($subscription->price > 0)
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <!-- Start Date -->
                        <div class="space-y-1">
                            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Start Date</div>
                            <div class="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono italic">
                                {{ $subscription->start_date->format('M d, Y') }}
                            </div>
                        </div>

                        @if (!$subscription->isFree())
                        <!-- Renewal Date -->
                        <div class="space-y-1">
                            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Renewal Date</div>
                            <div class="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono italic">
                                {{ $subscription->expiry_date->format('M d, Y') }}
                            </div>
                        </div>
                        @endif

                        <!-- Price -->
                        <div class="space-y-1">
                            <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monthly Price</div>
                            <div class="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic">
                                {{ $subscription->getFormattedPrice($currency) }}
                            </div>
                        </div>
                    </div>
                    @endif
                </div>

                <!-- Licenses & Features Grid -->
                <div class="grid grid-cols-1 gap-6">
                    <!-- Student Licenses -->
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <flux:icon.users variant="mini" class="text-blue-500" />
                            </div>
                            <div>
                                <flux:heading size="lg">{{ __('Student Licenses') }}</flux:heading>
                                <flux:subheading variant="subtle">{{ $this->licenseStatus }}</flux:subheading>
                            </div>
                        </div>

                        @if ($availableLicenses)
                            <div class="space-y-3 pt-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Capacity Usage</span>
                                    <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                        {{ $this->licenseUsagePercentage }}%
                                    </span>
                                </div>
                                <div class="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 p-0.5">
                                    <div 
                                        class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all shadow-sm"
                                        style="width: {{ min($this->licenseUsagePercentage, 100) }}%"
                                    ></div>
                                </div>
                                @if ($this->licenseUsagePercentage >= 80)
                                    <div class="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-tighter animate-pulse">
                                        <flux:icon.exclamation-circle variant="mini" class="w-3 h-3" />
                                        <span>License limit approaching ({{ number_format($this->licenseUsagePercentage, 1) }}%)</span>
                                    </div>
                                @endif
                            </div>
                        @else
                            <div class="pt-2">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest shadow-sm">
                                    <flux:icon.check-circle variant="mini" class="mr-1.5 w-3.5 h-3.5" />
                                    Unlimited Licenses
                                </span>
                            </div>
                        @endif
                    </div>

                    <!-- Auto-Renewal & Actions -->
                    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
                        @if ($subscription->price > 0 && !$subscription->isFree())
                        <div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <flux:heading size="lg">{{ __('Auto-Renewal') }}</flux:heading>
                                <flux:subheading size="xs">
                                    {{ $autoRenew ? 'Renewing automatically' : 'Expires ' . $subscription->expiry_date->format('M d, Y') }}
                                </flux:subheading>
                            </div>
                            <flux:checkbox 
                                wire:model="autoRenew"
                                wire:change="toggleAutoRenew"
                                class="cursor-pointer"
                            />
                        </div>
                        @endif
                        
                        <div class="flex flex-col gap-2">
                            <flux:label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic mb-1">Billing Actions</flux:label>
                            
                            @if ($subscription->price > 0 && $daysRemaining <= 7)
                                <flux:button variant="primary" icon="arrow-path" wire:click="renewSubscription" class="w-full">
                                    {{ $isExpired ? __('Renew (Expired)') : __('Renew Now') . ' (' . $daysRemaining . ' ' . __('days left') . ')' }}
                                </flux:button>
                            @endif

                            <div class="flex gap-2">
                                @if ($subscription->isPro())
                                    <flux:modal.trigger name="downgrade-modal">
                                        <flux:button variant="danger" icon="arrow-down" class="flex-1">Downgrade</flux:button>
                                    </flux:modal.trigger>
                                    <flux:button variant="primary" icon="sparkles" wire:click="contactForEnterprise" class="flex-1 italic">Enterprise</flux:button>
                                @elseif ($subscription->canUpgradeTo('Pro'))
                                    <flux:button variant="primary" icon="arrow-trending-up" wire:click="showBillingPeriods('Pro')" class="flex-1 font-bold italic">Upgrade to Pro</flux:button>
                                    <flux:button variant="outline" icon="building-office" wire:click="contactForEnterprise" class="flex-1">Enterprise</flux:button>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Plan Features -->
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <flux:icon.star variant="mini" class="text-amber-500" />
                        </div>
                        <div>
                            <flux:heading size="lg">{{ __('Plan Features') }}</flux:heading>
                            <flux:subheading variant="subtle">Capabilities included in your current subscription</flux:subheading>
                        </div>
                    </div>
                    
                    @php
                        $planDetails = $subscription->getPlanDetails();
                        $features = (is_array($planDetails) && isset($planDetails['features']) && is_array($planDetails['features'])) ? $planDetails['features'] : [];
                    @endphp

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        @forelse ($features as $feature => $included)
                            @if (is_string($feature) && is_bool($included))
                                <div class="flex items-center gap-3 p-3 rounded-xl border {{ $included ? 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800' : 'opacity-40 border-transparent grayscale' }}">
                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center border {{ $included ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-sm' : 'border-zinc-200/50 dark:border-zinc-700/50' }}">
                                        @if ($included)
                                            <flux:icon.check variant="mini" class="w-4 h-4 text-emerald-500" />
                                        @else
                                            <flux:icon.x-mark variant="mini" class="w-4 h-4 text-zinc-400" />
                                        @endif
                                    </div>
                                    <span class="text-[11px] font-bold uppercase tracking-tight {{ $included ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400' }}">
                                        {{ str(str_replace('_', ' ', $feature))->title() }}
                                    </span>
                                </div>
                            @endif
                        @empty
                            <flux:text variant="subtle" class="col-span-full italic text-center py-4">{{ __('No features available') }}</flux:text>
                        @endforelse
                    </div>
                </div>

                <!-- Invoice History -->
                <!-- Invoice History -->
                <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                <flux:icon.document-text variant="mini" class="text-zinc-500" />
                            </div>
                            <div>
                                <flux:heading size="lg">{{ __('Recent Invoices') }}</flux:heading>
                                <flux:subheading variant="subtle">Download or view your past subscription records</flux:subheading>
                            </div>
                        </div>
                    </div>
                    
                    @if (count($recentInvoices) > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ __('Date') }}</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ __('Invoice') }}</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ __('Description') }}</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">{{ __('Amount') }}</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">{{ __('Status') }}</th>
                                        <th class="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">{{ __('Actions') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    @foreach ($recentInvoices as $invoice)
                                        <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group text-sm">
                                            <td class="p-4 font-mono text-zinc-600 dark:text-zinc-400 font-bold italic">{{ $invoice['date'] }}</td>
                                            <td class="p-4 font-mono text-[11px] text-zinc-500">{{ $invoice['invoice_number'] }}</td>
                                            <td class="p-4 text-zinc-900 dark:text-zinc-100 font-medium">{{ $invoice['description'] }}</td>
                                            <td class="p-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                                                {{ $invoice['currency'] }} {{ number_format($invoice['amount'], 2) }}
                                            </td>
                                            <td class="p-4 text-center">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border
                                                    @if ($invoice['status'] === 'paid') bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800
                                                    @elseif ($invoice['status'] === 'pending') bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800
                                                    @elseif ($invoice['status'] === 'overdue') bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800
                                                    @else bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 @endif">
                                                    {{ $invoice['status'] }}
                                                </span>
                                            </td>
                                            <td class="p-4 text-right">
                                                <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <flux:button href="{{ route('invoices.download', $invoice['id']) }}" variant="ghost" size="xs" icon="arrow-down-tray" inset="top bottom" />
                                                    <flux:button href="{{ route('invoices.view', $invoice['id']) }}" target="_blank" variant="ghost" size="xs" icon="eye" inset="top bottom" />
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="py-12 text-center">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 mb-4 border border-zinc-100 dark:border-zinc-700">
                                <i class="fas fa-file-invoice text-xl text-zinc-300"></i>
                            </div>
                            <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{{ __('No Invoices Yet') }}</h3>
                            <p class="text-[10px] text-zinc-500 mt-1">{{ __('Records will appear here after your first payment.') }}</p>
                        </div>
                    @endif
                </div>
            </div>
        @else
            <div class="my-6">
                <flux:callout variant="danger" icon="exclamation-triangle" heading="{{ __('No Active Subscription') }}">
                    {{ __('messages.Your school does not currently have an active subscription. Please contact support or upgrade your plan to continue using all features.') }}
                </flux:callout>

                <div class="mt-6 flex gap-3">
                    <flux:button variant="primary" icon="shopping-cart">
                        {{ __('messages.Choose a Plan') }}
                    </flux:button>
                    <flux:button variant="outline" icon="envelope">
                        {{ __('messages.Contact Support') }}
                    </flux:button>
                </div>
            </div>
        @endif

    <!-- Billing Period Selection Modal -->
    <flux:modal name="billing-period-modal" wire:model="showBillingPeriodModal" class="max-w-lg">
        <div class="space-y-6">
            @if ($upgradePlan && count($billingOptions) > 0)
                <div>
                    <flux:heading size="lg">Upgrade to {{ $upgradePlan }}</flux:heading>
                    <flux:subheading>Choose your billing period and save with longer commitments</flux:subheading>
                </div>

                <flux:radio.group wire:model.live="selectedBillingPeriod" class="flex-col">
                    @foreach ($billingOptions as $period => $option)
                        @if (is_array($option) && !isset($option['error']))
                            @php
                                $label = $period === 'monthly' ? 'Monthly Billing' : ($period === 'biannual' ? 'Bi-Annual (6 Months)' : 'Annual Billing (12 Months)');
                                $priceInfo = $option['currency_symbol'] . number_format($option['total'], 2);
                                $description = $option['months'] . ' month' . ($option['months'] > 1 ? 's' : '') . ' @ ' . $option['currency_symbol'] . number_format($option['monthly_price'], 2) . '/month';
                                if ($option['discount'] > 0) {
                                    $description .= ' (Save ' . $option['currency_symbol'] . number_format($option['discount'], 2) . ')';
                                }
                            @endphp
                            <flux:radio 
                                value="{{ $period }}" 
                                :label="$label . ' - ' . $priceInfo"
                                :description="$description"
                            />
                        @endif
                    @endforeach
                </flux:radio.group>

                <div class="flex justify-end gap-2">
                    <flux:button variant="ghost" wire:click="closeBillingPeriodModal" :disabled="$showPaymentInitiating">Cancel</flux:button>
                    <flux:button variant="primary" wire:click="initiatePlanUpgrade" :loading="$showPaymentInitiating">
                        Proceed to Payment
                    </flux:button>
                </div>
            @else
                <div class="flex items-center justify-center p-8">
                    <flux:icon.loading />
                </div>
            @endif
        </div>
    </flux:modal>

    <!-- Enterprise Upgrade Modal -->
    <flux:modal name="enterprise-upgrade-modal" wire:model="showEnterpriseModal" class="max-w-lg">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">{{ __('Upgrade to Enterprise') }}</flux:heading>
                <flux:subheading>
                    {{ __('Get a custom solution tailored to your school\'s needs.') }}
                </flux:subheading>
            </div>

            <div class="space-y-4">
                <flux:text>
                    {{ __('Our Enterprise plan works differently. We need to evaluate your school requirements to provide the best custom pricing and feature set.') }}
                </flux:text>

                <ul class="space-y-3">
                    <li class="flex items-center gap-2">
                        <flux:icon.check class="w-5 h-5 text-green-500" />
                        <flux:text>{{ __('Unlimited Student Licenses') }}</flux:text>
                    </li>
                    <li class="flex items-center gap-2">
                        <flux:icon.check class="w-5 h-5 text-green-500" />
                        <flux:text>{{ __('Priority 24/7 Support') }}</flux:text>
                    </li>
                    <li class="flex items-center gap-2">
                        <flux:icon.check class="w-5 h-5 text-green-500" />
                        <flux:text>{{ __('Custom Integrations & API Access') }}</flux:text>
                    </li>
                    <li class="flex items-center gap-2">
                        <flux:icon.check class="w-5 h-5 text-green-500" />
                        <flux:text>{{ __('Dedicated Account Manager') }}</flux:text>
                    </li>
                </ul>
            </div>

            <div class="flex justify-end gap-2">
                <flux:button variant="ghost" wire:click="closeEnterpriseModal">{{ __('Close') }}</flux:button>
                
                <flux:button 
                    variant="primary" 
                    icon="envelope" 
                    href="mailto:admin@pro.com?subject=Enterprise%20Plan%20Inquiry&body=Hello%2C%20I%20would%20like%20to%20inquire%20about%20the%20Enterprise%20plan%20for%20my%20school."
                    class="no-underline"
                >
                    {{ __('Contact Sales') }}
                </flux:button>
            </div>
        </div>
    </flux:modal>

    <!-- Downgrade Confirmation Modal -->
    <flux:modal name="downgrade-modal" class="max-w-lg">
        <div class="space-y-6">
            <div>
                <flux:heading size="lg">{{ __('Confirm Downgrade') }}</flux:heading>
                <flux:subheading>
                    {{ __('Are you sure you want to downgrade to the Basic plan? You will lose access to Pro features immediately.') }}
                </flux:subheading>
            </div>

            <flux:callout variant="warning" icon="exclamation-triangle">
                {{ __('Your student limit will be reduced to 150. If you have more than 150 students, some will be deactivated.') }}
            </flux:callout>

            <div class="flex justify-end gap-2">
                <flux:modal.close>
                    <flux:button variant="ghost">{{ __('Cancel') }}</flux:button>
                </flux:modal.close>

                <flux:button variant="danger" wire:click="downgradeToBasic">
                    {{ __('Yes, Downgrade') }}
                </flux:button>
            </div>
        </div>
    </flux:modal>
</x-settings.layout>

    <script>
        // Listen for redirect-to-paystack event from Livewire
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Livewire !== 'undefined') {
                Livewire.on('redirect-to-paystack', (data) => {
                    // Handle both cases: direct URL string or object with url property
                    let redirectUrl = typeof data === 'string' ? data : data?.url;
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    }
                });
            }
        });
    </script>
</section>
