@extends('layouts.landing')

@section('content')
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[120px]"></div>
    </div>

    <!-- Feature Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center lg:text-left max-w-4xl">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Central Command</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Your school, <br> 
                    <span class="text-gradient">at a single glance.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                    Comprehensive insights into your school's operations with real-time data, interactive visualizations, and actionable metrics.
                </p>

                <div data-aos="fade-up" data-aos-delay="300" class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <flux:button href="{{ url('register') }}" variant="primary" class="!rounded-2xl !px-10 !py-4 font-extrabold">
                        Open Your Dashboard
                    </flux:button>
                </div>
            </div>
        </div>
    </section>

    <!-- Capabilities Grid -->
    <section class="relative z-10 pb-32">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="premium-card p-10" data-aos="fade-up">
                    <div class="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Performance Analytics</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Track individual and class-wide performance metrics, identify struggling students, and monitor learning progress in real-time.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Attendance Control</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">One-click attendance marking, AI-powered absence detection, automated parent notifications, and comprehensive reports.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Course Delivery</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Monitor course progress, lesson completion rates, student engagement, and course-specific metrics all in one place.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Role Based Views -->
    <section class="py-32 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
             <div class="flex flex-col lg:flex-row items-center gap-24">
                <div class="flex-1" data-aos="fade-right">
                    <h4 class="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">Adapts to your role <br>perfectly.</h4>
                    <p class="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                        The dashboard adapts to your role in the school system. From high-level financial overviews for admins to detailed student progress for lecturers.
                    </p>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div class="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase tracking-tighter shrink-0">ADM</div>
                            <span class="text-sm font-bold text-slate-700">School-wide analytics & financial management</span>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div class="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase tracking-tighter shrink-0">LEC</div>
                            <span class="text-sm font-bold text-slate-700">Course delivery & student performance tracking</span>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div class="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase tracking-tighter shrink-0">STU</div>
                            <span class="text-sm font-bold text-slate-700">Personal grades, progress, & study materials</span>
                        </div>
                    </div>
                </div>
                <div class="flex-1" data-aos="zoom-in">
                    <div class="premium-card p-2 relative group rotate-2">
                        <img src="{{ asset('landing/dashboard.svg') }}" alt="Dashboard Preview" class="w-full h-auto rounded-3xl relative z-10 shadow-2xl">
                        <div class="absolute -inset-4 bg-indigo-500/5 blur-2xl -z-10 group-hover:bg-indigo-500/10 transition-all"></div>
                    </div>
                </div>
             </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-32 relative overflow-hidden bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 data-aos="fade-up" class="text-4xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Unified data. <br> Faster decisions.
            </h2>
            <p data-aos="fade-up" data-aos-delay="100" class="text-lg lg:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                Ready to take control of your school's data? Get started with Skeeme's command center today.
            </p>
            <div data-aos="fade-up" data-aos-delay="200" class="flex justify-center">
                <flux:button href="{{ url('register') }}" variant="primary" class="!rounded-2xl !px-12 !py-4 text-base font-extrabold">
                    Start Managing
                </flux:button>
            </div>
        </div>
    </section>
</div>
@endsection
