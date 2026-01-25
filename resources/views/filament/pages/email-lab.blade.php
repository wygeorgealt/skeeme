<x-filament-panels::page>
    <form wire:submit="sendTest">
        {{ $this->form }}

        <div class="mt-6 flex justify-end">
            <x-filament::button type="submit" icon="heroicon-m-paper-airplane">
                Send Test Email
            </x-filament::button>
        </div>
    </form>
</x-filament-panels::page>
