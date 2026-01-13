<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth" data-flux-appearance="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @include('partials.google-tag')
    
    <title>{{ $pageTitle ?? config('app.name', 'Skeeme') }}</title>

    <!-- Google Fonts: Manrope -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <!-- Meta Tags -->
    <meta name="description" content="{{ $pageDescription ?? 'Skeeme - Built for the future of education.' }}">
    <meta name="author" content="Skeeme">
    
    <!-- AOS for reveal animations -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
    @fluxAppearance

    <style>
        :root {
            --brand-primary: #4f46e5;
            --brand-secondary: #0ea5e9;
            --brand-gradient: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
            --glass-bg: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(255, 255, 255, 0.3);
            --premium-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
        }

        body {
            font-family: 'Manrope', sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
        }

        .glass-nav {
            background: rgba(255, 255, 255, 0.85); /* More opaque for pill */
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(226, 232, 240, 0.6); /* Full border */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); /* Subtle initial shadow */
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .glass-nav.scrolled {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: var(--premium-shadow), 0 0 0 1px rgba(0,0,0,0.02); /* Stronger shadow */
            padding-block: 0.75rem; /* Slightly tighten */
        }

        .text-gradient {
            background: var(--brand-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .premium-card {
            background: white;
            border: 1px solid #f1f5f9;
            border-radius: 24px;
            box-shadow: var(--premium-shadow);
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .premium-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.08);
            border-color: #e2e8f0;
        }

        /* 🌟 Premium White Flux Dropdown Override */
        [data-flux-menu] {
            background-color: white !important; /* Force White */
            border: 1px solid #f1f5f9 !important;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.02) !important;
            border-radius: 16px !important;
            padding: 8px !important;
        }

        [data-flux-menu-item] {
            color: #475569 !important; /* Slate 600 */
            font-weight: 600 !important;
            font-size: 0.9rem !important;
            border-radius: 8px !important;
            transition: all 0.2s ease !important;
        }

        [data-flux-menu-item]:hover, 
        [data-flux-menu-item][data-active] {
            background-color: #f8fafc !important; /* Slate 50 */
            color: #4f46e5 !important; /* Indigo 600 */
            border-color: #f1f5f9 !important;
        }

        [data-flux-menu-item] [data-flux-icon] {
            color: #94a3b8 !important; /* Slate 400 */
            transition: color 0.2s ease !important;
        }

        [data-flux-menu-item]:hover [data-flux-icon] {
            color: #4f46e5 !important; /* Indigo 600 */
        }
    </style>

    @stack('head')
</head>
<body class="antialiased selection:bg-indigo-100 selection:text-indigo-700">
    <!-- Premium Navigation (Floating Island) -->
    <header class="fixed top-6 left-0 right-0 mx-auto w-[95%] max-w-7xl z-50 glass-nav rounded-2xl py-3 transition-all duration-300 transform" id="main-nav">
        <div class="w-full px-6 flex items-center justify-between">
            <!-- Logo -->
            <a href="{{ url('/') }}" class="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
                <img src="{{ asset('images/logo.png') }}" alt="Skeeme" class="h-10 w-auto filter brightness-0">
            </a>

            <!-- Desktop Menu -->
            <nav class="hidden lg:flex items-center gap-1">
                <flux:dropdown>
                    <flux:button variant="ghost" class="!font-bold !text-sm !text-slate-900 hover:!text-indigo-600 !px-4 !py-2">
                        Features <flux:icon.chevron-down variant="micro" class="ml-1 opacity-50" />
                    </flux:button>
                    <flux:menu class="min-w-64 p-3 rounded-2xl shadow-2xl border-slate-100 bg-white" appearance="light">
                        <flux:menu.item href="{{ url('features/dashboard') }}" icon="squares-2x2">Admin Dashboard</flux:menu.item>
                        <flux:menu.item href="{{ url('features/analytics') }}" icon="chart-bar">Advanced Analytics</flux:menu.item>
                        <flux:menu.item href="{{ url('features/reports') }}" icon="document-text">Dynamic Reports</flux:menu.item>
                    </flux:menu>
                </flux:dropdown>

                <a href="{{ url('pricing') }}" class="px-4 py-2 font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors">Pricing</a>

                <flux:dropdown>
                    <flux:button variant="ghost" class="!font-bold !text-sm !text-slate-900 hover:!text-indigo-600 !px-4 !py-2">
                        Resources <flux:icon.chevron-down variant="micro" class="ml-1 opacity-50" />
                    </flux:button>
                    <flux:menu class="min-w-64 p-3 rounded-2xl shadow-2xl border-slate-100 bg-white" appearance="light">
                        <flux:menu.item href="{{ url('integrations') }}" icon="puzzle-piece">Integration</flux:menu.item>
                        <flux:menu.item href="{{ url('changelog') }}" icon="rocket-launch">Changelog</flux:menu.item>
                    </flux:menu>
                </flux:dropdown>
            </nav>

            <!-- Actions -->
            <div class="hidden lg:flex items-center gap-4">
                <flux:link href="{{ url('login') }}" class="font-bold text-sm text-slate-900 no-underline">Log in</flux:link>
                <flux:button href="{{ url('register') }}" variant="primary" class="!rounded-xl !px-6 !py-2.5 font-bold shadow-indigo-200">
                    Get Started Free
                </flux:button>
            </div>

            <!-- Mobile Toggle -->
            <button class="lg:hidden p-2 text-slate-900" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
                <flux:icon.bars-3 variant="outline" />
            </button>
        </div>

        <!-- Mobile Menu (Simplified for brevity) -->
        <div id="mobile-menu" class="hidden lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
            <div class="p-6 flex flex-col gap-4 text-center">
                <a href="{{ url('features/dashboard') }}" class="font-bold text-slate-600">Features</a>
                <a href="{{ url('pricing') }}" class="font-bold text-slate-600">Pricing</a>
                <div class="h-px bg-slate-100 my-2"></div>
                <flux:button href="{{ url('login') }}" variant="ghost" class="w-full">Log in</flux:button>
                <flux:button href="{{ url('register') }}" variant="primary" class="w-full">Get Started</flux:button>
            </div>
        </div>
    </header>

    <main>
        @yield('content')
    </main>

    <!-- Premium Footer -->
    <footer class="bg-slate-50 border-t border-slate-200 pt-24 pb-12">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <!-- Brand -->
                <div class="lg:col-span-1">
                    <img src="{{ asset('images/logo.png') }}" alt="Skeeme" class="h-10 mb-6 filter brightness-0">
                    <p class="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
                        Empowering the next generation of educators with AI-driven tools for smarter school management.
                    </p>
                    <div class="flex gap-4 mt-8">
                        <a href="#" class="text-slate-400 hover:text-indigo-600 transition-colors"><i class="fab fa-twitter text-lg"></i></a>
                        <a href="#" class="text-slate-400 hover:text-indigo-600 transition-colors"><i class="fab fa-linkedin text-lg"></i></a>
                        <a href="#" class="text-slate-400 hover:text-indigo-600 transition-colors"><i class="fab fa-github text-lg"></i></a>
                    </div>
                </div>

                <!-- Product -->
                <div>
                    <h4 class="text-slate-900 font-extrabold text-xs uppercase tracking-[0.2em] mb-6">Product</h4>
                    <ul class="space-y-4">
                        <li><flux:link href="{{ url('/') }}#features" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Features</flux:link></li>
                        <li><flux:link href="{{ url('pricing') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Pricing</flux:link></li>
                        <li><flux:link href="{{ url('integrations') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Integration</flux:link></li>
                        <li><flux:link href="{{ url('changelog') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Changelog</flux:link></li>
                    </ul>
                </div>

                <!-- Legal -->
                <div>
                    <h4 class="text-slate-900 font-extrabold text-xs uppercase tracking-[0.2em] mb-6">Legal</h4>
                    <ul class="space-y-4">
                        <li><flux:link href="{{ url('privacy') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Privacy Policy</flux:link></li>
                        <li><flux:link href="{{ url('terms') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Terms of Service</flux:link></li>
                    </ul>
                </div>

                <!-- Newsletter/Support -->
                <div>
                    <h4 class="text-slate-900 font-extrabold text-xs uppercase tracking-[0.2em] mb-6">Support</h4>
                    <ul class="space-y-4">
                        <li><flux:link href="{{ url('contact') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Contact Us</flux:link></li>
                        <li><flux:link href="{{ url('platform/documentation') }}" class="text-slate-500 hover:text-indigo-600 text-sm font-bold no-underline transition-colors">Help Center</flux:link></li>
                    </ul>
                </div>
            </div>

            <!-- Bottom -->
            <div class="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-slate-400 text-xs font-bold">© 2026 Skeeme Inc. All rights reserved.</p>
                <div class="flex items-center gap-2">
                    <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">System Operational</span>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic'
        });

        const nav = document.getElementById('main-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    </script>
    @livewireScripts
    @fluxScripts
    @stack('scripts')
    <x-cookie-consent />
</body>
</html>
