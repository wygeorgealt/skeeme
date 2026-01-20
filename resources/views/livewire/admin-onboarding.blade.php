<div>
    <x-layouts.auth title="School Onboarding">
        <div class="flex flex-col gap-8">
            {{-- Progress Stepper --}}
            <div class="flex items-center justify-between px-2 pt-2">
                <div class="flex flex-col items-center gap-2">
                    <div class="size-9 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300 {{ $step >= 1 ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 border border-indigo-200' : 'bg-slate-100 text-slate-400' }}">1</div>
                    <span class="text-[9px] uppercase font-black tracking-widest {{ $step >= 1 ? 'text-indigo-600' : 'text-slate-400' }}">Profile</span>
                </div>
                <div class="flex-1 h-[2px] bg-slate-100 mx-4 mt-[-22px] {{ $step >= 2 ? 'bg-indigo-600/20' : '' }}"></div>
                <div class="flex flex-col items-center gap-2">
                    <div class="size-9 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300 {{ $step >= 2 ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 border border-indigo-200' : 'bg-slate-100 text-slate-400' }}">2</div>
                    <span class="text-[9px] uppercase font-black tracking-widest {{ $step >= 2 ? 'text-indigo-600' : 'text-slate-400' }}">School</span>
                </div>
                <div class="flex-1 h-[2px] bg-slate-100 mx-4 mt-[-22px] {{ $step >= 3 ? 'bg-indigo-600/20' : '' }}"></div>
                <div class="flex flex-col items-center gap-2">
                    <div class="size-9 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300 {{ $step >= 3 ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 border border-indigo-200' : 'bg-slate-100 text-slate-400' }}">3</div>
                    <span class="text-[9px] uppercase font-black tracking-widest {{ $step >= 3 ? 'text-indigo-600' : 'text-slate-400' }}">Plan</span>
                </div>
            </div>

            @if ($step === 1)
                {{-- Step 1: Personal & School Name --}}
                <div class="flex flex-col gap-6" data-aos="fade-up" wire:key="step-1">
                    <div class="text-center space-y-2">
                        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Step 2: <span class="text-gradient">The Basics</span></h1>
                        <p class="text-sm text-slate-500 font-medium">Tell us your name and the name of your institution.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <flux:input wire:model="firstName" :label="__('First Name')" placeholder="John" required autocomplete="off" class="!rounded-2xl" />
                        <flux:input wire:model="lastName" :label="__('Last Name')" placeholder="Doe" required autocomplete="off" class="!rounded-2xl" />
                    </div>

                    <flux:input wire:model="schoolName" :label="__('School Name')" placeholder="Skeeme International Academy" required class="!rounded-2xl" />

                    <div class="pt-4">
                        <flux:button wire:click="nextStep" variant="primary" class="w-full !rounded-2xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                            {{ __('Next: School Details') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @elseif ($step === 2)
                {{-- Step 2: Academic & Settings --}}
                <div class="flex flex-col gap-6" data-aos="fade-up" wire:key="step-2">
                    <div class="text-center space-y-2">
                        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Step 3: <span class="text-gradient">Config</span></h1>
                        <p class="text-sm text-slate-500 font-medium">Set up your school's local settings and branding.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <flux:input wire:model="academicYear" :label="__('Academic Year')" placeholder="2025/2026" required autocomplete="off" class="!rounded-2xl" />
                        <flux:select wire:model="timezone" :label="__('Timezone')" class="!rounded-2xl">
                            @foreach ($timezones as $value => $label)
                                <flux:select.option :value="$value">{{ $label }}</flux:select.option>
                            @endforeach
                        </flux:select>
                    </div>

                    <flux:textarea wire:model="address" :label="__('School Address')" placeholder="123 Education Way, Lagos..." class="!rounded-2xl" />

                    <div class="flex items-center gap-4 pt-2">
                        <flux:button wire:click="previousStep" variant="ghost" class="flex-1 !rounded-2xl !py-4 font-bold">
                            Back
                        </flux:button>
                        <flux:button wire:click="nextStep" variant="primary" class="flex-[2] !rounded-2xl !py-4 font-black text-sm tracking-tight shadow-xl shadow-indigo-100">
                            {{ __('Next: Choose Plan') }} <flux:icon.arrow-right variant="micro" class="ml-2" />
                        </flux:button>
                    </div>
                </div>
            @elseif ($step === 3)
                {{-- Step 3: Plan Selection --}}
                <div class="flex flex-col gap-6" data-aos="fade-up" wire:key="step-3">
                    <div class="text-center space-y-2">
                        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Final Step: <span class="text-gradient">Choose Plan</span></h1>
                        <p class="text-sm text-slate-500 font-medium">Choose the scale that fits your institution best.</p>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        {{-- Free Plan --}}
                        <div wire:click="selectPlan('free')" class="p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden {{ $plan === 'free' ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200 group' }}">
                            <div class="flex items-start justify-between relative z-10">
                                <div class="flex items-center gap-4">
                                    <div class="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <flux:icon.rocket variant="solid" class="size-5" />
                                    </div>
                                    <div>
                                        <h4 class="font-black text-slate-900">Basic (Free)</h4>
                                        <p class="text-[11px] text-slate-500 mt-0.5 font-bold">Up to 150 students. Essential features.</p>
                                    </div>
                                </div>
                                <span class="text-xl font-black text-slate-900">$0</span>
                            </div>
                        </div>

                        {{-- Pro Plan --}}
                        <div wire:click="selectPlan('pro')" class="p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden {{ $plan === 'pro' ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200 group' }}">
                            <div class="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-[9px] font-black text-white uppercase tracking-widest rounded-bl-2xl">Recommended</div>
                            <div class="flex items-start justify-between relative z-10">
                                <div class="flex items-center gap-4">
                                    <div class="size-10 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600">
                                        <flux:icon.sparkles variant="solid" class="size-5" />
                                    </div>
                                    <div>
                                        <h4 class="font-black text-slate-900">Pro</h4>
                                        <p class="text-[11px] text-slate-500 mt-0.5 font-bold">Unlimited students. AI tools & Analytics.</p>
                                    </div>
                                </div>
                                <span class="text-xl font-black text-indigo-600">$39.00<span class="text-xs text-slate-400">/mo</span></span>
                            </div>
                        </div>

                        {{-- Enterprise Plan Removed --}}
                    </div>

                    <div class="flex items-center gap-4 pt-4">
                        <flux:button wire:click="previousStep" variant="ghost" class="w-full !rounded-2xl !py-4 font-bold h-14">
                            Back to school setup
                        </flux:button>
                    </div>
                </div>
            @endif
        </div>
    </x-layouts.auth>

    {{-- Billing Period Modal --}}
    @if ($showBillingPeriodModal)
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
            <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-slate-100" data-aos="zoom-in">
                <div class="absolute top-[-20%] left-[-20%] size-64 rounded-full bg-indigo-500/10 blur-[80px]"></div>
                
                <h3 class="text-2xl font-black text-slate-900 tracking-tight mb-2 relative z-10">Finalize Pro Plan</h3>
                <p class="text-sm text-slate-500 mb-8 relative z-10 font-medium">Choose your billing frequency to continue.</p>

                <div class="flex flex-col gap-3 mb-8 relative z-10">
                    @foreach($billingOptions as $option)
                        <label class="relative cursor-pointer group">
                            <input type="radio" wire:model.live="selectedBillingPeriod" value="{{ $option['period'] }}" class="peer sr-only">
                            <div class="p-5 border-2 rounded-3xl transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50/50 border-slate-100 hover:border-indigo-100 bg-white/50 backdrop-blur-sm">
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-col">
                                        <span class="font-black text-slate-900">{{ ucfirst($option['period']) }}</span>
                                        <span class="text-[11px] text-slate-500 font-bold tracking-tight mt-0.5">{{ $option['amount_display'] }} per month</span>
                                    </div>
                                    @if($option['period'] === 'yearly')
                                        <span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-200">Save 15%</span>
                                    @endif
                                </div>
                            </div>
                        </label>
                    @endforeach
                </div>

                <div class="flex flex-col gap-3 relative z-10">
                    <flux:button wire:click="initiatePlanUpgrade" variant="primary" class="w-full !rounded-2xl !py-4 font-black text-base shadow-xl shadow-indigo-200" :disabled="!$selectedBillingPeriod || $showPaymentInitiating">
                        <span wire:loading.remove wire:target="initiatePlanUpgrade">Proceed to Payment</span>
                        <span wire:loading wire:target="initiatePlanUpgrade">Initiating...</span>
                    </flux:button>
                    <flux:button wire:click="closeBillingPeriodModal" variant="ghost" class="w-full !rounded-2xl !py-3 font-bold text-slate-400">
                        Cancel
                    </flux:button>
                </div>
            </div>
        </div>
    @endif
</div>
