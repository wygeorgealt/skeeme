<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- System Info -->
        <x-filament::card>
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                <x-filament::icon icon="heroicon-m-computer-desktop" class="w-5 h-5 text-gray-500" />
                System Information
            </h3>
            <div class="space-y-3">
                @foreach ($this->getSystemInfo() as $label => $value)
                    <div class="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
                        <span class="text-gray-500 font-medium">{{ $label }}</span>
                        <span class="font-mono text-gray-900 dark:text-white">{{ $value }}</span>
                    </div>
                @endforeach
            </div>
        </x-filament::card>

        <!-- Maintenance Tools -->
        <x-filament::card>
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                <x-filament::icon icon="heroicon-m-wrench-screwdriver" class="w-5 h-5 text-gray-500" />
                Maintenance Tools
            </h3>
            <div class="grid grid-cols-1 gap-4">
                <x-filament::button wire:click="clearCache" color="gray" icon="heroicon-m-bolt" icon-alias="panels::pages.optimization.actions.clear-cache">
                    Clear Application Cache
                </x-filament::button>
                
                <x-filament::button wire:click="clearConfig" color="gray" icon="heroicon-m-cog-6-tooth">
                    Refresh Config Cache
                </x-filament::button>

                <x-filament::button wire:click="clearView" color="gray" icon="heroicon-m-paint-brush">
                    Clear Compiled Views
                </x-filament::button>

                <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <x-filament::button wire:click="runOptimize" color="primary" icon="heroicon-m-rocket-launch" class="w-full">
                        Run Full Optimization
                    </x-filament::button>
                </div>
            </div>
        </x-filament::card>
    </div>
</x-filament-panels::page>
