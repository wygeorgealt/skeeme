@extends('layouts.landing')

@section('content')
<div class="relative overflow-hidden bg-white">
    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
        <div class="absolute top-[15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]"></div>
        <div class="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
    </div>

    <!-- Feature Hero -->
    <section class="relative z-10 pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center lg:text-left max-w-4xl">
                <div data-aos="fade-up" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-8">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Precision Reporting</span>
                </div>
                
                <h1 data-aos="fade-up" data-aos-delay="100" class="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
                    Insights ready for <br> 
                    <span class="text-gradient">any stakeholder.</span>
                </h1>

                <p data-aos="fade-up" data-aos-delay="200" class="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                    Generate detailed reports on student progress, exam performance, attendance, and learning outcomes with professional formatting.
                </p>

                <div data-aos="fade-up" data-aos-delay="300" class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <flux:button href="{{ url('register') }}" variant="primary" class="!rounded-2xl !px-10 !py-4 font-extrabold shadow-xl shadow-emerald-100 border-emerald-600 !bg-emerald-600 hover:!bg-emerald-700">
                        Generate Your First Report
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
                    <div class="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Student Progress</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Individual reports showing exam performance, grades, mastery levels, and personalize growth recommendations.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Class Analytics</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Comprehensive class-wide performance analysis with score distributions, pass rates, and trend analysis.</p>
                </div>

                <div class="premium-card p-10" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-8">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-4">Attendance Logs</h3>
                    <p class="text-slate-500 font-medium leading-relaxed text-sm">Detailed attendance tracking with patterns, trends, and compliance documentation for all stakeholders.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Row -->
    <section class="py-32 bg-slate-50 border-y border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center max-w-3xl mx-auto mb-24">
                <h2 data-aos="fade-up" class="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Built for clarity</h2>
                <h3 data-aos="fade-up" data-aos-delay="100" class="text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need in a report.</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" data-aos="fade-up">
                    <div class="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><flux:icon.chart-bar variant="micro" /></div>
                    <div>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Visual Insight</h4>
                        <p class="text-xs text-slate-500 font-medium">Interactive charts that make complex data easy to understand at a glance.</p>
                    </div>
                </div>
                <div class="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="100">
                    <div class="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><flux:icon.arrow-down-tray variant="micro" /></div>
                    <div>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Multiple Formats</h4>
                        <p class="text-xs text-slate-500 font-medium">Export seamlessly as professional PDFs, CSVs for Excel, or view securely online.</p>
                    </div>
                </div>
                <div class="flex items-start gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm" data-aos="fade-up" data-aos-delay="200">
                    <div class="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><flux:icon.lock-closed variant="micro" /></div>
                    <div>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Secure Sharing</h4>
                        <p class="text-xs text-slate-500 font-medium">Role-based access ensures only authorized stakeholders see sensitive data.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-32 relative overflow-hidden bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 data-aos="fade-up" class="text-4xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Simple reports. <br> Better outcomes.
            </h2>
            <p data-aos="fade-up" data-aos-delay="100" class="text-lg lg:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                Join the educators using precision data to guide their school's success.
            </p>
            <div data-aos="fade-up" data-aos-delay="200" class="flex justify-center">
                <flux:button href="{{ url('register') }}" variant="primary" class="!rounded-2xl !px-12 !py-4 text-base font-extrabold !bg-emerald-600 border-emerald-600 hover:!bg-emerald-700">
                    Start Reporting Now
                </flux:button>
            </div>
        </div>
    </section>
</div>
@endsection
