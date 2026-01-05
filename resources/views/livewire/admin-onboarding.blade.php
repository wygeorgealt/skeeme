<div>
    <x-layouts.auth title="School Onboarding">
        <div class="flex flex-col gap-8">
            {{-- Progress Stepper --}}
            <div class="flex items-center justify-between px-2">
                <div class="flex flex-col items-center gap-2">
                    <div class="size-8 rounded-full flex items-center justify-center text-xs font-black {{ $step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400' }}">1</div>
                    <span class="text-[10px] uppercase font-black tracking-widest {{ $step >= 1 ? 'text-indigo-600' : 'text-slate-400' }}">Profile</span>
                </div>
                <div class="flex-1 h-px bg-slate-100 mx-4 mt-[-20px]"></div>
                <div class="flex flex-col items-center gap-2">
                    <div class="size-8 rounded-full flex items-center justify-center text-xs font-black {{ $step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400' }}">2</div>
                    <span class="text-[10px] uppercase font-black tracking-widest {{ $step >= 2 ? 'text-indigo-600' : 'text-slate-400' }}">School</span>
                </div>
                <div class="flex-1 h-px bg-slate-100 mx-4 mt-[-20px]"></div>
                <div class="flex flex-col items-center gap-2">
                    <div class="size-8 rounded-full flex items-center justify-center text-xs font-black {{ $step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400' }}">3</div>
                    <span class="text-[10px] uppercase font-black tracking-widest {{ $step >= 3 ? 'text-indigo-600' : 'text-slate-400' }}">Plan</span>
                </div>
            </div>

            @if ($step === 1)
                {{-- Step 1: Personal & School Name --}}
                <div class="flex flex-col gap-6" data-aos="fade-up" wire:key="step-1">
                    <x-auth-header 
                        :title="__('Let\'s start with basics')" 
                        :description="__('Tell us your name and the name of your institution.')" 
                    />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <flux:input wire:model="firstName" :label="__('First Name')" placeholder="John" required autocomplete="off" />
                        <flux:input wire:model="lastName" :label="__('Last Name')" placeholder="Doe" required autocomplete="off" />
                    </div>

                    <flux:input wire:model="schoolName" :label="__('School Name')" placeholder="Skeeme International Academy" required />

                    <div class="pt-4">
                        <flux:button wire:click="nextStep" variant="primary" class="w-full !rounded-xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                            {{ __('Next: School Details') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @elseif ($step === 2)
                {{-- Step 2: Academic & Settings --}}
                <div class="flex flex-col gap-6" data-aos="fade-up" wire:key="step-2">
                    <x-auth-header 
                        :title="__('School Configuration')" 
                        :description="__('Set up your school\'s local settings and branding.')" 
                    />

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <flux:input wire:model="academicYear" :label="__('Academic Year')" placeholder="2025/2026" required autocomplete="off" />
                        <flux:select wire:model="timezone" :label="__('Timezone')">
                            @foreach ($timezones as $value => $label)
                                <flux:select.option :value="$value">{{ $label }}</flux:select.option>
                            @endforeach
                        </flux:select>
                    </div>

                    <flux:textarea wire:model="address" :label="__('School Address')" placeholder="123 Education Way, Lagos..." />

                    <div class="flex items-center gap-4 pt-2">
                        <flux:button wire:click="previousStep" variant="ghost" class="flex-1 !rounded-xl !py-4 font-bold">
                            Back
                        </flux:button>
                        <flux:button wire:click="nextStep" variant="primary" class="flex-[2] !rounded-xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                            {{ __('Next: Choose Plan') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @elseif ($step === 3)
                {{-- Step 3: Plan Selection --}}
                <div class="flex flex-col gap-6" data-aos="fade-up" wire:key="step-3">
                    <x-auth-header 
                        :title="__('Select your plan')" 
                        :description="__('Choose the scale that fits your institution best.')" 
                    />

                    <div class="grid grid-cols-1 gap-4">
                        {{-- Free Plan --}}
                        <div wire:click="selectPlan('free')" class="p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 {{ $plan === 'free' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200' }}">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h4 class="font-black text-slate-900">Basic (Free)</h4>
                                    <p class="text-xs text-slate-500 mt-1">Up to 150 students. Essential features.</p>
                                </div>
                                <span class="text-lg font-black text-slate-900">$0</span>
                            </div>
                        </div>

                        {{-- Pro Plan --}}
                        <div wire:click="selectPlan('pro')" class="p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden {{ $plan === 'pro' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200' }}">
                            <div class="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest rounded-bl-xl">Popular</div>
                            <div class="flex items-start justify-between">
                                <div>
                                    <h4 class="font-black text-slate-900">Pro</h4>
                                    <p class="text-xs text-slate-500 mt-1">Unlimited students. AI tools & Analytics.</p>
                                </div>
                                <span class="text-lg font-black text-indigo-600">$39.00<span class="text-xs text-slate-400">/mo</span></span>
                            </div>
                        </div>

                        {{-- Enterprise --}}
                        <div wire:click="selectPlan('enterprise')" class="p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 {{ $plan === 'enterprise' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200' }}">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h4 class="font-black text-slate-900">Enterprise</h4>
                                    <p class="text-xs text-slate-500 mt-1">Custom features for large universities.</p>
                                </div>
                                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Us</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 pt-4">
                        <flux:button wire:click="previousStep" variant="ghost" class="w-full !rounded-xl !py-4 font-bold">
                            Back
                        </flux:button>
                    </div>
                </div>
            @endif
        </div>
    </x-layouts.auth>

    {{-- Billing Period Modal --}}
    @if ($showBillingPeriodModal)
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden" data-aos="zoom-in">
                <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[60px]"></div>
                
                <h3 class="text-2xl font-black text-slate-900 tracking-tight mb-2">Finalize Pro Plan</h3>
                <p class="text-sm text-slate-500 mb-6">Choose your billing frequency to continue.</p>

                <div class="flex flex-col gap-3 mb-8">
                    @foreach($billingOptions as $option)
                        <label class="relative cursor-pointer group">
                            <input type="radio" wire:model.live="selectedBillingPeriod" value="{{ $option['period'] }}" class="peer sr-only">
                            <div class="p-4 border-2 rounded-2xl transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 border-slate-100 hover:border-indigo-100">
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-900">{{ ucfirst($option['period']) }}</span>
                                        <span class="text-xs text-slate-500">{{ $option['amount_display'] }} per month</span>
                                    </div>
                                    @if($option['period'] === 'yearly')
                                        <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-md">Save 15%</span>
                                    @endif
                                </div>
                            </div>
                        </label>
                    @endforeach
                </div>

                <div class="flex flex-col gap-3">
                    <flux:button wire:click="initiatePlanUpgrade" variant="primary" class="w-full !rounded-xl !py-4 font-black shadow-xl shadow-indigo-100" :disabled="!$selectedBillingPeriod || $showPaymentInitiating">
                        <span wire:loading.remove wire:target="initiatePlanUpgrade">Proceed to Payment</span>
                        <span wire:loading wire:target="initiatePlanUpgrade">Initiating...</span>
                    </flux:button>
                    <flux:button wire:click="closeBillingPeriodModal" variant="ghost" class="w-full !rounded-xl !py-3 font-bold">
                        Cancel
                    </flux:button>
                </div>
            </div>
        </div>
    @endif
</div>
