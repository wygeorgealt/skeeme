@extends('layouts.landing')

@section('content')
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[120px]"></div>
    </div>

    <!-- Pricing Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-4xl mx-auto">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Transparent Pricing</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Scale your school <br> 
                    <span class="text-gradient">without complexity.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Simple, transparent plans designed for institutions of any size. All plans include core features to get you started.
                </p>

                <!-- Currency Picker -->
                <div data-aos="fade-up" data-aos-delay="300" class="flex flex-col items-center gap-4">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-400">
                        Prices shown in <span id="currency-display" class="text-slate-900">USD</span>
                    </div>
                    <flux:dropdown>
                        <flux:button variant="ghost" class="!rounded-full border border-slate-200 !px-6 !py-2 text-xs font-black uppercase tracking-widest text-slate-600">
                            Change Currency <flux:icon.chevron-down variant="micro" class="ml-2 opacity-50" />
                        </flux:button>
                        <flux:menu class="p-2 rounded-xl border-slate-100">
                            <flux:menu.item onclick="updateCurrency('US')">USD ($)</flux:menu.item>
                            <flux:menu.item onclick="updateCurrency('NG')">NGN (₦)</flux:menu.item>
                            <flux:menu.item onclick="updateCurrency('GH')">GHS (₵)</flux:menu.item>
                            <flux:menu.item onclick="updateCurrency('KE')">KES (Ks)</flux:menu.item>
                            <flux:menu.item onclick="updateCurrency('ZA')">ZAR (R)</flux:menu.item>
                        </flux:menu>
                    </flux:dropdown>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Grid -->
    <section class="relative z-10 pb-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Free Plan -->
                <div class="premium-card p-10 flex flex-col" data-aos="fade-up">
                    <div class="mb-10">
                        <h3 class="text-xl font-extrabold text-slate-900 mb-2">Free Plan</h3>
                        <p class="text-sm text-slate-500 font-medium">Perfect for small schools getting started</p>
                    </div>

                    <div class="mb-10">
                        <div class="text-5xl font-black text-slate-900 tracking-tighter">Free</div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Forever free</p>
                    </div>

                    <flux:button href="{{ url('register') }}" variant="ghost" class="w-full !rounded-2xl !py-4 font-extrabold !border-slate-200 text-slate-900 mb-10">
                        Get Started Free
                    </flux:button>

                    <ul class="space-y-4 mb-auto">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-emerald-500" /> Up to 150 students
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-emerald-500" /> Basic management
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-emerald-500" /> Student enrollment
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-emerald-500" /> Basic reporting
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-400 opacity-50">
                            <flux:icon.x-mark variant="micro" /> AI Question Builder
                        </li>
                    </ul>
                </div>

                <!-- Pro Plan -->
                <div class="premium-card p-10 flex flex-col border-indigo-500/20 ring-4 ring-indigo-500/5 relative scale-105" data-aos="fade-up" data-aos-delay="100">
                    <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white">
                        Most Popular
                    </div>

                    <div class="mb-10">
                        <h3 class="text-xl font-extrabold text-slate-900 mb-2">Pro Plan</h3>
                        <p class="text-sm text-slate-500 font-medium">For growing institutions with advanced needs</p>
                    </div>

                    <div class="mb-10">
                        <div class="flex items-baseline gap-1">
                            <span class="text-5xl font-black text-slate-900 tracking-tighter" id="pro-price-value">$39.00</span>
                            <span class="text-sm font-bold text-slate-400" id="pro-price-period">/mo</span>
                        </div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Billed monthly</p>
                    </div>

                    <flux:button href="{{ url('register') }}" variant="primary" class="w-full !rounded-2xl !py-4 font-extrabold shadow-xl shadow-indigo-100 mb-10">
                        Get Started Pro
                    </flux:button>

                    <ul class="space-y-4 mb-auto">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-indigo-600" /> Unlimited students
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.star variant="micro" class="text-indigo-600" /> AI Question Builder
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.star variant="micro" class="text-indigo-600" /> AI Assisted Grading
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.star variant="micro" class="text-indigo-600" /> Advanced Analytics
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-indigo-600" /> Priority support
                        </li>
                    </ul>
                </div>

                <!-- Custom Plan -->
                <div class="premium-card p-10 flex flex-col" data-aos="fade-up" data-aos-delay="200">
                    <div class="mb-10">
                        <h3 class="text-xl font-extrabold text-slate-900 mb-2">Enterprise</h3>
                        <p class="text-sm text-slate-500 font-medium">Complete solution for large institutions</p>
                    </div>

                    <div class="mb-10">
                        <div class="text-5xl font-black text-slate-900 tracking-tighter">Custom</div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Scale-ready</p>
                    </div>

                    <flux:button href="{{ url('contact') }}" variant="ghost" class="w-full !rounded-2xl !py-4 font-extrabold !border-slate-200 text-slate-900 mb-10">
                        Contact Sales
                    </flux:button>

                    <ul class="space-y-4 mb-auto">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-slate-400" /> All Pro features
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-slate-400" /> Full API access
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-slate-400" /> Custom integrations
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-slate-400" /> White-label options
                        </li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <flux:icon.check variant="micro" class="text-slate-400" /> Dedicated AM
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Detailed Comparison -->
    <section class="py-32 bg-slate-50/50" id="compare-plans">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-24">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Deep Dive</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Compare every detail.</h3>
            </div>

            <div class="overflow-hidden premium-card !rounded-3xl border-slate-100" data-aos="fade-up">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-100">
                                <th class="p-8 text-xs font-black uppercase tracking-widest text-slate-400">Feature</th>
                                <th class="p-8 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Free</th>
                                <th class="p-8 text-xs font-black uppercase tracking-widest text-indigo-600 text-center">Pro</th>
                                <th class="p-8 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <!-- Feature Group 1 -->
                            <tr class="hover:bg-slate-50/30 transition-colors">
                                <td class="p-8">
                                    <div class="font-extrabold text-slate-900 text-sm">Students Limit</div>
                                    <div class="text-xs text-slate-500 font-medium">Cumulative per academic session</div>
                                </td>
                                <td class="p-8 text-center text-sm font-bold text-slate-600">150</td>
                                <td class="p-8 text-center text-sm font-black text-indigo-600 bg-indigo-50/20">Unlimited</td>
                                <td class="p-8 text-center text-sm font-bold text-slate-600">Unlimited</td>
                            </tr>
                            <tr class="hover:bg-slate-50/30 transition-colors">
                                <td class="p-8">
                                    <div class="font-extrabold text-slate-900 text-sm">AI Question Builder</div>
                                    <div class="text-xs text-slate-500 font-medium">Smart generation from content</div>
                                </td>
                                <td class="p-8 text-center"><flux:icon.x-mark variant="micro" class="mx-auto text-slate-200" /></td>
                                <td class="p-8 text-center bg-indigo-50/20"><flux:icon.check variant="micro" class="mx-auto text-indigo-600" /></td>
                                <td class="p-8 text-center"><flux:icon.check variant="micro" class="mx-auto text-slate-400" /></td>
                            </tr>
                            <tr class="hover:bg-slate-50/30 transition-colors">
                                <td class="p-8">
                                    <div class="font-extrabold text-slate-900 text-sm">Advanced Analytics</div>
                                    <div class="text-xs text-slate-500 font-medium">Predictive student performance</div>
                                </td>
                                <td class="p-8 text-center"><flux:icon.x-mark variant="micro" class="mx-auto text-slate-200" /></td>
                                <td class="p-8 text-center bg-indigo-50/20"><flux:icon.check variant="micro" class="mx-auto text-indigo-600" /></td>
                                <td class="p-8 text-center"><flux:icon.check variant="micro" class="mx-auto text-slate-400" /></td>
                            </tr>
                            <tr class="hover:bg-slate-50/30 transition-colors">
                                <td class="p-8">
                                    <div class="font-extrabold text-slate-900 text-sm">Enterprise API</div>
                                    <div class="text-xs text-slate-500 font-medium">Direct data access & hooks</div>
                                </td>
                                <td class="p-8 text-center"><flux:icon.x-mark variant="micro" class="mx-auto text-slate-200" /></td>
                                <td class="p-8 text-center bg-indigo-50/20"><flux:icon.x-mark variant="micro" class="mx-auto text-slate-200" /></td>
                                <td class="p-8 text-center"><flux:icon.check variant="micro" class="mx-auto text-slate-400" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="py-32">
        <div class="max-w-4xl mx-auto px-6">
            <div class="text-center mb-24">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Questions</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl font-extrabold text-slate-900 tracking-tight">Got questions? We've got answers.</h3>
            </div>

            <div class="space-y-4" data-aos="fade-up" x-data="{ active: null }">
                <!-- FAQ Item 1 -->
                <div class="premium-card p-6 !rounded-2xl cursor-pointer hover:border-indigo-500/20 transition-all" @click="active = active === 0 ? null : 0">
                    <div class="flex items-center justify-between">
                        <h4 class="font-extrabold text-slate-900">Can I change plans anytime?</h4>
                        <flux:icon.chevron-down variant="micro" class="transition-transform duration-300" x-bind:class="active === 0 ? 'rotate-180' : ''" />
                    </div>
                    <div x-show="active === 0" x-collapse x-cloak>
                        <p class="text-slate-500 font-medium text-sm pt-4 leading-relaxed">
                            Yes, absolutely. Upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate billing based on your usage.
                        </p>
                    </div>
                </div>

                <!-- FAQ Item 2 -->
                <div class="premium-card p-6 !rounded-2xl cursor-pointer hover:border-indigo-500/20 transition-all" @click="active = active === 1 ? null : 1">
                    <div class="flex items-center justify-between">
                        <h4 class="font-extrabold text-slate-900">Is there a free plan?</h4>
                        <flux:icon.chevron-down variant="micro" class="transition-transform duration-300" x-bind:class="active === 1 ? 'rotate-180' : ''" />
                    </div>
                    <div x-show="active === 1" x-collapse x-cloak>
                        <p class="text-slate-500 font-medium text-sm pt-4 leading-relaxed">
                            Yes! Our Free plan is always available at zero cost with no time limit. Upgrade to Pro anytime to unlock advanced features like AI-powered question generation and auto-grading.
                        </p>
                    </div>
                </div>

                <!-- FAQ Item 3 -->
                <div class="premium-card p-6 !rounded-2xl cursor-pointer hover:border-indigo-500/20 transition-all" @click="active = active === 2 ? null : 2">
                    <div class="flex items-center justify-between">
                        <h4 class="font-extrabold text-slate-900">What payment methods do you accept?</h4>
                        <flux:icon.chevron-down variant="micro" class="transition-transform duration-300" x-bind:class="active === 2 ? 'rotate-180' : ''" />
                    </div>
                    <div x-show="active === 2" x-collapse x-cloak>
                        <p class="text-slate-500 font-medium text-sm pt-4 leading-relaxed">
                            We accept credit cards, bank transfers, and local payment solutions. Enterprise customers can arrange custom payment terms and invoicing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6 text-center">
            <h2 data-aos="fade-up" class="text-3xl font-extrabold text-slate-900 mb-8">Ready to transform your school?</h2>
            <div data-aos="fade-up" data-aos-delay="100" class="flex justify-center gap-4">
                <flux:button href="{{ url('register') }}" variant="primary" class="!rounded-2xl !px-10 !py-4 text-base font-extrabold shadow-xl shadow-indigo-100">
                    Get Started Free
                </flux:button>
            </div>
        </div>
    </section>
</div>
@endsection

@push('scripts')
<script>
    const currencyMap = {
        'NG': { code: 'NGN', symbol: '₦', rate: 1439.37 },
        'GH': { code: 'GHS', symbol: '₵', rate: 13.5 },
        'KE': { code: 'KES', symbol: 'Ks', rate: 130 },
        'ZA': { code: 'ZAR', symbol: 'R', rate: 18 },
        'US': { code: 'USD', symbol: '$', rate: 1 },
        'default': { code: 'USD', symbol: '$', rate: 1 }
    };

    const basePrice = 39.00;
    
    function updateCurrency(code) {
        const currency = currencyMap[code] || currencyMap.default;
        const convertedPrice = (basePrice * currency.rate).toFixed(2);
        
        document.getElementById('pro-price-value').textContent = `${currency.symbol}${convertedPrice}`;
        document.getElementById('currency-display').textContent = currency.code;
    }

    // Auto-detect on load
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            updateCurrency(data.country_code);
        } catch (e) {
            updateCurrency('US');
        }
    });
</script>
@endpush
