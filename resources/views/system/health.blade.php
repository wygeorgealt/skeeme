<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skeeme | Vital Stats</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
    </style>
</head>
<body class="bg-[#050505] text-slate-300 min-h-screen flex flex-col items-center justify-center p-6">
    
    <div class="max-w-2xl w-full">
        <div class="flex items-center justify-between mb-12">
            <div>
                <h1 class="text-4xl font-extrabold text-white tracking-tight mb-2">Vital Stats</h1>
                <p class="text-slate-500 font-medium">Real-time system health audit</p>
            </div>
            <div class="px-4 py-2 rounded-full glass text-xs font-bold tracking-widest uppercase text-emerald-500 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Live
            </div>
        </div>

        @if(isset($stats['error']))
            <div class="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-8">
                <p class="font-bold mb-2">Critical Connection Error</p>
                <code class="text-xs opacity-80">{{ $stats['error'] }}</code>
            </div>
        @endif

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <!-- Connection Status -->
            <div class="p-8 rounded-[2rem] glass">
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Connection</p>
                <p class="text-3xl font-extrabold text-white mb-2">{{ $stats['status'] }}</p>
                <p class="text-sm font-medium text-slate-500">Latency: <span class="text-white">{{ number_format($stats['latency'], 2) }}ms</span></p>
            </div>

            <!-- Performance Verdict -->
            <div class="p-8 rounded-[2rem] glass">
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Verdict</p>
                <p class="text-3xl font-extrabold {{ $stats['verdict_class'] }} mb-2">{{ $stats['verdict'] }}</p>
                <p class="text-sm font-medium text-slate-500">Infrastructure health rating</p>
            </div>

            <!-- Queue Status -->
            <div class="p-8 rounded-[2rem] glass">
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Queue Status</p>
                <p class="text-3xl font-extrabold {{ $stats['queue_size'] > 50 ? 'text-rose-500' : ($stats['queue_size'] > 10 ? 'text-amber-500' : 'text-emerald-500') }} mb-2">
                    {{ $stats['queue_size'] }}
                </p>
                <p class="text-sm font-medium text-slate-500">Pending jobs (Healthy if near 0)</p>
            </div>
        </div>

        <!-- Latency Breakdown -->
        <div class="p-8 rounded-[2rem] glass mb-8">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">Latency Breakdown</p>
            <div class="space-y-6">
                <div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="font-semibold text-slate-400">Write (Put)</span>
                        <span class="font-bold text-white">{{ number_format($stats['write_latency'], 2) }}ms</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" style="width: {{ min(100, ($stats['write_latency'] / 10)) }}%"></div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="font-semibold text-slate-400">Read (Get)</span>
                        <span class="font-bold text-white">{{ number_format($stats['read_latency'], 2) }}ms</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full" style="width: {{ min(100, ($stats['read_latency'] / 10)) }}%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Metrics Table -->
        <div class="p-8 rounded-[2rem] glass">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Redis Node Stats</p>
            <div class="grid grid-cols-2 gap-y-4">
                @foreach($stats['info'] as $label => $value)
                    <div class="text-sm font-medium text-slate-500">{{ $label }}</div>
                    <div class="text-sm font-bold text-white text-right">{{ $value }}</div>
                @endforeach
            </div>
        </div>

        <p class="text-center mt-12 text-xs font-bold text-slate-700 tracking-widest uppercase">
            Confidential &bull; Skeeme Internal Diagnostics
        </p>
    </div>

</body>
</html>
