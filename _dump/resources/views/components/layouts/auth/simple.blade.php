@props(['title'])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth" data-flux-appearance="light">
    <head>
        @include('partials.head', ['title' => $title])
        
        <!-- Google Fonts: Manrope -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
        
        <style>
            body {
                font-family: 'Manrope', sans-serif;
            }
            /* Force visible outlines for Inputs in Auth Card */
            [data-flux-input], [data-flux-control] {
                border: 1px solid #e2e8f0 !important; /* slate-200 */
                background-color: #f8fafc !important; /* slate-50 */
                border-radius: 0.75rem !important; /* rounded-xl */
            }
            [data-flux-input]:focus, [data-flux-control]:focus-within {
                border-color: #6366f1 !important; /* indigo-500 */
                background-color: #ffffff !important;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
            }
            /* Force Text Visibility */
            [data-flux-label], [data-flux-checkbox-label] {
                color: #475569 !important; /* slate-600 */
                font-weight: 500 !important;
            }
            a {
                color: #4f46e5 !important; /* indigo-600 */
            }
            a:hover {
                color: #4338ca !important; /* indigo-700 */
            }
            .text-gradient {
                background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        </style>
    </head>
    <body class="min-h-screen antialiased bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
        <!-- Abstract Background Elements (Premium) -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
             <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-slate-50/50"></div>
             <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
             <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        </div>

        <div class="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 p-4 md:p-6 text-center">
            <div class="flex w-full max-w-sm flex-col gap-4">
                <!-- Brand/Logo -->
                <a href="{{ route('home') }}" class="flex flex-col items-center justify-center gap-2 transition-transform duration-300 hover:scale-105">
                     <img src="{{ asset('images/logo.png') }}" alt="Skeeme Logo" class="h-8 w-auto filter brightness-0" />
                </a>

                <!-- Auth Container -->
                <div class="relative">
                    <div class="relative bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden text-left">
                        <!-- Subtitle/Slot Container -->
                        <div class="flex flex-col gap-4">
                            {{ $slot }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @fluxScripts
    </body>
</html>
