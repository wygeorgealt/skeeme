<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Skeeme') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
    @yield('styles')
    <script>
        (function() {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const date = new Date();
                date.setTime(date.getTime() + (365*24*60*60*1000)); // 1 year
                const expires = "; expires=" + date.toUTCString();
                
                // Check if cookie exists and matches
                const match = document.cookie.match(new RegExp('(^| )user_timezone=([^;]+)'));
                if (!match || match[2] !== tz) {
                    document.cookie = "user_timezone=" + tz + expires + "; path=/; SameSite=Lax";
                    // If cookie was missing or different, we could reload, but let's avoid infinite loops.
                    // Ideally, the middleware picks it up on next request.
                }
            } catch(e) { console.error('Timezone detection failed', e); }
        })();
    </script>
</head>
<body class="bg-stone-900 text-white">
    @yield('content')
    
    <!-- KaTeX for Math Rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>

    @livewireScripts
    <script>
        document.addEventListener('livewire:initialized', () => {
            const renderMath = () => {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            };

            // Run on initial init
            renderMath();

            // Run on specific events
            Livewire.on('render-math', () => {
                setTimeout(renderMath, 100);
            });

            // Run on navigation
            document.addEventListener('livewire:navigated', () => {
                renderMath();
            });
        });
    </script>
        @fluxScripts
        

    @yield('scripts')
</body>
</html>
