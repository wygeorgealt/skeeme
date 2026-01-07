<x-layouts.app.sidebar :title="$title ?? null">
    <flux:main>
        {{ $slot }}
    </flux:main>

    <!-- Skeemy AI Assistant (Disabled for now) -->
    {{-- @livewire('skeemy-assistant') --}}
</x-layouts.app.sidebar>

<!-- Global Loading Overlay for Tab Switching -->
