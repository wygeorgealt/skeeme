@extends('layouts.landing')

@section('content')
<div class="pt-32 pb-24 bg-white dark:bg-zinc-950 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
            <h1 class="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 tracking-tight">
                Seamless <span class="text-gradient">Integrations</span>
            </h1>
            <p class="text-lg text-zinc-600 dark:text-zinc-400">
                Skeeme connects with the tools you already use to create a unified, high-performance academic ecosystem.
            </p>
        </div>

        <!-- Integration Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Slack -->
            <div class="premium-card p-10 group" data-aos="fade-up" data-aos-delay="100">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <i class="fab fa-slack text-3xl text-[#4A154B]"></i>
                </div>
                <h3 class="text-xl font-bold mb-4 dark:text-zinc-100">Slack</h3>
                <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    Turn your workspace into an automated headquarters. Get real-time alerts for exam completions, attendance dips, and system health.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Automated Grading Alerts
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Live Class Pings
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Admin Health Reports
                    </li>
                </ul>
                @auth
                    <div class="mt-8">
                        <flux:button href="{{ route('integrations.redirect', 'slack') }}" variant="primary" size="sm" class="w-full !rounded-xl">Connect Slack</flux:button>
                    </div>
                @endauth
            </div>

            <!-- Zoom -->
            <div class="premium-card p-10 group" data-aos="fade-up" data-aos-delay="200">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <i class="fas fa-video text-3xl text-[#2D8CFF]"></i>
                </div>
                <h3 class="text-xl font-bold mb-4 dark:text-zinc-100">Zoom</h3>
                <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    The Virtual Classroom Hub. Start live sessions instantly and let automation handle the rest—from recording to student rewind.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> One-Click Join Now
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Automated Recording Sync
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Class Summary Archive
                    </li>
                </ul>
                @auth
                    <div class="mt-8">
                        <flux:button href="{{ route('integrations.redirect', 'zoom') }}" variant="primary" size="sm" class="w-full !rounded-xl">Connect Zoom</flux:button>
                    </div>
                @endauth
            </div>

            <!-- Google Calendar -->
            <div class="premium-card p-10 group" data-aos="fade-up" data-aos-delay="300">
                <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <i class="fas fa-calendar-alt text-3xl text-[#4285F4]"></i>
                </div>
                <h3 class="text-xl font-bold mb-4 dark:text-zinc-100">Google Calendar</h3>
                <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    Keep everyone on the same page. Synchronize exams, deadlines, and class schedules across students' personal calendars.
                </p>
                <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> 2-Way Schedule Sync
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Automated Reminders
                    </li>
                    <li class="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <i class="fas fa-check-circle text-indigo-500"></i> Resource Conflict Detection
                    </li>
                </ul>
            </div>
        </div>

        <!-- CTA -->
        <div class="mt-24 p-12 rounded-[2.5rem] bg-zinc-900 text-center relative overflow-hidden" data-aos="fade-up">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 opacity-50"></div>
            <h2 class="text-3xl font-bold text-white mb-6 relative z-10">Connect Your Entire School</h2>
            <p class="text-zinc-400 mb-10 max-w-2xl mx-auto relative z-10">Experience the power of a fully integrated academic platform and transform your school's management today.</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <flux:button href="{{ url('register') }}" variant="primary" class="!px-8 !py-3 !rounded-xl !font-bold">Get Started Free</flux:button>
                <flux:button href="{{ url('contact') }}" variant="ghost" class="!text-white hover:!bg-white/10 !px-8 !py-3 !rounded-xl !font-bold">Contact Sales</flux:button>
            </div>
        </div>
    </div>
</div>
@endsection
