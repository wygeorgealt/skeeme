<x-filament-panels::page>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <x-filament::button wire:click="loadLogs" icon="heroicon-m-arrow-path" color="gray" size="sm">
                    Refresh
                </x-filament::button>
                <x-filament::button 
                    wire:click="clearLogs" 
                    icon="heroicon-m-trash" 
                    color="danger" 
                    size="sm"
                    wire:confirm="Are you sure you want to clear the logs? This action cannot be undone."
                >
                    Clear Logs
                </x-filament::button>
            </div>
            <div class="text-xs text-gray-500 font-medium">
                Showing last 500 lines of laravel.log
            </div>
        </div>

        <div class="relative">
            <div class="absolute top-3 right-3 z-10">
                <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            </div>
            
            <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                <div class="flex items-center gap-2 mb-4">
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-2">Terminal — laravel.log</span>
                </div>

                <div 
                    class="font-mono text-sm text-zinc-300 overflow-auto max-h-[70vh] custom-scrollbar"
                    style="scrollbar-width: thin; scrollbar-color: #3f3f46 #18181b;"
                >
                    <pre class="whitespace-pre-wrap leading-relaxed">@if($logs){{ $logs }}@else<span class="text-zinc-500 italic">Logs are empty or haven't been generated yet.</span>@endif</pre>
                </div>
            </div>
        </div>
    </div>

    <style>
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #52525b;
        }
    </style>
</x-filament-panels::page>
