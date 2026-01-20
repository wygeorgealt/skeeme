@extends('layouts.landing')

@section('title', 'Skeeme for Students | AI Study Assistant')

@section('content')
<div class="relative bg-white min-h-screen pt-24 pb-12">
    <!-- Background Decor -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
        <div class="absolute -top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-50/50 blur-[80px]"></div>
        <div class="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[80px]"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 relative z-10">
        
        <!-- Hero Section -->
        <div class="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <br><br>
            <h1 class="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Ace your exams <br> <span class="text-gradient">with AI.</span>
            </h1>
            <p class="text-lg text-slate-500 font-medium leading-relaxed">
                Turn your messy notes into practice quizzes instantly. <br class="hidden md:block">
                The smart study companion that never sleeps.
            </p>
        </div>

        <!-- Interactive Demo / Tool -->
        <livewire:landing.student-ai-product />

        <!-- Pricing / Access Section -->
        <div class="max-w-4xl mx-auto border-t border-slate-100 pt-24" id="pricing">
            <div class="text-center mb-16">
                 <h2 class="text-3xl font-extrabold text-slate-900 mb-4">{{ Auth::check() ? 'Your Subscription Plan' : 'Simple Student Pricing' }}</h2>
                 <p class="text-slate-500 max-w-lg mx-auto">
                    @if(Auth::check() && Auth::user()->is_unlimited_student)
                        You have full access to all features. Stay unstoppable!
                    @else
                        Get enough credits to ace your midterms, or go unlimited for finals week.
                    @endif
                 </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Free -->
                <div class="p-8 rounded-[32px] {{ (Auth::check() && !Auth::user()->is_unlimited_student) ? 'bg-indigo-50/50 ring-2 ring-indigo-100' : 'bg-slate-50' }} border border-slate-100 relative">
                    @if(Auth::check() && !Auth::user()->is_unlimited_student)
                        <div class="absolute top-4 right-4 px-3 py-1 bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest rounded-full">Active Plan</div>
                    @endif
                    <h3 class="text-lg font-black text-slate-900 mb-2">Free Plan</h3>
                    <div class="text-4xl font-extrabold text-slate-900 mb-6">$0<span class="text-base text-slate-400 font-medium">/mo</span></div>
                    
                    <ul class="space-y-4 mb-8">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check class="text-indigo-600 size-4" /> 
                            @if(Auth::check() && !Auth::user()->is_unlimited_student)
                                <span class="text-indigo-600">{{ number_format(Auth::user()->credits) }} Credits Remaining</span>
                            @else
                                500 Credits / Month
                            @endif
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check class="text-indigo-600 size-4" /> ~10 Generated Quizzes
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check class="text-indigo-600 size-4" /> Basic History
                        </li>
                    </ul>

                    @guest
                        <flux:button href="{{ route('register') }}" variant="outline" class="w-full bg-white !border-slate-200 !text-slate-900 font-bold hover:!border-indigo-200 hover:!text-indigo-600">
                            Create Free Account
                        </flux:button>
                    @else
                        <div class="w-full h-12 flex items-center justify-center text-slate-400 font-bold text-sm tracking-tight italic">
                            Included in your account
                        </div>
                    @endguest
                </div>

                <!-- Pro -->
                <div class="p-8 rounded-[32px] {{ (Auth::check() && Auth::user()->is_unlimited_student) ? 'bg-slate-900 ring-4 ring-indigo-500/20 shadow-indigo-200 shadow-2xl' : 'bg-slate-900' }} text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                    
                    @if(Auth::check() && Auth::user()->is_unlimited_student)
                        <div class="absolute top-4 right-4 px-3 py-1 bg-white text-[10px] font-black text-indigo-900 uppercase tracking-widest rounded-full z-20 shadow-sm">Current Plan</div>
                    @endif

                    <div class="relative z-10">
                        <h3 class="text-lg font-black text-white mb-2">Unlimited</h3>
                        <div class="text-4xl font-extrabold text-white mb-6"><span id="student-price-value">₦5,000</span><span class="text-base text-slate-400 font-medium">/mo</span></div>
                        
                        <ul class="space-y-4 mb-8">
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <div class="size-4 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px]"><i class="fas fa-infinity"></i></div>
                                Unlimited Credits
                            </li>
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <flux:icon.check class="text-indigo-400 size-4" /> Priority Generation
                            </li>
                            <li class="flex items-center gap-3 text-sm font-bold text-slate-200">
                                <flux:icon.check class="text-indigo-400 size-4" /> Advanced File Inputs
                            </li>
                        </ul>

                        @if(Auth::check() && Auth::user()->is_unlimited_student)
                            <div class="w-full h-12 flex items-center justify-center text-indigo-400 font-bold text-sm tracking-tight italic">
                                Plan active & ready
                            </div>
                        @else
                            <flux:button href="{{ route('students.subscribe') }}" variant="primary" class="w-full !border-0 !bg-white !text-indigo-900 font-extrabold hover:!bg-indigo-50">
                                Get Unlimited
                            </flux:button>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    const currencyMap = {
        'NG': { code: 'NGN', symbol: '₦', rate: 5000 / 39, basePrice: 39 }, // Adjusting to the $39 base if needed, or just hardcoding the 5000
        'GH': { code: 'GHS', symbol: '₵', rate: 40 / 2.99, basePrice: 2.99 },
        'KE': { code: 'KES', symbol: 'Ks', rate: 400 / 2.99, basePrice: 2.99 },
        'ZA': { code: 'ZAR', symbol: 'R', rate: 60 / 2.99, basePrice: 2.99 },
        'US': { code: 'USD', symbol: '$', rate: 1, basePrice: 2.99 },
        'default': { code: 'USD', symbol: '$', rate: 1, basePrice: 2.99 }
    };

    // Special case for Student Unlimited: USD 2.99 vs NGN 5000
    function updateStudentPricing(countryCode) {
        const display = document.getElementById('student-price-value');
        if (!display) return;

        if (countryCode === 'NG') {
            display.textContent = '₦5,000';
        } else {
            // For other countries, maybe stick to 2.99 or convert
            display.textContent = '$2.99';
        }
    }

    // Auto-detect on load
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            updateStudentPricing(data.country_code);
        } catch (e) {
            updateStudentPricing('US');
        }
    });
</script>
@endpush
